import { Injectable, NotFoundException } from '@nestjs/common';
import { garantirPerfilUnico } from '../../common/perfil-unico.helper';
import { AtualizarVerificacaoDto } from '../../common/dto/atualizar-verificacao.dto';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateEmpresarioDto } from './dto/create-empresario.dto';

@Injectable()
export class EmpresariosService {
  constructor(private readonly prisma: PrismaService) {}

  async criarPerfil(usuarioId: string, dto: CreateEmpresarioDto) {
    await garantirPerfilUnico(this.prisma, usuarioId);
    return this.prisma.empresarioPerfil.create({ data: { usuarioId, ...dto } });
  }

  async buscarPerfilProprio(usuarioId: string) {
    const empresario = await this.prisma.empresarioPerfil.findUnique({ where: { usuarioId } });
    if (!empresario) throw new NotFoundException('Perfil de empresário não encontrado.');
    return empresario;
  }

  async atualizarVerificacao(id: string, dto: AtualizarVerificacaoDto) {
    const empresario = await this.prisma.empresarioPerfil.findUnique({ where: { id } });
    if (!empresario) throw new NotFoundException('Perfil de empresário não encontrado.');

    return this.prisma.empresarioPerfil.update({
      where: { id },
      data: { statusVerificacao: dto.status },
    });
  }
}
