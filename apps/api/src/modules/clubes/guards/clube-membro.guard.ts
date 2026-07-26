import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';

@Injectable()
export class ClubeMembroGuard implements CanActivate {
  constructor(private readonly prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const clubeId = request.params.id;

    const membro = await this.prisma.membroClube.findFirst({
      where: { clubeId, usuarioId: request.user.id, ativo: true },
    });

    if (!membro) {
      throw new ForbiddenException('Você não é membro deste clube.');
    }

    request.membroClube = membro;
    return true;
  }
}
