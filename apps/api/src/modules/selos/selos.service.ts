import { Injectable } from '@nestjs/common';
import { SeloCodigo } from '@prisma/client';
import { perfilTemTodosCamposOpcionais } from '../../common/atleta-completude';
import { PrismaService } from '../../prisma/prisma.service';

const NOME_SELO: Record<SeloCodigo, string> = {
  [SeloCodigo.PERFIL_COMPLETO]: 'Perfil completo',
  [SeloCodigo.VIDEO_ENVIADO]: 'Vídeo enviado',
  [SeloCodigo.VINCULO_CLUBE_CONFIRMADO]: 'Vínculo de clube confirmado',
  [SeloCodigo.RESPONSAVEL_VALIDADO]: 'Responsável validado',
};

@Injectable()
export class SelosService {
  constructor(private readonly prisma: PrismaService) {}

  async conceder(atletaId: string, codigo: SeloCodigo) {
    const selo = await this.buscarOuCriarSelo(codigo);

    const jaConcedido = await this.prisma.atletaSelo.findUnique({
      where: { atletaId_seloId: { atletaId, seloId: selo.id } },
    });
    if (jaConcedido) return jaConcedido;

    return this.prisma.atletaSelo.create({ data: { atletaId, seloId: selo.id } });
  }

  /** Reavalia os selos calculáveis a partir do próprio perfil (sem depender de eventos externos). */
  async avaliarPerfil(atletaId: string) {
    const atleta = await this.prisma.atletaPerfil.findUnique({
      where: { id: atletaId },
      include: { _count: { select: { midias: true } } },
    });
    if (!atleta) return;

    if (perfilTemTodosCamposOpcionais(atleta)) {
      await this.conceder(atletaId, SeloCodigo.PERFIL_COMPLETO);
    }
    if (atleta._count.midias > 0) {
      await this.conceder(atletaId, SeloCodigo.VIDEO_ENVIADO);
    }
  }

  listarPorAtleta(atletaId: string) {
    return this.prisma.atletaSelo.findMany({ where: { atletaId }, include: { selo: true } });
  }

  private async buscarOuCriarSelo(codigo: SeloCodigo) {
    const existente = await this.prisma.selo.findUnique({ where: { codigo } });
    if (existente) return existente;

    return this.prisma.selo.create({ data: { codigo, nome: NOME_SELO[codigo] } });
  }
}
