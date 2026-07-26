import { ConflictException, NotFoundException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { CategoriaAtleta, PosicaoVolei, StatusVisibilidadeAtleta } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { SelosService } from '../selos/selos.service';
import { AtletasService } from './atletas.service';

function criarPrismaMock() {
  return {
    atletaPerfil: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn((args: { data: Record<string, unknown> }) => ({ id: 'atleta-1', ...args.data })),
      update: jest.fn((args: { where: { id: string }; data: Record<string, unknown> }) => ({
        id: args.where.id,
        ...args.data,
      })),
    },
    responsavelPerfil: { findUnique: jest.fn().mockResolvedValue(null) },
    empresarioPerfil: { findUnique: jest.fn().mockResolvedValue(null) },
    patrocinadorPerfil: { findUnique: jest.fn().mockResolvedValue(null) },
    vinculoResponsavelAtleta: { findFirst: jest.fn() },
    clube: { findUnique: jest.fn() },
    vinculoAtletaClube: {
      findFirst: jest.fn(),
      create: jest.fn((args: { data: Record<string, unknown> }) => ({ id: 'vinculo-clube-1', ...args.data })),
    },
    candidaturaPeneira: { findMany: jest.fn() },
    seguidorClube: {
      findUnique: jest.fn(),
      create: jest.fn((args: { data: Record<string, unknown> }) => ({ id: 'seguidor-1', ...args.data })),
      delete: jest.fn(),
      findMany: jest.fn(),
    },
  };
}

const DTO_BASE = {
  nome: 'Atleta Teste',
  sexo: 'F',
  cidade: 'Juiz de Fora',
  estado: 'MG',
  posicao: PosicaoVolei.PONTEIRO,
  bio: undefined,
  alturaCm: undefined,
  envergaduraCm: undefined,
  alcanceAtaqueCm: undefined,
  alcanceBloqueioCm: undefined,
};

