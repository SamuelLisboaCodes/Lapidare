import { ConflictException, ForbiddenException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { SeloCodigo, StatusVinculoResponsavel } from '@prisma/client';
import { AtletasService } from '../atletas/atletas.service';
import { PrismaService } from '../../prisma/prisma.service';
import { SelosService } from '../selos/selos.service';
import { ResponsaveisService } from './responsaveis.service';

function criarPrismaMock() {
  return {
    responsavelPerfil: { findUnique: jest.fn() },
    atletaPerfil: { findUnique: jest.fn().mockResolvedValue(null) },
    empresarioPerfil: { findUnique: jest.fn().mockResolvedValue(null) },
    patrocinadorPerfil: { findUnique: jest.fn().mockResolvedValue(null) },
    vinculoResponsavelAtleta: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
  };
}

describe('ResponsaveisService', () => {
  let service: ResponsaveisService;
  let prisma: ReturnType<typeof criarPrismaMock>;
  let atletasService: { recalcularVisibilidade: jest.Mock };
  let selosService: { conceder: jest.Mock };

  beforeEach(async () => {
    prisma = criarPrismaMock();
    atletasService = { recalcularVisibilidade: jest.fn() };
    selosService = { conceder: jest.fn() };

    const moduleRef = await Test.createTestingModule({
      providers: [
        ResponsaveisService,
        { provide: PrismaService, useValue: prisma },
        { provide: AtletasService, useValue: atletasService },
        { provide: SelosService, useValue: selosService },
      ],
    }).compile();

    service = moduleRef.get(ResponsaveisService);
  });

  describe('aprovar', () => {
    it('grava auditoria de consentimento e recalcula a visibilidade do atleta', async () => {
      prisma.responsavelPerfil.findUnique.mockResolvedValue({ id: 'resp-1' });
      prisma.vinculoResponsavelAtleta.findUnique.mockResolvedValue({
        id: 'vinculo-1',
        responsavelId: 'resp-1',
        atletaId: 'atleta-1',
        status: StatusVinculoResponsavel.PENDENTE,
      });

      await service.aprovar('usuario-resp', 'vinculo-1', { ip: '127.0.0.1', userAgent: 'jest' });

      expect(prisma.vinculoResponsavelAtleta.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'vinculo-1' },
          data: expect.objectContaining({
            status: StatusVinculoResponsavel.APROVADO,
            ipAprovacao: '127.0.0.1',
            userAgentAprovacao: 'jest',
          }),
        }),
      );
      expect(atletasService.recalcularVisibilidade).toHaveBeenCalledWith('atleta-1');
      expect(selosService.conceder).toHaveBeenCalledWith('atleta-1', SeloCodigo.RESPONSAVEL_VALIDADO);
    });

    it('rejeita aprovar um vínculo que não pertence ao responsável autenticado', async () => {
      prisma.responsavelPerfil.findUnique.mockResolvedValue({ id: 'resp-1' });
      prisma.vinculoResponsavelAtleta.findUnique.mockResolvedValue({
        id: 'vinculo-1',
        responsavelId: 'outro-responsavel',
        atletaId: 'atleta-1',
        status: StatusVinculoResponsavel.PENDENTE,
      });

      await expect(
        service.aprovar('usuario-resp', 'vinculo-1', {}),
      ).rejects.toBeInstanceOf(ForbiddenException);
      expect(atletasService.recalcularVisibilidade).not.toHaveBeenCalled();
    });

    it('rejeita aprovar um vínculo que já foi respondido', async () => {
      prisma.responsavelPerfil.findUnique.mockResolvedValue({ id: 'resp-1' });
      prisma.vinculoResponsavelAtleta.findUnique.mockResolvedValue({
        id: 'vinculo-1',
        responsavelId: 'resp-1',
        atletaId: 'atleta-1',
        status: StatusVinculoResponsavel.APROVADO,
      });

      await expect(service.aprovar('usuario-resp', 'vinculo-1', {})).rejects.toBeInstanceOf(
        ConflictException,
      );
    });
  });

  describe('revogar', () => {
    it('revoga um vínculo aprovado e recalcula a visibilidade', async () => {
      prisma.responsavelPerfil.findUnique.mockResolvedValue({ id: 'resp-1' });
      prisma.vinculoResponsavelAtleta.findUnique.mockResolvedValue({
        id: 'vinculo-1',
        responsavelId: 'resp-1',
        atletaId: 'atleta-1',
        status: StatusVinculoResponsavel.APROVADO,
      });

      await service.revogar('usuario-resp', 'vinculo-1');

      expect(prisma.vinculoResponsavelAtleta.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'vinculo-1' },
          data: expect.objectContaining({ status: StatusVinculoResponsavel.REVOGADO }),
        }),
      );
      expect(atletasService.recalcularVisibilidade).toHaveBeenCalledWith('atleta-1');
    });
  });
});
