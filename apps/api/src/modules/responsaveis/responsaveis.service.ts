import { ConflictException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { SeloCodigo, StatusVinculoResponsavel } from '@prisma/client';
import { AtletasService } from '../atletas/atletas.service';
import { garantirPerfilUnico } from '../../common/perfil-unico.helper';
import { PrismaService } from '../../prisma/prisma.service';
import { SelosService } from '../selos/selos.service';
import { CreateResponsavelDto } from './dto/create-responsavel.dto';
import { TERMOS_VERSAO_ATUAL } from './termos.constants';

@Injectable()
export class ResponsaveisService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly atletasService: AtletasService,
    private readonly selosService: SelosService,
  ) {}

  async criarPerfil(usuarioId: string, dto: CreateResponsavelDto) {
    await garantirPerfilUnico(this.prisma, usuarioId);
    return this.prisma.responsavelPerfil.create({ data: { usuarioId, ...dto } });
  }

  async buscarPerfilProprio(usuarioId: string) {
    const responsavel = await this.prisma.responsavelPerfil.findUnique({ where: { usuarioId } });
    if (!responsavel) throw new NotFoundException('Perfil de responsável não encontrado.');
    return responsavel;
  }

  async listarVinculos(usuarioId: string) {
    const responsavel = await this.buscarPerfilProprio(usuarioId);
    return this.prisma.vinculoResponsavelAtleta.findMany({ where: { responsavelId: responsavel.id } });
  }

  async aprovar(usuarioId: string, vinculoId: string, contexto: { ip?: string; userAgent?: string }) {
    const vinculo = await this.buscarVinculoDoResponsavel(usuarioId, vinculoId);
    if (vinculo.status !== StatusVinculoResponsavel.PENDENTE) {
      throw new ConflictException('Este vínculo já foi respondido.');
    }

    await this.prisma.vinculoResponsavelAtleta.update({
      where: { id: vinculo.id },
      data: {
        status: StatusVinculoResponsavel.APROVADO,
        respondidoEm: new Date(),
        versaoTermoAceito: TERMOS_VERSAO_ATUAL,
        ipAprovacao: contexto.ip,
        userAgentAprovacao: contexto.userAgent,
      },
    });

    await this.atletasService.recalcularVisibilidade(vinculo.atletaId);
    await this.selosService.conceder(vinculo.atletaId, SeloCodigo.RESPONSAVEL_VALIDADO);
    return this.prisma.vinculoResponsavelAtleta.findUnique({ where: { id: vinculo.id } });
  }

  async revogar(usuarioId: string, vinculoId: string) {
    const vinculo = await this.buscarVinculoDoResponsavel(usuarioId, vinculoId);
    if (vinculo.status === StatusVinculoResponsavel.REVOGADO) {
      throw new ConflictException('Este vínculo já está revogado.');
    }

    await this.prisma.vinculoResponsavelAtleta.update({
      where: { id: vinculo.id },
      data: { status: StatusVinculoResponsavel.REVOGADO, respondidoEm: new Date() },
    });

    await this.atletasService.recalcularVisibilidade(vinculo.atletaId);
    return this.prisma.vinculoResponsavelAtleta.findUnique({ where: { id: vinculo.id } });
  }

  private async buscarVinculoDoResponsavel(usuarioId: string, vinculoId: string) {
    const responsavel = await this.buscarPerfilProprio(usuarioId);
    const vinculo = await this.prisma.vinculoResponsavelAtleta.findUnique({ where: { id: vinculoId } });

    if (!vinculo) throw new NotFoundException('Vínculo não encontrado.');
    if (vinculo.responsavelId !== responsavel.id) {
      throw new ForbiddenException('Este vínculo não pertence a você.');
    }

    return vinculo;
  }
}
