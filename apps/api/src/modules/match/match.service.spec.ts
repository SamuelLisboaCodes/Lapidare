import { ConflictException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { DirecaoInteresse, StatusVinculoResponsavel } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { MatchService } from './match.service';

function criarPrismaMock() {
  const modelos = {
    interesse: {
      findFirst: jest.fn(),
      create: jest.fn((args: { data: Record<string, unknown> }) => ({ id: 'interesse-1', ...args.data })),
    },
    match: {
      findFirst: jest.fn(),
      create: jest.fn((args: { data: Record<string, unknown> }) => ({ id: 'match-1', ...args.data })),
    },
    conversa: {
      create: jest.fn((args: { data: Record<string, unknown> }) => ({ id: 'conversa-1', ...args.data })),
    },
    vinculoResponsavelAtleta: { findMany: jest.fn().mockResolvedValue([]) },
    notificacao: { create: jest.fn() },
  };

  return {
    ...modelos,
    $transaction: jest.fn((callback: (tx: typeof modelos) => unknown) => callback(modelos)),
  };
}

describe('MatchService', () => {
  let service: MatchService;
  let prisma: ReturnType<typeof criarPrismaMock>;

  beforeEach(async () => {
    prisma = criarPrismaMock();
    const moduleRef = await Test.createTestingModule({
      providers: [MatchService, { provide: PrismaService, useValue: prisma }],
    }).compile();
    service = moduleRef.get(MatchService);
  });

  it('rejeita interesse duplicado', async () => {
    prisma.interesse.findFirst.mockResolvedValue({ id: 'ja-existe' });

    await expect(
      service.registrarInteresse('atleta-1', 'CLUBE', 'clube-1', DirecaoInteresse.ATOR_PARA_ATLETA),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it('não cria match quando o interesse é unilateral', async () => {
    prisma.interesse.findFirst
      .mockResolvedValueOnce(null) // checagem de duplicata
      .mockResolvedValueOnce(null); // checagem de reciprocidade

    const resultado = await service.registrarInteresse(
      'atleta-1',
      'CLUBE',
      'clube-1',
      DirecaoInteresse.ATOR_PARA_ATLETA,
    );

    expect(resultado.match).toBeNull();
    expect(prisma.match.create).not.toHaveBeenCalled();
  });

  it('cria match e conversa quando o interesse é recíproco', async () => {
    prisma.interesse.findFirst
      .mockResolvedValueOnce(null) // duplicata
      .mockResolvedValueOnce({ id: 'interesse-reciproco' }); // reciprocidade
    prisma.match.findFirst.mockResolvedValue(null);

    const resultado = await service.registrarInteresse(
      'atleta-1',
      'CLUBE',
      'clube-1',
      DirecaoInteresse.ATOR_PARA_ATLETA,
    );

    expect(resultado.match).not.toBeNull();
    expect(prisma.conversa.create).toHaveBeenCalledWith({ data: { matchId: 'match-1' } });
  });

  it('notifica responsáveis aprovados quando o match é de um menor', async () => {
    prisma.interesse.findFirst.mockResolvedValueOnce(null).mockResolvedValueOnce({ id: 'reciproco' });
    prisma.match.findFirst.mockResolvedValue(null);
    prisma.vinculoResponsavelAtleta.findMany.mockResolvedValue([
      { responsavel: { usuarioId: 'usuario-mae' }, status: StatusVinculoResponsavel.APROVADO },
    ]);

    await service.registrarInteresse('atleta-1', 'CLUBE', 'clube-1', DirecaoInteresse.ATOR_PARA_ATLETA);

    expect(prisma.notificacao.create).toHaveBeenCalledWith({
      data: { usuarioId: 'usuario-mae', tipo: 'MATCH', referenciaId: 'match-1' },
    });
  });

  it('não duplica match se já existe um para o par atleta/ator', async () => {
    prisma.interesse.findFirst.mockResolvedValueOnce(null).mockResolvedValueOnce({ id: 'reciproco' });
    prisma.match.findFirst.mockResolvedValue({ id: 'match-existente' });

    const resultado = await service.registrarInteresse(
      'atleta-1',
      'CLUBE',
      'clube-1',
      DirecaoInteresse.ATOR_PARA_ATLETA,
    );

    expect(resultado.match).toEqual({ id: 'match-existente' });
    expect(prisma.match.create).not.toHaveBeenCalled();
  });
});
