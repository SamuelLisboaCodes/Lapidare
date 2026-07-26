import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { DirecaoInteresse } from '@prisma/client';
import { CurrentUser, AuthenticatedUser } from '../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { MatchService } from '../match/match.service';
import { RegistrarInteresseDto } from '../match/dto/registrar-interesse.dto';
import { AtletasService } from './atletas.service';
import { BuscarAtletasDto } from './dto/buscar-atletas.dto';
import { CreateAtletaDto } from './dto/create-atleta.dto';
import { SolicitarVinculoClubeDto } from './dto/solicitar-vinculo-clube.dto';
import { SolicitarVinculoDto } from './dto/solicitar-vinculo.dto';
import { UpdateAtletaDto } from './dto/update-atleta.dto';

@UseGuards(JwtAuthGuard)
@Controller('atletas')
export class AtletasController {
  constructor(
    private readonly atletasService: AtletasService,
    private readonly matchService: MatchService,
  ) {}

  @Get()
  buscar(@Query() filtros: BuscarAtletasDto) {
    return this.atletasService.buscar(filtros);
  }

  @Post('me')
  criarPerfil(@CurrentUser() usuario: AuthenticatedUser, @Body() dto: CreateAtletaDto) {
    return this.atletasService.criarPerfil(usuario.id, dto);
  }

  @Get('me')
  buscarPerfilProprio(@CurrentUser() usuario: AuthenticatedUser) {
    return this.atletasService.buscarPerfilProprio(usuario.id);
  }

  @Patch('me')
  atualizarPerfil(@CurrentUser() usuario: AuthenticatedUser, @Body() dto: UpdateAtletaDto) {
    return this.atletasService.atualizarPerfil(usuario.id, dto);
  }

  @Post('me/responsaveis')
  solicitarVinculoResponsavel(@CurrentUser() usuario: AuthenticatedUser, @Body() dto: SolicitarVinculoDto) {
    return this.atletasService.solicitarVinculoResponsavel(usuario.id, dto);
  }

  @Get('me/responsaveis')
  listarVinculos(@CurrentUser() usuario: AuthenticatedUser) {
    return this.atletasService.listarVinculos(usuario.id);
  }

  @Post('me/clubes')
  solicitarVinculoClube(@CurrentUser() usuario: AuthenticatedUser, @Body() dto: SolicitarVinculoClubeDto) {
    return this.atletasService.solicitarVinculoClube(usuario.id, dto);
  }

  @Get('me/clubes')
  listarVinculosClube(@CurrentUser() usuario: AuthenticatedUser) {
    return this.atletasService.listarVinculosClube(usuario.id);
  }

  @Get('me/candidaturas')
  listarCandidaturas(@CurrentUser() usuario: AuthenticatedUser) {
    return this.atletasService.listarCandidaturas(usuario.id);
  }

  @Get('me/selos')
  listarSelos(@CurrentUser() usuario: AuthenticatedUser) {
    return this.atletasService.listarSelos(usuario.id);
  }

  @Post('me/clubes-seguidos/:clubeId')
  seguirClube(@CurrentUser() usuario: AuthenticatedUser, @Param('clubeId') clubeId: string) {
    return this.atletasService.seguirClube(usuario.id, clubeId);
  }

  @Delete('me/clubes-seguidos/:clubeId')
  deixarDeSeguir(@CurrentUser() usuario: AuthenticatedUser, @Param('clubeId') clubeId: string) {
    return this.atletasService.deixarDeSeguir(usuario.id, clubeId);
  }

  @Get('me/clubes-seguidos')
  listarClubesSeguidos(@CurrentUser() usuario: AuthenticatedUser) {
    return this.atletasService.listarClubesSeguidos(usuario.id);
  }

  @Post('me/interesses')
  async registrarInteresse(@CurrentUser() usuario: AuthenticatedUser, @Body() dto: RegistrarInteresseDto) {
    const atleta = await this.atletasService.buscarPerfilProprio(usuario.id);
    return this.matchService.registrarInteresse(
      atleta.id,
      dto.atorTipo,
      dto.atorId,
      DirecaoInteresse.ATLETA_PARA_ATOR,
    );
  }

  @Get('me/matches')
  async listarMatches(@CurrentUser() usuario: AuthenticatedUser) {
    const atleta = await this.atletasService.buscarPerfilProprio(usuario.id);
    return this.matchService.listarPorAtleta(atleta.id);
  }

  @Get(':id')
  buscarPorId(@CurrentUser() usuario: AuthenticatedUser, @Param('id') id: string) {
    return this.atletasService.buscarPorId(id, usuario.id);
  }
}
