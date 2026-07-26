import { ForbiddenException, Injectable } from '@nestjs/common';
import type { CanActivate, ExecutionContext } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AdminGuard implements CanActivate {
  constructor(private readonly configService: ConfigService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const emailsPermitidos = (this.configService.get<string>('ADMIN_EMAILS') ?? '')
      .split(',')
      .map((email) => email.trim().toLowerCase())
      .filter(Boolean);

    const emailUsuario = (request.user?.email ?? '').toLowerCase();
    if (!emailsPermitidos.includes(emailUsuario)) {
      throw new ForbiddenException('Ação restrita a administradores da plataforma.');
    }

    return true;
  }
}
