import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as argon2 from 'argon2';
import { PrismaService } from '../../prisma/prisma.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    const existente = await this.prisma.usuario.findUnique({ where: { email: dto.email } });
    if (existente) {
      throw new ConflictException('E-mail já cadastrado.');
    }

    const senhaHash = await argon2.hash(dto.senha, { type: argon2.argon2id });
    const usuario = await this.prisma.usuario.create({
      data: { email: dto.email, senhaHash },
    });

    return this.emitirResposta(usuario.id, usuario.email);
  }

  async login(dto: LoginDto) {
    const usuario = await this.prisma.usuario.findUnique({ where: { email: dto.email } });
    const senhaValida = usuario?.senhaHash ? await argon2.verify(usuario.senhaHash, dto.senha) : false;

    if (!usuario || !senhaValida) {
      throw new UnauthorizedException('Credenciais inválidas.');
    }

    return this.emitirResposta(usuario.id, usuario.email);
  }

  private emitirResposta(id: string, email: string) {
    return {
      usuario: { id, email },
      accessToken: this.jwtService.sign({ sub: id, email }),
    };
  }
}
