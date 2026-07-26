import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { PapelClube, SeloCodigo, StatusVinculoClube } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { AtualizarVerificacaoDto } from '../../common/dto/atualizar-verificacao.dto';
import { SelosService } from '../selos/selos.service';
import { ConvidarMembroDto } from './dto/convidar-membro.dto';
import { CreateClubeDto } from './dto/create-clube.dto';

@Injectable()
export class ClubesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly selosService: SelosService,
  ) {}

  criarClube(usuarioId: string, dto: CreateClubeDto) {
    return this.prisma.$transaction(async (tx) => {
      const clube = await tx.clube.create({ data: dto });
      await tx.membroClube.create({
        data: { clubeId: clube.id, usuarioId, papel: PapelClube.ADMIN },
      });
      return clube;
    });
  }

  async buscarPorId(id: string) {
    const clube = await this.prisma.clube.findUnique({ where: { id } });
    if (!clube) throw new NotFoundException('Clube não encontrado.');
    return clube;
  }

  async listarMinhasClubes(usuarioId: string) {
    const membros = await this.prisma.membroClube.findMany({
      where: { usuarioId, ativo: true },
      include: { clube: true },
    });
    return membros.map((membro) => ({ ...membro.clube, meuPapel: membro.papel }));
  }

  async convidarMembro(clubeId: string, dto: ConvidarMembroDto) {
    await this.buscarPorId(clubeId);

    const usuario = await this.prisma.usuario.findUnique({ where: { email: dto.email } });
    if (!usuario) {
      throw new NotFoundException(
        'Nenhuma conta encontrada com esse e-mail. Peça para a pessoa se cadastrar em /auth/register.',
      );
    }

    const jaEhMembro = await this.prisma.membroClube.findFirst({
      where: { clubeId, usuarioId: usuario.id },
    });
    if (jaEhMembro) {
      throw new ConflictException('Esse usuário já é membro deste clube.');
    }

    return this.prisma.membroClube.create({
      data: { clubeId, usuarioId: usuario.id, papel: dto.papel ?? PapelClube.MEMBRO },
    });
  }

  listarMembros(clubeId: string) {
    return this.prisma.membroClube.findMany({ where: { clubeId, ativo: true } });
  }

  async atualizarVerificacao(clubeId: string, dto: AtualizarVerificacaoDto) {
    await this.buscarPorId(clubeId);
    return this.prisma.clube.update({ where: { id: clubeId }, data: { statusVerificacao: dto.status } });
  }

  listarVinculos(clubeId: string) {
    return this.prisma.vinculoAtletaClube.findMany({ where: { clubeId, status: StatusVinculoClube.ATIVO } });
  }

  async confirmarVinculoAtleta(clubeId: string, vinculoId: string) {
    const vinculo = await this.prisma.vinculoAtletaClube.findUnique({ where: { id: vinculoId } });
    if (!vinculo || vinculo.clubeId !== clubeId) {
      throw new NotFoundException('Vínculo não encontrado neste clube.');
    }

    const atualizado = await this.prisma.vinculoAtletaClube.update({
      where: { id: vinculoId },
      data: { confirmadoPeloClube: true },
    });

    await this.selosService.conceder(vinculo.atletaId, SeloCodigo.VINCULO_CLUBE_CONFIRMADO);

    return atualizado;
  }
}