describe('AtletasService', () => {
  let service: AtletasService;
  let prisma: ReturnType<typeof criarPrismaMock>;

  beforeEach(async () => {
    prisma = criarPrismaMock();
    prisma.atletaPerfil.findUnique.mockResolvedValue(null);

    const moduleRef = await Test.createTestingModule({
      providers: [
        AtletasService,
        { provide: PrismaService, useValue: prisma },
        { provide: SelosService, useValue: { avaliarPerfil: jest.fn(), listarPorAtleta: jest.fn() } },
      ],
    }).compile();

    service = moduleRef.get(AtletasService);
  });

  describe('criarPerfil — gate de menor (docs/04-seguranca-lgpd.md §5)', () => {
    it('adulto declarado como ADULTO fica VISIVEL imediatamente', async () => {
      const resultado = await service.criarPerfil('usuario-1', {
        ...DTO_BASE,
        dataNascimento: '2000-01-01',
        categoria: CategoriaAtleta.ADULTO,
      });

      expect(resultado.statusVisibilidade).toBe(StatusVisibilidadeAtleta.VISIVEL);
    });

    it('menor por idade fica PENDENTE mesmo declarando categoria ADULTO', async () => {
      const resultado = await service.criarPerfil('usuario-1', {
        ...DTO_BASE,
        dataNascimento: '2012-01-01',
        categoria: CategoriaAtleta.ADULTO,
      });

      expect(resultado.statusVisibilidade).toBe(StatusVisibilidadeAtleta.PENDENTE_APROVACAO);
    });

    it('maior de idade em categoria de base fica PENDENTE (categoria sempre trava)', async () => {
      const resultado = await service.criarPerfil('usuario-1', {
        ...DTO_BASE,
        dataNascimento: '2000-01-01',
        categoria: CategoriaAtleta.SUB19,
      });

      expect(resultado.statusVisibilidade).toBe(StatusVisibilidadeAtleta.PENDENTE_APROVACAO);
    });

    it('rejeita criar um segundo perfil de atleta para o mesmo usuário', async () => {
      prisma.atletaPerfil.findUnique.mockResolvedValue({ id: 'ja-existe' });

      await expect(
        service.criarPerfil('usuario-1', {
          ...DTO_BASE,
          dataNascimento: '2000-01-01',
          categoria: CategoriaAtleta.ADULTO,
        }),
      ).rejects.toBeInstanceOf(ConflictException);
    });
  });

  describe('recalcularVisibilidade', () => {
    it('libera o perfil quando passa a existir vínculo aprovado', async () => {
      prisma.atletaPerfil.findUnique.mockResolvedValue({
        id: 'atleta-1',
        dataNascimento: new Date('2012-01-01'),
        categoria: CategoriaAtleta.SUB15,
        statusVisibilidade: StatusVisibilidadeAtleta.PENDENTE_APROVACAO,
      });
      prisma.vinculoResponsavelAtleta.findFirst.mockResolvedValue({ id: 'vinculo-1' });

      await service.recalcularVisibilidade('atleta-1');

      expect(prisma.atletaPerfil.update).toHaveBeenCalledWith({
        where: { id: 'atleta-1' },
        data: { statusVisibilidade: StatusVisibilidadeAtleta.VISIVEL },
      });
    });

    it('oculta o perfil quando o vínculo aprovado deixa de existir (revogação)', async () => {
      prisma.atletaPerfil.findUnique.mockResolvedValue({
        id: 'atleta-1',
        dataNascimento: new Date('2012-01-01'),
        categoria: CategoriaAtleta.SUB15,
        statusVisibilidade: StatusVisibilidadeAtleta.VISIVEL,
      });
      prisma.vinculoResponsavelAtleta.findFirst.mockResolvedValue(null);

      await service.recalcularVisibilidade('atleta-1');

      expect(prisma.atletaPerfil.update).toHaveBeenCalledWith({
        where: { id: 'atleta-1' },
        data: { statusVisibilidade: StatusVisibilidadeAtleta.OCULTO },
      });
    });

    it('não regride para OCULTO um perfil que nunca foi aprovado (ainda PENDENTE)', async () => {
      prisma.atletaPerfil.findUnique.mockResolvedValue({
        id: 'atleta-1',
        dataNascimento: new Date('2012-01-01'),
        categoria: CategoriaAtleta.SUB15,
        statusVisibilidade: StatusVisibilidadeAtleta.PENDENTE_APROVACAO,
      });
      prisma.vinculoResponsavelAtleta.findFirst.mockResolvedValue(null);

      await service.recalcularVisibilidade('atleta-1');

      expect(prisma.atletaPerfil.update).not.toHaveBeenCalled();
    });
  });

  describe('solicitarVinculoClube', () => {
    beforeEach(() => {
      prisma.atletaPerfil.findUnique.mockResolvedValue({ id: 'atleta-1' });
    });

    it('cria o vínculo quando o clube existe e não há duplicata ativa', async () => {
      prisma.clube.findUnique.mockResolvedValue({ id: 'clube-1' });
      prisma.vinculoAtletaClube.findFirst.mockResolvedValue(null);

      const resultado = await service.solicitarVinculoClube('usuario-1', {
        clubeId: 'clube-1',
        tipoVinculo: 'ESCOLA_BASE' as never,
      });

      expect(resultado.clubeId).toBe('clube-1');
      expect(resultado.atletaId).toBe('atleta-1');
    });

    it('rejeita duplicata de vínculo ativo com o mesmo clube', async () => {
      prisma.clube.findUnique.mockResolvedValue({ id: 'clube-1' });
      prisma.vinculoAtletaClube.findFirst.mockResolvedValue({ id: 'ja-existe' });

      await expect(
        service.solicitarVinculoClube('usuario-1', { clubeId: 'clube-1', tipoVinculo: 'ESCOLA_BASE' as never }),
      ).rejects.toBeInstanceOf(ConflictException);
    });
  });

  describe('buscar — ranking heurístico (RN-06, ADR 0005)', () => {
    function criarAtletaFake(overrides: Record<string, unknown>) {
      return {
        id: 'atleta-x',
        alturaCm: null,
        envergaduraCm: null,
        alcanceAtaqueCm: null,
        alcanceBloqueioCm: null,
        bio: null,
        criadoEm: new Date(),
        _count: { midias: 0, selos: 0 },
        ...overrides,
      };
    }

    it('só retorna atletas VISIVEL (o WHERE já garante isso, aqui confirmamos a chamada)', async () => {
      prisma.atletaPerfil.findMany.mockResolvedValue([]);

      await service.buscar({});

      expect(prisma.atletaPerfil.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ statusVisibilidade: StatusVisibilidadeAtleta.VISIVEL }),
        }),
      );
    });

    it('ordena por completude — perfil mais completo vem primeiro', async () => {
      const incompleto = criarAtletaFake({ id: 'incompleto' });
      const completo = criarAtletaFake({
        id: 'completo',
        alturaCm: 180,
        envergaduraCm: 190,
        alcanceAtaqueCm: 250,
        alcanceBloqueioCm: 230,
        bio: 'Ponteira experiente',
        _count: { midias: 1, selos: 0 },
      });
      prisma.atletaPerfil.findMany.mockResolvedValue([incompleto, completo]);

      const resultado = await service.buscar({});

      expect(resultado.map((a) => a.id)).toEqual(['completo', 'incompleto']);
    });

    it('perfil com selos rankeia acima de um perfil idêntico sem selos (LAP-046)', async () => {
      const semSelos = criarAtletaFake({ id: 'sem-selos', criadoEm: new Date('2026-01-01') });
      const comSelos = criarAtletaFake({
        id: 'com-selos',
        criadoEm: new Date('2026-01-01'),
        _count: { midias: 0, selos: 2 },
      });
      prisma.atletaPerfil.findMany.mockResolvedValue([semSelos, comSelos]);

      const resultado = await service.buscar({});

      expect(resultado.map((a) => a.id)).toEqual(['com-selos', 'sem-selos']);
    });
  });

  describe('listarCandidaturas', () => {
    it('lista as candidaturas do atleta autenticado', async () => {
      prisma.atletaPerfil.findUnique.mockResolvedValue({ id: 'atleta-1' });
      prisma.candidaturaPeneira.findMany.mockResolvedValue([{ id: 'cand-1' }]);

      const resultado = await service.listarCandidaturas('usuario-1');

      expect(prisma.candidaturaPeneira.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: { atletaId: 'atleta-1' } }),
      );
      expect(resultado).toEqual([{ id: 'cand-1' }]);
    });
  });

  describe('seguirClube (RN-08)', () => {
    beforeEach(() => {
      prisma.atletaPerfil.findUnique.mockResolvedValue({ id: 'atleta-1' });
    });

    it('cria o registro de seguidor quando o clube existe e ainda não segue', async () => {
      prisma.clube.findUnique.mockResolvedValue({ id: 'clube-1' });
      prisma.seguidorClube.findUnique.mockResolvedValue(null);

      const resultado = await service.seguirClube('usuario-1', 'clube-1');

      expect(resultado.atletaId).toBe('atleta-1');
      expect(resultado.clubeId).toBe('clube-1');
    });

    it('rejeita clube inexistente', async () => {
      prisma.clube.findUnique.mockResolvedValue(null);

      await expect(service.seguirClube('usuario-1', 'clube-inexistente')).rejects.toBeInstanceOf(
        NotFoundException,
      );
    });

    it('rejeita seguir duas vezes o mesmo clube', async () => {
      prisma.clube.findUnique.mockResolvedValue({ id: 'clube-1' });
      prisma.seguidorClube.findUnique.mockResolvedValue({ id: 'ja-segue' });

      await expect(service.seguirClube('usuario-1', 'clube-1')).rejects.toBeInstanceOf(ConflictException);
    });
  });
});
