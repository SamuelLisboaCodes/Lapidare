import { ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export async function garantirPerfilUnico(prisma: PrismaService, usuarioId: string): Promise<void> {
  const [atleta, responsavel, empresario, patrocinador] = await Promise.all([
    prisma.atletaPerfil.findUnique({ where: { usuarioId } }),
    prisma.responsavelPerfil.findUnique({ where: { usuarioId } }),
    prisma.empresarioPerfil.findUnique({ where: { usuarioId } }),
    prisma.patrocinadorPerfil.findUnique({ where: { usuarioId } }),
  ]);

  if (atleta || responsavel || empresario || patrocinador) {
    throw new ConflictException('Este usuário já tem um perfil (atleta, responsável, empresário ou patrocinador).');
  }
}
