import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { PapelClube } from '@prisma/client';
import { PrismaService } from '../../../prisma/prisma.service';
import { ClubeAdminGuard } from './clube-admin.guard';

function criarContextoFake(usuarioId: string, clubeId: string): ExecutionContext {
  return {
    switchToHttp: () => ({
      getRequest: () => ({ user: { id: usuarioId }, params: { id: clubeId } }),
    }),
  } as unknown as ExecutionContext;
}

describe('ClubeAdminGuard', () => {
  it('permite quando o usuário é ADMIN do clube', async () => {
    const prisma = { membroClube: { findFirst: jest.fn().mockResolvedValue({ papel: PapelClube.ADMIN }) } };
    const guard = new ClubeAdminGuard(prisma as unknown as PrismaService);

    await expect(guard.canActivate(criarContextoFake('usuario-1', 'clube-1'))).resolves.toBe(true);
  });

  it('rejeita quando o usuário não é ADMIN (ou não é membro) do clube', async () => {
    const prisma = { membroClube: { findFirst: jest.fn().mockResolvedValue(null) } };
    const guard = new ClubeAdminGuard(prisma as unknown as PrismaService);

    await expect(guard.canActivate(criarContextoFake('usuario-2', 'clube-1'))).rejects.toBeInstanceOf(
      ForbiddenException,
    );
  });
});
