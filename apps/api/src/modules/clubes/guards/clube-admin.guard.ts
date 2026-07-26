import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { PapelClube } from '@prisma/client';
import { PrismaService } from '../../../prisma/prisma.service';

@Injectable()
export class ClubeAdminGuard implements CanActivate {
  constructor(private readonly prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const clubeId = request.params.id;

    const membro = await this.prisma.membroClube.findFirst({
      where: { clubeId, usuarioId: request.user.id, ativo: true, papel: PapelClube.ADMIN },
    });

    if (!membro) {
      throw new ForbiddenException('Ação restrita a administradores do clube.');
    }

    request.membroClube = membro;
    return true;
  }
}
