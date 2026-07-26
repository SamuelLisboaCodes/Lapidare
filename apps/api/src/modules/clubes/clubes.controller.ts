import { Body, Controller, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { DirecaoInteresse } from '@prisma/client';
import { AdminGuard } from '../../common/guards/admin.guard';
import { AuthenticatedUser, CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { MatchService } from '../match/match.service';
import { ClubesService } from './clubes.service';
import { AtualizarVerificacaoDto } from '../../common/dto/atualizar-verificacao.dto';
import { AtualizarCandidaturaDto } from '../peneiras/dto/atualizar-candidatura.dto';
import { CreatePeneiraDto } from '../peneiras/dto/create-peneira.dto';
import { PeneirasService } from '../peneiras/peneiras.service';
import { ConvidarMembroDto } from './dto/convidar-membro.dto';
import { CreateClubeDto } from './dto/create-clube.dto';
import { ClubeAdminGuard } from './guards/clube-admin.guard';
import { ClubeMembroGuard } from './guards/clube-membro.guard';

@UseGuards(JwtAuthGuard)
@Controller('clubes')
export class ClubesController {
  constructor(
    private readonly clubesService: ClubesService,
    private readonly peneirasService: PeneirasService,
    private readonly matchService: MatchService,
  ) {}

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

  @UseGuards(ClubeAdminGuard)
  @Post(':id/peneiras')
  criarPeneira(@Param('id') id: string, @Body() dto: CreatePeneiraDto) {
    return this.peneirasService.criar(id, dto);
  }

  @UseGuards(ClubeMembroGuard)
  @Get(':id/peneiras')
  listarPeneirasDoClube(@Param('id') id: string) {
    return this.peneirasService.listarDoClube(id);
  }

  @UseGuards(ClubeMembroGuard)
  @Get(':id/peneiras/:peneiraId/candidaturas')
  listarCandidaturas(@Param('id') id: string, @Param('peneiraId') peneiraId: string) {
    return this.peneirasService.listarCandidaturas(id, peneiraId);
  }

  @UseGuards(ClubeMembroGuard)
  @Patch(':id/peneiras/:peneiraId/candidaturas/:candidaturaId')
  atualizarCandidatura(
    @Param('id') id: string,
    @Param('peneiraId') peneiraId: string,
    @Param('candidaturaId') candidaturaId: string,
    @Body() dto: AtualizarCandidaturaDto,
  ) {
    return this.peneirasService.atualizarCandidatura(id, peneiraId, candidaturaId, dto);
  }

  @UseGuards(ClubeMembroGuard)
  @Post(':id/interesses/:atletaId')
  registrarInteresse(@Param('id') id: string, @Param('atletaId') atletaId: string) {
    return this.matchService.registrarInteresse(atletaId, 'CLUBE', id, DirecaoInteresse.ATOR_PARA_ATLETA);
  }

  @UseGuards(ClubeMembroGuard)
  @Get(':id/matches')
  listarMatches(@Param('id') id: string) {
    return this.matchService.listarPorAtor('CLUBE', id);
  }
}
