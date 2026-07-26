import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { StatusVinculoResponsavel } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';

export interface AcessoConversa {
  podeLer: boolean;
  podeEnviar: boolean;
}

@Injectable()
export class ChatService {
  constructor(private readonly prisma: PrismaService) {}

  async podeAcessar(usuarioId: string, conversaId: string): Promise<AcessoConversa> {
    const conversa = await this.prisma.conversa.findUnique({
      where: { id: conversaId },
      include: { match: true },
    });
    if (!conversa) return { podeLer: false, podeEnviar: false };

    const { match } = conversa;

    const atleta = await this.prisma.atletaPerfil.findUnique({ where: { id: match.atletaId } });
    if (atleta?.usuarioId === usuarioId) {
      return { podeLer: true, podeEnviar: true };
    }

    if (match.clubeId) {
      const membro = await this.prisma.membroClube.findFirst({
        where: { clubeId: match.clubeId, usuarioId, ativo: true },
      });
      if (membro) return { podeLer: true, podeEnviar: true };
    }
    if (match.empresarioId) {
      const empresario = await this.prisma.empresarioPerfil.findUnique({ where: { id: match.empresarioId } });
      if (empresario?.usuarioId === usuarioId) return { podeLer: true, podeEnviar: true };
    }
    if (match.patrocinadorId) {
      const patrocinador = await this.prisma.patrocinadorPerfil.findUnique({
        where: { id: match.patrocinadorId },
      });
      if (patrocinador?.usuarioId === usuarioId) return { podeLer: true, podeEnviar: true };
    }

    const responsavelAprovado = await this.prisma.vinculoResponsavelAtleta.findFirst({
      where: {
        atletaId: match.atletaId,
        status: StatusVinculoResponsavel.APROVADO,
        responsavel: { usuarioId },
      },
    });
    if (responsavelAprovado) {
      return { podeLer: true, podeEnviar: false };
    }

    return { podeLer: false, podeEnviar: false };
  }

  async listarMensagens(usuarioId: string, conversaId: string) {
    const acesso = await this.podeAcessar(usuarioId, conversaId);
    if (!acesso.podeLer) throw new ForbiddenException('Você não tem acesso a esta conversa.');

    return this.prisma.mensagem.findMany({
      where: { conversaId },
      orderBy: { criadoEm: 'asc' },
    });
  }

  async enviarMensagem(usuarioId: string, conversaId: string, conteudo: string) {
    const acesso = await this.podeAcessar(usuarioId, conversaId);
    if (!acesso.podeEnviar) {
      throw new ForbiddenException('Você não pode enviar mensagens nesta conversa.');
    }

    return this.prisma.mensagem.create({
      data: { conversaId, autorId: usuarioId, conteudo },
    });
  }

  async buscarConversa(conversaId: string) {
    const conversa = await this.prisma.conversa.findUnique({ where: { id: conversaId } });
    if (!conversa) throw new NotFoundException('Conversa não encontrada.');
    return conversa;
  }
}
