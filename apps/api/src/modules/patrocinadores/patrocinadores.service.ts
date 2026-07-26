import { Injectable, NotFoundException } from '@nestjs/common';
import { garantirPerfilUnico } from '../../common/perfil-unico.helper';
import { AtualizarVerificacaoDto } from '../../common/dto/atualizar-verificacao.dto';
import { PrismaService } from '../../prisma/prisma.service';
import { CreatePatrocinadorDto } from './dto/create-patrocinador.dto';

@Injectable()
export class PatrocinadoresService {
  constructor(private readonly prisma: PrismaService) {}

  async criarPerfil(usuarioId: string, dto: CreatePatrocinadorDto) {
    await garantirPerfilUnico(this.prisma, usuarioId);
    return this.prisma.patrocinadorPerfil.create({ data: { usuarioId, ...dto } });
  }

  async buscarPerfilProprio(usuarioId: string) {
    const patrocinador = await this.prisma.patrocinadorPerfil.findUnique({ where: { usuarioId } });
    if (!patrocinador) throw new NotFoundException('Perfil de patrocinador não encontrado.');
    return patrocinador;
  }

  async atualizarVerificacao(id: string, dto: AtualizarVerificacaoDto) {
    const patrocinador = await this.prisma.patrocinadorPerfil.findUnique({ where: { id } });
    if (!patrocinador) throw new NotFoundException('Perfil de patrocinador não encontrado.');

    return this.prisma.patrocinadorPerfil.update({
      where: { id },
      data: { statusVerificacao: dto.status },
    });
  }
}
