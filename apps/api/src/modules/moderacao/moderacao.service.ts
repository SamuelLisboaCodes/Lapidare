import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CriarDenunciaDto } from './dto/criar-denuncia.dto';

@Injectable()
export class ModeracaoService {
  constructor(private readonly prisma: PrismaService) {}

  criarDenuncia(denuncianteId: string, dto: CriarDenunciaDto) {
    return this.prisma.denuncia.create({
      data: {
        denuncianteId,
        entidadeTipo: dto.entidadeTipo,
        entidadeId: dto.entidadeId,
        motivo: dto.motivo,
      },
    });
  }
}
