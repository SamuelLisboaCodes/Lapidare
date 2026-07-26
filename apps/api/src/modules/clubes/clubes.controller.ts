import { Body, Controller, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { AdminGuard } from '../../common/guards/admin.guard';
import { AuthenticatedUser, CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ClubesService } from './clubes.service';
import { AtualizarVerificacaoDto } from '../../common/dto/atualizar-verificacao.dto';
import { ConvidarMembroDto } from './dto/convidar-membro.dto';
import { CreateClubeDto } from './dto/create-clube.dto';
import { ClubeAdminGuard } from './guards/clube-admin.guard';
import { ClubeMembroGuard } from './guards/clube-membro.guard';

@UseGuards(JwtAuthGuard)
@Controller('clubes')
export class ClubesController {
  constructor(private readonly clubesService: ClubesService) {}

  @Post()
  criarClube(@CurrentUser() usuario: AuthenticatedUser, @Body() dto: CreateClubeDto) {
    return this.clubesService.criarClube(usuario.id, dto);
  }

  @Get('minhas')
  listarMinhasClubes(@CurrentUser() usuario: AuthenticatedUser) {
    return this.clubesService.listarMinhasClubes(usuario.id);
  }

  @Get(':id')
  buscarPorId(@Param('id') id: string) {
    return this.clubesService.buscarPorId(id);
  }

  @UseGuards(ClubeAdminGuard)
  @Post(':id/membros')
  convidarMembro(@Param('id') id: string, @Body() dto: ConvidarMembroDto) {
    return this.clubesService.convidarMembro(id, dto);
  }

  @UseGuards(ClubeMembroGuard)
  @Get(':id/membros')
  listarMembros(@Param('id') id: string) {
    return this.clubesService.listarMembros(id);
  }

  @UseGuards(AdminGuard)
  @Patch(':id/verificacao')
  atualizarVerificacao(@Param('id') id: string, @Body() dto: AtualizarVerificacaoDto) {
    return this.clubesService.atualizarVerificacao(id, dto);
  }

  @UseGuards(ClubeMembroGuard)
  @Get(':id/vinculos')
  listarVinculos(@Param('id') id: string) {
    return this.clubesService.listarVinculos(id);
  }

  @UseGuards(ClubeMembroGuard)
  @Post(':id/vinculos/:vinculoId/confirmar')
  confirmarVinculoAtleta(@Param('id') id: string, @Param('vinculoId') vinculoId: string) {
    return this.clubesService.confirmarVinculoAtleta(id, vinculoId);
  }
}
