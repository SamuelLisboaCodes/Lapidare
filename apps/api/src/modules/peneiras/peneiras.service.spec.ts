import { ConflictException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { StatusCandidaturaPeneira, StatusVisibilidadeAtleta } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { PeneirasService } from './peneiras.service';

function criarPrismaMock() {
  return {
    peneira: {
      create: jest.fn((args: { data: Record<string, unknown> }) => ({ id: 'peneira-1', ...args.data })),
      findUnique: jest.fn(),
      findMany: jest.fn(),
    },
    atletaPerfil: { findUnique: jest.fn() },
    seguidorClube: { findMany: jest.fn().mockResolvedValue([]) },
    notificacao: { create: jest.fn() },
    candidaturaPeneira: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn((args: { data: Record<string, unknown> }) => ({ id: 'candidatura-1', ...args.data })),
      update: jest.fn((args: { where: { id: string }; data: Record<string, unknown> }) => ({
        id: args.where.id,
        ...args.data,
      })),
    },
  };
}

describe('PeneirasService', () => {
  let service: PeneirasService;
  let prisma: ReturnType<typeof criarPrismaMock>;

  beforeEach(async () => {
    prisma = criarPrismaMock();
    const moduleRef = await Test.createTestingModule({
      providers: [PeneirasService, { provide: PrismaService, useValue: prisma }],
    }).compile();
    service = moduleRef.get(PeneirasService);
  });

  describe('criar', () => {
    it('cria a peneira vinculada ao clube', async () => {
      const resultado = await service.criar('clube-1', {
        titulo: 'Peneira Sub-15',
        categoria: 'SUB15' as never,
        dataEvento: '2026-08-01',
        local: 'Ginásio JF Vôlei',
      });

      expect(resultado.clubeId).toBe('clube-1');
      expect(resultado.titulo).toBe('Peneira Sub-15');
    });

    it('notifica seguidores com categoria e posição compatíveis (LAP-045 / RN-08)', async () => {
      prisma.seguidorClube.findMany.mockResolvedValue([
        { atleta: { usuarioId: 'usuario-compativel' } },
      ]);

      const peneira = await service.criar('clube-1', {
        titulo: 'Peneira Sub-15 Ponteiro',
        categoria: 'SUB15' as never,
        posicaoAlvo: 'PONTEIRO' as never,
        dataEvento: '2026-08-01',
        local: 'Ginásio JF Vôlei',
      });

      expect(prisma.seguidorClube.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { clubeId: 'clube-1', atleta: { categoria: 'SUB15', posicao: 'PONTEIRO' } },
        }),
      );
      expect(prisma.notificacao.create).toHaveBeenCalledWith({
        data: { usuarioId: 'usuario-compativel', tipo: 'NOVA_PENEIRA', referenciaId: peneira.id },
      });
    });

    it('sem posicaoAlvo, filtra só por categoria (não restringe posição)', async () => {
      await service.criar('clube-1', {
        titulo: 'Peneira Sub-15 geral',
        categoria: 'SUB15' as never,
        dataEvento: '2026-08-01',
        local: 'Ginásio JF Vôlei',
      });

      expect(prisma.seguidorClube.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { clubeId: 'clube-1', atleta: { categoria: 'SUB15' } },
        }),
      );
    });
  });

  describe('candidatar', () => {
    beforeEach(() => {
      prisma.peneira.findUnique.mockResolvedValue({ id: 'peneira-1', clubeId: 'clube-1' });
    });

    it('rejeita se o usuário não tem perfil de atleta', async () => {
      prisma.atletaPerfil.findUnique.mockResolvedValue(null);

      await expect(service.candidatar('usuario-1', 'peneira-1')).rejects.toBeInstanceOf(NotFoundException);
    });

    it('rejeita se o perfil do atleta não está VISIVEL', async () => {
      prisma.atletaPerfil.findUnique.mockResolvedValue({
        id: 'atleta-1',
        statusVisibilidade: StatusVisibilidadeAtleta.PENDENTE_APROVACAO,
      });

      await expect(service.candidatar('usuario-1', 'peneira-1')).rejects.toBeInstanceOf(ForbiddenException);
    });

    it('rejeita candidatura duplicada', async () => {
      prisma.atletaPerfil.findUnique.mockResolvedValue({
        id: 'atleta-1',
        statusVisibilidade: StatusVisibilidadeAtleta.VISIVEL,
      });
      prisma.candidaturaPeneira.findUnique.mockResolvedValue({ id: 'ja-existe' });

      await expect(service.candidatar('usuario-1', 'peneira-1')).rejects.toBeInstanceOf(ConflictException);
    });

    it('cria a candidatura quando tudo está certo', async () => {
      prisma.atletaPerfil.findUnique.mockResolvedValue({
        id: 'atleta-1',
        statusVisibilidade: StatusVisibilidadeAtleta.VISIVEL,
      });
      prisma.candidaturaPeneira.findUnique.mockResolvedValue(null);

      const resultado = await service.candidatar('usuario-1', 'peneira-1');

      expect(resultado.peneiraId).toBe('peneira-1');
      expect(resultado.atletaId).toBe('atleta-1');
    });
  });

  describe('atualizarCandidatura', () => {
    it('rejeita candidatura de peneira de outro clube', async () => {
      prisma.peneira.findUnique.mockResolvedValue({ id: 'peneira-1', clubeId: 'outro-clube' });

      await expect(
        service.atualizarCandidatura('clube-1', 'peneira-1', 'cand-1', {
          status: StatusCandidaturaPeneira.APROVADO,
        }),
      ).rejects.toBeInstanceOf(NotFoundException);
    });

    it('atualiza o status quando tudo confere', async () => {
      prisma.peneira.findUnique.mockResolvedValue({ id: 'peneira-1', clubeId: 'clube-1' });
      prisma.candidaturaPeneira.findUnique.mockResolvedValue({ id: 'cand-1', peneiraId: 'peneira-1' });

      const resultado = await service.atualizarCandidatura('clube-1', 'peneira-1', 'cand-1', {
        status: StatusCandidaturaPeneira.APROVADO,
      });

      expect(resultado.status).toBe(StatusCandidaturaPeneira.APROVADO);
    });
  });
});
