import { ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { garantirPerfilUnico } from './perfil-unico.helper';

function criarPrismaMock(overrides: Partial<Record<string, unknown>> = {}) {
  return {
    atletaPerfil: { findUnique: jest.fn().mockResolvedValue(overrides.atleta ?? null) },
    responsavelPerfil: { findUnique: jest.fn().mockResolvedValue(overrides.responsavel ?? null) },
    empresarioPerfil: { findUnique: jest.fn().mockResolvedValue(overrides.empresario ?? null) },
    patrocinadorPerfil: { findUnique: jest.fn().mockResolvedValue(overrides.patrocinador ?? null) },
  } as unknown as PrismaService;
}

describe('garantirPerfilUnico', () => {
  it('não lança quando nenhum perfil existe', async () => {
    await expect(garantirPerfilUnico(criarPrismaMock(), 'usuario-1')).resolves.toBeUndefined();
  });

  it.each(['atleta', 'responsavel', 'empresario', 'patrocinador'])(
    'rejeita quando já existe perfil de %s',
    async (tipo) => {
      const prisma = criarPrismaMock({ [tipo]: { id: 'ja-existe' } });
      await expect(garantirPerfilUnico(prisma, 'usuario-1')).rejects.toBeInstanceOf(ConflictException);
    },
  );
});
