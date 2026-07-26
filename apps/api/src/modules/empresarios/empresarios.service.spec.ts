import { ConflictException, NotFoundException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { StatusVerificacaoConta } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { EmpresariosService } from './empresarios.service';

function criarPrismaMock() {
  return {
    empresarioPerfil: {
      create: jest.fn((args: { data: Record<string, unknown> }) => ({ id: 'empresario-1', ...args.data })),
      findUnique: jest.fn(),
      update: jest.fn((args: { where: { id: string }; data: Record<string, unknown> }) => ({
        id: args.where.id,
        ...args.data,
      })),
    },
    atletaPerfil: { findUnique: jest.fn().mockResolvedValue(null) },
    responsavelPerfil: { findUnique: jest.fn().mockResolvedValue(null) },
    patrocinadorPerfil: { findUnique: jest.fn().mockResolvedValue(null) },
  };
}

describe('EmpresariosService', () => {
  let service: EmpresariosService;
  let prisma: ReturnType<typeof criarPrismaMock>;

  beforeEach(async () => {
    prisma = criarPrismaMock();
    const moduleRef = await Test.createTestingModule({
      providers: [EmpresariosService, { provide: PrismaService, useValue: prisma }],
    }).compile();
    service = moduleRef.get(EmpresariosService);
  });

  it('cria o perfil quando o usuário não tem outro perfil', async () => {
    const resultado = await service.criarPerfil('usuario-1', { nome: 'João Agente', documento: '12345678900' });
    expect(resultado.nome).toBe('João Agente');
  });

  it('rejeita quando o usuário já tem outro tipo de perfil', async () => {
    prisma.atletaPerfil.findUnique.mockResolvedValue({ id: 'ja-existe' });

    await expect(
      service.criarPerfil('usuario-1', { nome: 'João Agente', documento: '12345678900' }),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it('atualizarVerificacao muda o status', async () => {
    prisma.empresarioPerfil.findUnique.mockResolvedValue({ id: 'empresario-1' });

    const resultado = await service.atualizarVerificacao('empresario-1', {
      status: StatusVerificacaoConta.APROVADO,
    });

    expect(resultado.statusVerificacao).toBe(StatusVerificacaoConta.APROVADO);
  });

  it('atualizarVerificacao rejeita id inexistente', async () => {
    prisma.empresarioPerfil.findUnique.mockResolvedValue(null);

    await expect(
      service.atualizarVerificacao('nao-existe', { status: StatusVerificacaoConta.APROVADO }),
    ).rejects.toBeInstanceOf(NotFoundException);
  });
});
