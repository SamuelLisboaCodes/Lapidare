import { Test } from '@nestjs/testing';
import { SeloCodigo } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { SelosService } from './selos.service';

function criarPrismaMock() {
  return {
    selo: {
      findUnique: jest.fn(),
      create: jest.fn((args: { data: Record<string, unknown> }) => ({ id: 'selo-1', ...args.data })),
    },
    atletaSelo: {
      findUnique: jest.fn(),
      create: jest.fn((args: { data: Record<string, unknown> }) => ({ ...args.data })),
    },
    atletaPerfil: { findUnique: jest.fn() },
  };
}

describe('SelosService', () => {
  let service: SelosService;
  let prisma: ReturnType<typeof criarPrismaMock>;

  beforeEach(async () => {
    prisma = criarPrismaMock();
    const moduleRef = await Test.createTestingModule({
      providers: [SelosService, { provide: PrismaService, useValue: prisma }],
    }).compile();
    service = moduleRef.get(SelosService);
  });

  describe('conceder', () => {
    it('cria o catálogo do selo se ainda não existir e concede ao atleta', async () => {
      prisma.selo.findUnique.mockResolvedValue(null);
      prisma.atletaSelo.findUnique.mockResolvedValue(null);

      await service.conceder('atleta-1', SeloCodigo.RESPONSAVEL_VALIDADO);

      expect(prisma.selo.create).toHaveBeenCalledWith(
        expect.objectContaining({ data: expect.objectContaining({ codigo: SeloCodigo.RESPONSAVEL_VALIDADO }) }),
      );
      expect(prisma.atletaSelo.create).toHaveBeenCalledWith({ data: { atletaId: 'atleta-1', seloId: 'selo-1' } });
    });

    it('é idempotente — não concede duas vezes o mesmo selo', async () => {
      prisma.selo.findUnique.mockResolvedValue({ id: 'selo-1', codigo: SeloCodigo.RESPONSAVEL_VALIDADO });
      prisma.atletaSelo.findUnique.mockResolvedValue({ atletaId: 'atleta-1', seloId: 'selo-1' });

      await service.conceder('atleta-1', SeloCodigo.RESPONSAVEL_VALIDADO);

      expect(prisma.atletaSelo.create).not.toHaveBeenCalled();
    });
  });

  describe('avaliarPerfil', () => {
    it('concede PERFIL_COMPLETO só quando todos os campos opcionais estão preenchidos', async () => {
      prisma.atletaPerfil.findUnique.mockResolvedValue({
        id: 'atleta-1',
        alturaCm: 180,
        envergaduraCm: 190,
        alcanceAtaqueCm: 250,
        alcanceBloqueioCm: 230,
        bio: 'Ponteira',
        _count: { midias: 0 },
      });
      prisma.selo.findUnique.mockResolvedValue(null);
      prisma.atletaSelo.findUnique.mockResolvedValue(null);

      await service.avaliarPerfil('atleta-1');

      expect(prisma.selo.create).toHaveBeenCalledWith(
        expect.objectContaining({ data: expect.objectContaining({ codigo: SeloCodigo.PERFIL_COMPLETO }) }),
      );
    });

    it('não concede PERFIL_COMPLETO se algum campo opcional estiver vazio', async () => {
      prisma.atletaPerfil.findUnique.mockResolvedValue({
        id: 'atleta-1',
        alturaCm: 180,
        envergaduraCm: null,
        alcanceAtaqueCm: 250,
        alcanceBloqueioCm: 230,
        bio: 'Ponteira',
        _count: { midias: 0 },
      });

      await service.avaliarPerfil('atleta-1');

      expect(prisma.selo.create).not.toHaveBeenCalledWith(
        expect.objectContaining({ data: expect.objectContaining({ codigo: SeloCodigo.PERFIL_COMPLETO }) }),
      );
    });

    it('concede VIDEO_ENVIADO só quando há mídia', async () => {
      prisma.atletaPerfil.findUnique.mockResolvedValue({
        id: 'atleta-1',
        alturaCm: null,
        envergaduraCm: null,
        alcanceAtaqueCm: null,
        alcanceBloqueioCm: null,
        bio: null,
        _count: { midias: 1 },
      });
      prisma.selo.findUnique.mockResolvedValue(null);
      prisma.atletaSelo.findUnique.mockResolvedValue(null);

      await service.avaliarPerfil('atleta-1');

      expect(prisma.selo.create).toHaveBeenCalledWith(
        expect.objectContaining({ data: expect.objectContaining({ codigo: SeloCodigo.VIDEO_ENVIADO }) }),
      );
    });
  });
});
