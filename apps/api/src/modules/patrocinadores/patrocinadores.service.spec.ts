import { ConflictException, NotFoundException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { StatusVerificacaoConta } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { PatrocinadoresService } from './patrocinadores.service';

function criarPrismaMock() {
  return {
    patrocinadorPerfil: {
      create: jest.fn((args: { data: Record<string, unknown> }) => ({ id: 'patrocinador-1', ...args.data })),
      findUnique: jest.fn(),
      update: jest.fn((args: { where: { id: string }; data: Record<string, unknown> }) => ({
        id: args.where.id,
        ...args.data,
      })),
    },
    atletaPerfil: { findUnique: jest.fn().mockResolvedValue(null) },
    responsavelPerfil: { findUnique: jest.fn().mockResolvedValue(null) },
    empresarioPerfil: { findUnique: jest.fn().mockResolvedValue(null) },
  };
}

describe('PatrocinadoresService', () => {
  let service: PatrocinadoresService;
  let prisma: ReturnType<typeof criarPrismaMock>;

  beforeEach(async () => {
    prisma = criarPrismaMock();
    const moduleRef = await Test.createTestingModule({
      providers: [PatrocinadoresService, { provide: PrismaService, useValue: prisma }],
    }).compile();
    service = moduleRef.get(PatrocinadoresService);
  });

  it('cria o perfil quando o usuário não tem outro perfil', async () => {
    const resultado = await service.criarPerfil('usuario-1', { razaoSocial: 'Patrocinadora LTDA', cnpj: '12345678000199' });
    expect(resultado.razaoSocial).toBe('Patrocinadora LTDA');
  });

  it('rejeita quando o usuário já tem outro tipo de perfil', async () => {
    prisma.empresarioPerfil.findUnique.mockResolvedValue({ id: 'ja-existe' });

    await expect(
      service.criarPerfil('usuario-1', { razaoSocial: 'Patrocinadora LTDA', cnpj: '12345678000199' }),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it('atualizarVerificacao rejeita id inexistente', async () => {
    prisma.patrocinadorPerfil.findUnique.mockResolvedValue(null);

    await expect(
      service.atualizarVerificacao('nao-existe', { status: StatusVerificacaoConta.REJEITADO }),
    ).rejects.toBeInstanceOf(NotFoundException);
  });
});
