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
import { garantirPerfilUnico } from '../../common/perfil-unico.helper';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateAtletaDto } from './dto/create-atleta.dto';
import { SolicitarVinculoClubeDto } from './dto/solicitar-vinculo-clube.dto';
import { SolicitarVinculoDto } from './dto/solicitar-vinculo.dto';
import { UpdateAtletaDto } from './dto/update-atleta.dto';

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
  constructor(private readonly prisma: PrismaService) {}

  async criarPerfil(usuarioId: string, dto: CreateAtletaDto) {
    await garantirPerfilUnico(this.prisma, usuarioId);

    const dataNascimento = new Date(dto.dataNascimento);
    const statusVisibilidade = this.calcularStatusVisibilidade({
      dataNascimento,
      categoria: dto.categoria,
      temVinculoAprovado: false,
      statusAnterior: undefined,
    });

    return this.prisma.atletaPerfil.create({
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

    return this.prisma.atletaPerfil.update({
      where: { id: atleta.id },
      data: {
        ...dto,
        dataNascimento,
        statusVisibilidade,
      },
    });
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
