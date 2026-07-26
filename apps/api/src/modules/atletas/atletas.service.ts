import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  CategoriaAtleta,
  StatusVinculoClube,
  StatusVinculoResponsavel,
  StatusVisibilidadeAtleta,
} from '@prisma/client';
import {
  CAMPOS_OPCIONAIS_COMPLETUDE,
  contarCamposPreenchidos,
} from '../../common/atleta-completude';
import { garantirPerfilUnico } from '../../common/perfil-unico.helper';
import { PrismaService } from '../../prisma/prisma.service';
import { SelosService } from '../selos/selos.service';
import { BuscarAtletasDto } from './dto/buscar-atletas.dto';
import { CreateAtletaDto } from './dto/create-atleta.dto';
import { SolicitarVinculoClubeDto } from './dto/solicitar-vinculo-clube.dto';
import { SolicitarVinculoDto } from './dto/solicitar-vinculo.dto';
import { UpdateAtletaDto } from './dto/update-atleta.dto';

const TOTAL_SELOS_POSSIVEIS = 4;

/**
 * Score heurístico de ranking (RN-06 / ADR 0005) — calculado em memória
 * após o findMany, não em SQL cru (ver nota de implementação na ADR 0005).
 * Inclui completude, selos (LAP-046) e recência.
 */
function calcularScoreRanking(atleta: {
  alturaCm: number | null;
  envergaduraCm: number | null;
  alcanceAtaqueCm: number | null;
  alcanceBloqueioCm: number | null;
  bio: string | null;
  criadoEm: Date;
  _count: { midias: number; selos: number };
}): number {
  const camposPreenchidos = contarCamposPreenchidos(atleta);
  const temMidia = atleta._count.midias > 0 ? 1 : 0;
  const completude = (camposPreenchidos + temMidia) / (CAMPOS_OPCIONAIS_COMPLETUDE.length + 1);

  const selosNormalizados = Math.min(atleta._count.selos / TOTAL_SELOS_POSSIVEIS, 1);

  const diasDesdeCriacao = (Date.now() - atleta.criadoEm.getTime()) / (1000 * 60 * 60 * 24);
  const recencia = 1 / (1 + Math.max(0, diasDesdeCriacao));

  return 0.5 * completude + 0.2 * selosNormalizados + 0.3 * recencia;
}

function calcularIdade(dataNascimento: Date): number {
  const hoje = new Date();
  let idade = hoje.getFullYear() - dataNascimento.getFullYear();
  const aniversarioAindaNaoChegou =
    hoje.getMonth() < dataNascimento.getMonth() ||
    (hoje.getMonth() === dataNascimento.getMonth() && hoje.getDate() < dataNascimento.getDate());
  if (aniversarioAindaNaoChegou) idade -= 1;
  return idade;
}

