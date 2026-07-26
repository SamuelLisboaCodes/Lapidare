import { ConflictException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { Peneira, StatusPeneira, StatusVisibilidadeAtleta } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { AtualizarCandidaturaDto } from './dto/atualizar-candidatura.dto';
import { CreatePeneiraDto } from './dto/create-peneira.dto';
import { ListarPeneirasDto } from './dto/listar-peneiras.dto';

@Injectable()
export class PeneirasService {
  constructor(private readonly prisma: PrismaService) {}

  async criar(clubeId: string, dto: CreatePeneiraDto) {
    const peneira = await this.prisma.peneira.create({
      data: {
        clubeId,
        titulo: dto.titulo,
        categoria: dto.categoria,
        posicaoAlvo: dto.posicaoAlvo,
        dataEvento: new Date(dto.dataEvento),
        local: dto.local,
        descricao: dto.descricao,
      },
    });

    await this.notificarSeguidoresCompativeis(peneira);

    return peneira;
  }

  /** Implementa LAP-045 / RN-08 (docs/02-prd-mvp.md). */
  private async notificarSeguidoresCompativeis(peneira: Peneira) {
    const seguidores = await this.prisma.seguidorClube.findMany({
      where: {
        clubeId: peneira.clubeId,
        atleta: {
          categoria: peneira.categoria,
          ...(peneira.posicaoAlvo ? { posicao: peneira.posicaoAlvo } : {}),
        },
      },
      include: { atleta: true },
    });

    await Promise.all(
      seguidores.map((seguidor) =>
        this.prisma.notificacao.create({
          data: { usuarioId: seguidor.atleta.usuarioId, tipo: 'NOVA_PENEIRA', referenciaId: peneira.id },
        }),
      ),
    );
  }

  async buscarPorId(id: string) {
    const peneira = await this.prisma.peneira.findUnique({ where: { id } });
    if (!peneira) throw new NotFoundException('Peneira não encontrada.');
    return peneira;
  }

  listarAbertas(filtros: ListarPeneirasDto) {
    return this.prisma.peneira.findMany({
      where: {
        status: StatusPeneira.ABERTA,
        categoria: filtros.categoria,
        posicaoAlvo: filtros.posicaoAlvo,
      },
      include: { clube: true },
    });
  }

  listarDoClube(clubeId: string) {
    return this.prisma.peneira.findMany({ where: { clubeId } });
  }

  async candidatar(usuarioId: string, peneiraId: string) {
    const peneira = await this.buscarPorId(peneiraId);

    const atleta = await this.prisma.atletaPerfil.findUnique({ where: { usuarioId } });
    if (!atleta) {
      throw new NotFoundException('Crie um perfil de atleta antes de se candidatar (POST /atletas/me).');
    }
    if (atleta.statusVisibilidade !== StatusVisibilidadeAtleta.VISIVEL) {
      throw new ForbiddenException(
        'Seu perfil ainda não está visível — a candidatura só é possível após a aprovação do responsável (se aplicável).',
      );
    }

    const candidaturaExistente = await this.prisma.candidaturaPeneira.findUnique({
      where: { peneiraId_atletaId: { peneiraId: peneira.id, atletaId: atleta.id } },
    });
    if (candidaturaExistente) {
      throw new ConflictException('Você já se candidatou a esta peneira.');
    }

    return this.prisma.candidaturaPeneira.create({
      data: { peneiraId: peneira.id, atletaId: atleta.id },
    });
  }

  async listarCandidaturas(clubeId: string, peneiraId: string) {
    const peneira = await this.buscarPorId(peneiraId);
    if (peneira.clubeId !== clubeId) {
      throw new NotFoundException('Peneira não encontrada neste clube.');
    }

    return this.prisma.candidaturaPeneira.findMany({
      where: { peneiraId },
      include: { atleta: true },
    });
  }

  async atualizarCandidatura(
    clubeId: string,
    peneiraId: string,
    candidaturaId: string,
    dto: AtualizarCandidaturaDto,
  ) {
    const peneira = await this.buscarPorId(peneiraId);
    if (peneira.clubeId !== clubeId) {
      throw new NotFoundException('Peneira não encontrada neste clube.');
    }

    const candidatura = await this.prisma.candidaturaPeneira.findUnique({ where: { id: candidaturaId } });
    if (!candidatura || candidatura.peneiraId !== peneiraId) {
      throw new NotFoundException('Candidatura não encontrada nesta peneira.');
    }

    return this.prisma.candidaturaPeneira.update({
      where: { id: candidaturaId },
      data: { status: dto.status },
    });
  }
}
