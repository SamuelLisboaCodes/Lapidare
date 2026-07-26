import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Test } from '@nestjs/testing';
import * as argon2 from 'argon2';
import { PrismaService } from '../../prisma/prisma.service';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  let authService: AuthService;
  let prisma: { usuario: { findUnique: jest.Mock; create: jest.Mock } };

  beforeEach(async () => {
    prisma = {
      usuario: {
        findUnique: jest.fn(),
        create: jest.fn(),
      },
    };

    const moduleRef = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: prisma },
        { provide: JwtService, useValue: { sign: jest.fn().mockReturnValue('token-fake') } },
      ],
    }).compile();

    authService = moduleRef.get(AuthService);
  });

  describe('register', () => {
    it('cria o usuário com a senha hasheada, nunca em texto puro', async () => {
      prisma.usuario.findUnique.mockResolvedValue(null);
      prisma.usuario.create.mockImplementation(({ data }) =>
        Promise.resolve({ id: 'user-1', email: data.email, senhaHash: data.senhaHash }),
      );

      const resultado = await authService.register({ email: 'atleta@exemplo.com', senha: 'senha-forte-123' });

      const dadosCriados = prisma.usuario.create.mock.calls[0][0].data;
      expect(dadosCriados.senhaHash).not.toBe('senha-forte-123');
      expect(await argon2.verify(dadosCriados.senhaHash, 'senha-forte-123')).toBe(true);
      expect(resultado.accessToken).toBe('token-fake');
      expect(resultado.usuario).toEqual({ id: 'user-1', email: 'atleta@exemplo.com' });
    });

    it('rejeita e-mail duplicado', async () => {
      prisma.usuario.findUnique.mockResolvedValue({ id: 'existente' });

      await expect(
        authService.register({ email: 'atleta@exemplo.com', senha: 'senha-forte-123' }),
      ).rejects.toBeInstanceOf(ConflictException);
    });
  });

  describe('login', () => {
    it('aceita credenciais corretas e retorna token', async () => {
      const senhaHash = await argon2.hash('senha-correta', { type: argon2.argon2id });
      prisma.usuario.findUnique.mockResolvedValue({ id: 'user-1', email: 'atleta@exemplo.com', senhaHash });

      const resultado = await authService.login({ email: 'atleta@exemplo.com', senha: 'senha-correta' });

      expect(resultado.accessToken).toBe('token-fake');
    });

    it('rejeita senha incorreta', async () => {
      const senhaHash = await argon2.hash('senha-correta', { type: argon2.argon2id });
      prisma.usuario.findUnique.mockResolvedValue({ id: 'user-1', email: 'atleta@exemplo.com', senhaHash });

      await expect(
        authService.login({ email: 'atleta@exemplo.com', senha: 'senha-errada' }),
      ).rejects.toBeInstanceOf(UnauthorizedException);
    });

    it('rejeita e-mail inexistente', async () => {
      prisma.usuario.findUnique.mockResolvedValue(null);

      await expect(
        authService.login({ email: 'ninguem@exemplo.com', senha: 'qualquer-senha' }),
      ).rejects.toBeInstanceOf(UnauthorizedException);
    });
  });
});