@Injectable()
export class AtletasService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly selosService: SelosService,
  ) {}

  async criarPerfil(usuarioId: string, dto: CreateAtletaDto) {
    await garantirPerfilUnico(this.prisma, usuarioId);

    const dataNascimento = new Date(dto.dataNascimento);
    const statusVisibilidade = this.calcularStatusVisibilidade({
      dataNascimento,
      categoria: dto.categoria,
      temVinculoAprovado: false,
      statusAnterior: undefined,
    });

    const atleta = await this.prisma.atletaPerfil.create({
      data: {
        usuarioId,
        nome: dto.nome,
        dataNascimento,
        sexo: dto.sexo,
        cidade: dto.cidade,
        estado: dto.estado,
        posicao: dto.posicao,
        categoria: dto.categoria,
        alturaCm: dto.alturaCm,
        envergaduraCm: dto.envergaduraCm,
        alcanceAtaqueCm: dto.alcanceAtaqueCm,
        alcanceBloqueioCm: dto.alcanceBloqueioCm,
        bio: dto.bio,
        statusVisibilidade,
      },
    });

    await this.selosService.avaliarPerfil(atleta.id);

    return atleta;
  }

  async buscarPerfilProprio(usuarioId: string) {
    const atleta = await this.prisma.atletaPerfil.findUnique({ where: { usuarioId } });
    if (!atleta) throw new NotFoundException('Perfil de atleta não encontrado.');
    return atleta;
  }

  async atualizarPerfil(usuarioId: string, dto: UpdateAtletaDto) {
    const atleta = await this.buscarPerfilProprio(usuarioId);

    const dataNascimento = dto.dataNascimento ? new Date(dto.dataNascimento) : atleta.dataNascimento;
    const categoria = dto.categoria ?? atleta.categoria;
    const temVinculoAprovado = await this.temVinculoAprovado(atleta.id);

    const statusVisibilidade = this.calcularStatusVisibilidade({
      dataNascimento,
      categoria,
      temVinculoAprovado,
      statusAnterior: atleta.statusVisibilidade,
    });

    const atualizado = await this.prisma.atletaPerfil.update({
      where: { id: atleta.id },
      data: {
        ...dto,
        dataNascimento,
        statusVisibilidade,
      },
    });

    await this.selosService.avaliarPerfil(atleta.id);

    return atualizado;
  }

  async buscarPorId(id: string, requisitanteUsuarioId: string) {
    const atleta = await this.prisma.atletaPerfil.findUnique({ where: { id } });
    if (!atleta) throw new NotFoundException('Perfil não encontrado.');

    if (atleta.usuarioId === requisitanteUsuarioId) return atleta;
    if (atleta.statusVisibilidade === StatusVisibilidadeAtleta.VISIVEL) return atleta;

    const responsavelAprovado = await this.prisma.vinculoResponsavelAtleta.findFirst({
      where: {
        atletaId: atleta.id,
        status: StatusVinculoResponsavel.APROVADO,
        responsavel: { usuarioId: requisitanteUsuarioId },
      },
    });
    if (responsavelAprovado) return atleta;

    throw new NotFoundException('Perfil não encontrado.');
  }

  async solicitarVinculoResponsavel(usuarioId: string, dto: SolicitarVinculoDto) {
    const atleta = await this.buscarPerfilProprio(usuarioId);

    const usuarioResponsavel = await this.prisma.usuario.findUnique({
      where: { email: dto.email },
      include: { responsavelPerfil: true },
    });

    if (!usuarioResponsavel) {
      throw new NotFoundException(
        'Nenhuma conta encontrada com esse e-mail. Peça para o responsável se cadastrar em /auth/register.',
      );
    }
    if (!usuarioResponsavel.responsavelPerfil) {
      throw new BadRequestException(
        'Essa conta ainda não completou o cadastro de responsável (POST /responsaveis/me).',
      );
    }

    const vinculoExistente = await this.prisma.vinculoResponsavelAtleta.findFirst({
      where: {
        atletaId: atleta.id,
        responsavelId: usuarioResponsavel.responsavelPerfil.id,
        status: { in: [StatusVinculoResponsavel.PENDENTE, StatusVinculoResponsavel.APROVADO] },
      },
    });
    if (vinculoExistente) {
      throw new ConflictException('Já existe um vínculo pendente ou aprovado com esse responsável.');
    }

    return this.prisma.vinculoResponsavelAtleta.create({
      data: {
        atletaId: atleta.id,
        responsavelId: usuarioResponsavel.responsavelPerfil.id,
        tipoRelacao: dto.tipoRelacao,
      },
    });
  }

  async listarVinculos(usuarioId: string) {
    const atleta = await this.buscarPerfilProprio(usuarioId);
    return this.prisma.vinculoResponsavelAtleta.findMany({ where: { atletaId: atleta.id } });
  }

  async solicitarVinculoClube(usuarioId: string, dto: SolicitarVinculoClubeDto) {
    const atleta = await this.buscarPerfilProprio(usuarioId);

    const clube = await this.prisma.clube.findUnique({ where: { id: dto.clubeId } });
    if (!clube) throw new NotFoundException('Clube não encontrado.');

    const vinculoAtivo = await this.prisma.vinculoAtletaClube.findFirst({
      where: { atletaId: atleta.id, clubeId: dto.clubeId, status: StatusVinculoClube.ATIVO },
    });
    if (vinculoAtivo) {
      throw new ConflictException('Já existe um vínculo ativo com esse clube.');
    }

    return this.prisma.vinculoAtletaClube.create({
      data: { atletaId: atleta.id, clubeId: dto.clubeId, tipoVinculo: dto.tipoVinculo },
    });
  }

  async listarVinculosClube(usuarioId: string) {
    const atleta = await this.buscarPerfilProprio(usuarioId);
    return this.prisma.vinculoAtletaClube.findMany({ where: { atletaId: atleta.id } });
  }

  async seguirClube(usuarioId: string, clubeId: string) {
    const atleta = await this.buscarPerfilProprio(usuarioId);

    const clube = await this.prisma.clube.findUnique({ where: { id: clubeId } });
    if (!clube) throw new NotFoundException('Clube não encontrado.');

    const jaSegue = await this.prisma.seguidorClube.findUnique({
      where: { atletaId_clubeId: { atletaId: atleta.id, clubeId } },
    });
    if (jaSegue) throw new ConflictException('Você já segue esse clube.');

    return this.prisma.seguidorClube.create({ data: { atletaId: atleta.id, clubeId } });
  }

  async deixarDeSeguir(usuarioId: string, clubeId: string) {
    const atleta = await this.buscarPerfilProprio(usuarioId);

    const seguindo = await this.prisma.seguidorClube.findUnique({
      where: { atletaId_clubeId: { atletaId: atleta.id, clubeId } },
    });
    if (!seguindo) throw new NotFoundException('Você não segue esse clube.');

    await this.prisma.seguidorClube.delete({ where: { id: seguindo.id } });
  }

  async listarClubesSeguidos(usuarioId: string) {
    const atleta = await this.buscarPerfilProprio(usuarioId);
    return this.prisma.seguidorClube.findMany({ where: { atletaId: atleta.id }, include: { clube: true } });
  }

  async buscar(filtros: BuscarAtletasDto) {
    const candidatos = await this.prisma.atletaPerfil.findMany({
      where: {
        statusVisibilidade: StatusVisibilidadeAtleta.VISIVEL,
        posicao: filtros.posicao,
        categoria: filtros.categoria,
        cidade: filtros.cidade,
        estado: filtros.estado,
      },
      include: { _count: { select: { midias: true, selos: true } } },
    });

    return candidatos
      .map((atleta) => ({ ...atleta, _score: calcularScoreRanking(atleta) }))
      .sort((a, b) => b._score - a._score);
  }

  async listarCandidaturas(usuarioId: string) {
    const atleta = await this.buscarPerfilProprio(usuarioId);
    return this.prisma.candidaturaPeneira.findMany({
      where: { atletaId: atleta.id },
      include: { peneira: true },
    });
  }

  async listarSelos(usuarioId: string) {
    const atleta = await this.buscarPerfilProprio(usuarioId);
    return this.selosService.listarPorAtleta(atleta.id);
  }

  async recalcularVisibilidade(atletaId: string) {
    const atleta = await this.prisma.atletaPerfil.findUnique({ where: { id: atletaId } });
    if (!atleta) return;

    const temVinculoAprovado = await this.temVinculoAprovado(atletaId);
    const statusVisibilidade = this.calcularStatusVisibilidade({
      dataNascimento: atleta.dataNascimento,
      categoria: atleta.categoria,
      temVinculoAprovado,
      statusAnterior: atleta.statusVisibilidade,
    });

    if (statusVisibilidade !== atleta.statusVisibilidade) {
      await this.prisma.atletaPerfil.update({ where: { id: atletaId }, data: { statusVisibilidade } });
    }
  }

  private async temVinculoAprovado(atletaId: string): Promise<boolean> {
    const vinculo = await this.prisma.vinculoResponsavelAtleta.findFirst({
      where: { atletaId, status: StatusVinculoResponsavel.APROVADO },
    });
    return Boolean(vinculo);
  }

  /**
   * Implementa docs/04-seguranca-lgpd.md §5: categoria de base sempre exige
   * aprovação do responsável, mesmo que a idade declarada indique
   * maioridade. A exceção "clube confirma maioridade" (VinculoAtletaClube)
   * só entra no Bloco 3 — deliberadamente não implementada aqui.
   */
  private calcularStatusVisibilidade(params: {
    dataNascimento: Date;
    categoria: CategoriaAtleta;
    temVinculoAprovado: boolean;
    statusAnterior: StatusVisibilidadeAtleta | undefined;
  }): StatusVisibilidadeAtleta {
    const exigeAprovacao =
      calcularIdade(params.dataNascimento) < 18 || params.categoria !== CategoriaAtleta.ADULTO;

    if (!exigeAprovacao) return StatusVisibilidadeAtleta.VISIVEL;
    if (params.temVinculoAprovado) return StatusVisibilidadeAtleta.VISIVEL;

    return params.statusAnterior === StatusVisibilidadeAtleta.VISIVEL
      ? StatusVisibilidadeAtleta.OCULTO
      : StatusVisibilidadeAtleta.PENDENTE_APROVACAO;
  }
}
