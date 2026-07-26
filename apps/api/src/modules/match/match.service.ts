import { ConflictException, Injectable } from '@nestjs/common';
import { DirecaoInteresse, StatusVinculoResponsavel } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { campoAtor, TipoAtor } from './tipo-ator';

@Injectable()
export class MatchService {
  constructor(private readonly prisma: PrismaService) {}

  async registrarInteresse(
    atletaId: string,
    atorTipo: TipoAtor,
    atorId: string,
    direcao: DirecaoInteresse,
  ) {
    const campo = campoAtor(atorTipo);
    const whereAtor = { [campo]: atorId };

    const existente = await this.prisma.interesse.findFirst({
      where: { atletaId, direcao, ...whereAtor },
    });
    if (existente) {
      throw new ConflictException('Interesse já registrado.');
    }

    const interesse = await this.prisma.interesse.create({
      data: { atletaId, direcao, [campo]: atorId },
    });

    const direcaoOposta =
      direcao === DirecaoInteresse.ATOR_PARA_ATLETA
        ? DirecaoInteresse.ATLETA_PARA_ATOR
        : DirecaoInteresse.ATOR_PARA_ATLETA;

    const reciproco = await this.prisma.interesse.findFirst({
      where: { atletaId, direcao: direcaoOposta, ...whereAtor },
    });

    if (!reciproco) {
      return { interesse, match: null };
    }

    const matchExistente = await this.prisma.match.findFirst({ where: { atletaId, ...whereAtor } });
    if (matchExistente) {
      return { interesse, match: matchExistente };
    }

    const match = await this.criarMatchComConversa(atletaId, campo, atorId);
    await this.notificarResponsaveisSeMenor(atletaId, match.id);

    return { interesse, match };
  }

  listarPorAtleta(atletaId: string) {
    return this.prisma.match.findMany({ where: { atletaId }, include: { conversa: true } });
  }

  listarPorAtor(atorTipo: TipoAtor, atorId: string) {
    const campo = campoAtor(atorTipo);
    return this.prisma.match.findMany({ where: { [campo]: atorId }, include: { conversa: true } });
  }

  private async criarMatchComConversa(
    atletaId: string,
    campo: 'clubeId' | 'empresarioId' | 'patrocinadorId',
    atorId: string,
  ) {
    return this.prisma.$transaction(async (tx) => {
      const match = await tx.match.create({ data: { atletaId, [campo]: atorId } });
      await tx.conversa.create({ data: { matchId: match.id } });
      return match;
    });
  }

  /** Implementa LAP-053 / docs/04-seguranca-lgpd.md §8. */
  private async notificarResponsaveisSeMenor(atletaId: string, matchId: string) {
    const vinculos = await this.prisma.vinculoResponsavelAtleta.findMany({
      where: { atletaId, status: StatusVinculoResponsavel.APROVADO },
      include: { responsavel: true },
    });

    await Promise.all(
      vinculos.map((vinculo) =>
        this.prisma.notificacao.create({
          data: { usuarioId: vinculo.responsavel.usuarioId, tipo: 'MATCH', referenciaId: matchId },
        }),
      ),
    );
  }
}
