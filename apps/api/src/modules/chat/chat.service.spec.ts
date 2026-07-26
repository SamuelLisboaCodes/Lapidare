import { Test } from '@nestjs/testing';
import { StatusVinculoResponsavel } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { ChatService } from './chat.service';

function criarPrismaMock() {
  return {
    conversa: { findUnique: jest.fn() },
    atletaPerfil: { findUnique: jest.fn() },
    membroClube: { findFirst: jest.fn() },
    empresarioPerfil: { findUnique: jest.fn() },
    patrocinadorPerfil: { findUnique: jest.fn() },
    vinculoResponsavelAtleta: { findFirst: jest.fn() },
    mensagem: { findMany: jest.fn(), create: jest.fn() },
  };
}

const CONVERSA_BASE = {
  id: 'conversa-1',
  match: { atletaId: 'atleta-1', clubeId: 'clube-1', empresarioId: null, patrocinadorId: null },
};

describe('ChatService — podeAcessar (RN-02)', () => {
  let service: ChatService;
  let prisma: ReturnType<typeof criarPrismaMock>;

  beforeEach(async () => {
    prisma = criarPrismaMock();
    const moduleRef = await Test.createTestingModule({
      providers: [ChatService, { provide: PrismaService, useValue: prisma }],
    }).compile();
    service = moduleRef.get(ChatService);
    prisma.conversa.findUnique.mockResolvedValue(CONVERSA_BASE);
  });

  it('o atleta da conversa pode ler e enviar', async () => {
    prisma.atletaPerfil.findUnique.mockResolvedValue({ usuarioId: 'usuario-atleta' });

    const acesso = await service.podeAcessar('usuario-atleta', 'conversa-1');

    expect(acesso).toEqual({ podeLer: true, podeEnviar: true });
  });

  it('um membro do clube do match pode ler e enviar', async () => {
    prisma.atletaPerfil.findUnique.mockResolvedValue({ usuarioId: 'outro-usuario' });
    prisma.membroClube.findFirst.mockResolvedValue({ id: 'membro-1' });

    const acesso = await service.podeAcessar('usuario-clube', 'conversa-1');

    expect(acesso).toEqual({ podeLer: true, podeEnviar: true });
  });

  it('o responsável aprovado só pode LER, nunca enviar (docs/04 §8)', async () => {
    prisma.atletaPerfil.findUnique.mockResolvedValue({ usuarioId: 'outro-usuario' });
    prisma.membroClube.findFirst.mockResolvedValue(null);
    prisma.vinculoResponsavelAtleta.findFirst.mockResolvedValue({
      status: StatusVinculoResponsavel.APROVADO,
    });

    const acesso = await service.podeAcessar('usuario-responsavel', 'conversa-1');

    expect(acesso).toEqual({ podeLer: true, podeEnviar: false });
  });

  it('um estranho não pode ler nem enviar', async () => {
    prisma.atletaPerfil.findUnique.mockResolvedValue({ usuarioId: 'outro-usuario' });
    prisma.membroClube.findFirst.mockResolvedValue(null);
    prisma.vinculoResponsavelAtleta.findFirst.mockResolvedValue(null);

    const acesso = await service.podeAcessar('estranho', 'conversa-1');

    expect(acesso).toEqual({ podeLer: false, podeEnviar: false });
  });
});
