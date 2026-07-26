import { ConflictException, NotFoundException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { PapelClube, SeloCodigo } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { SelosService } from '../selos/selos.service';
import { ClubesService } from './clubes.service';

type ArgsComData = { data: Record<string, unknown> };
type ArgsComWhereId = { where: { id: string }; data: Record<string, unknown> };

function criarPrismaMock() {
  const modelos = {
    clube: {
      create: jest.fn((args: ArgsComData) => ({ id: 'clube-1', ...args.data })),
      findUnique: jest.fn(),
      update: jest.fn((args: ArgsComWhereId) => ({ id: args.where.id, ...args.data })),
    },
    membroClube: {
      create: jest.fn((args: ArgsComData) => ({ id: 'membro-1', ativo: true, ...args.data })),
      findFirst: jest.fn(),
      findMany: jest.fn(),
    },
    usuario: { findUnique: jest.fn() },
    vinculoAtletaClube: { findUnique: jest.fn(), update: jest.fn() },
  };

  return {
    ...modelos,
    $transaction: jest.fn((callback: (tx: typeof modelos) => unknown) => callback(modelos)),
  };
}

describe('ClubesService', () => {
  let service: ClubesService;
  let prisma: ReturnType<typeof criarPrismaMock>;
  let selosService: { conceder: jest.Mock };

  beforeEach(async () => {
    prisma = criarPrismaMock();
    selosService = { conceder: jest.fn() };

    const moduleRef = await Test.createTestingModule({
      providers: [
        ClubesService,
        { provide: PrismaService, useValue: prisma },
        { provide: SelosService, useValue: selosService },
      ],
    }).compile();

    service = moduleRef.get(ClubesService);
  });

  describe('criarClube', () => {
    it('cria o clube e o criador como ADMIN', async () => {
      const clube = await service.criarClube('usuario-1', {
        nomeFantasia: 'JF Vôlei',
        cidade: 'Juiz de Fora',
        estado: 'MG',
      });

      expect(clube.nomeFantasia).toBe('JF Vôlei');
      expect(prisma.membroClube.create).toHaveBeenCalledWith({
        data: { clubeId: 'clube-1', usuarioId: 'usuario-1', papel: PapelClube.ADMIN },
      });
    });
  });

  describe('convidarMembro', () => {
    beforeEach(() => {
      prisma.clube.findUnique.mockResolvedValue({ id: 'clube-1' });
    });

    it('rejeita convite para e-mail sem conta', async () => {
      prisma.usuario.findUnique.mockResolvedValue(null);

      await expect(
        service.convidarMembro('clube-1', { email: 'ninguem@exemplo.com' }),
      ).rejects.toBeInstanceOf(NotFoundException);
    });

    it('rejeita convite para quem já é membro', async () => {
      prisma.usuario.findUnique.mockResolvedValue({ id: 'usuario-2' });
      prisma.membroClube.findFirst.mockResolvedValue({ id: 'membro-existente' });

      await expect(
        service.convidarMembro('clube-1', { email: 'ja-membro@exemplo.com' }),
      ).rejects.toBeInstanceOf(ConflictException);
    });

    it('cria o membro com papel MEMBRO por padrão', async () => {
      prisma.usuario.findUnique.mockResolvedValue({ id: 'usuario-2' });
      prisma.membroClube.findFirst.mockResolvedValue(null);

      await service.convidarMembro('clube-1', { email: 'novo@exemplo.com' });

      expect(prisma.membroClube.create).toHaveBeenCalledWith({
        data: { clubeId: 'clube-1', usuarioId: 'usuario-2', papel: PapelClube.MEMBRO },
      });
    });
  });

  describe('confirmarVinculoAtleta', () => {
    it('rejeita vínculo de outro clube', async () => {
      prisma.vinculoAtletaClube.findUnique.mockResolvedValue({ id: 'v1', clubeId: 'outro-clube' });

      await expect(service.confirmarVinculoAtleta('clube-1', 'v1')).rejects.toBeInstanceOf(
        NotFoundException,
      );
      expect(selosService.conceder).not.toHaveBeenCalled();
    });

    it('concede o selo VINCULO_CLUBE_CONFIRMADO ao confirmar (LAP-046)', async () => {
      prisma.vinculoAtletaClube.findUnique.mockResolvedValue({
        id: 'v1',
        clubeId: 'clube-1',
        atletaId: 'atleta-1',
      });
      prisma.vinculoAtletaClube.update.mockResolvedValue({ id: 'v1', confirmadoPeloClube: true });

      await service.confirmarVinculoAtleta('clube-1', 'v1');

      expect(selosService.conceder).toHaveBeenCalledWith('atleta-1', SeloCodigo.VINCULO_CLUBE_CONFIRMADO);
    });
  });
});
