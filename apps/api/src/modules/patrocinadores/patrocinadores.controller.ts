import { Body, Controller, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { DirecaoInteresse } from '@prisma/client';
import { AdminGuard } from '../../common/guards/admin.guard';
import { AtualizarVerificacaoDto } from '../../common/dto/atualizar-verificacao.dto';
import { AuthenticatedUser, CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { MatchService } from '../match/match.service';
import { CreatePatrocinadorDto } from './dto/create-patrocinador.dto';
import { PatrocinadoresService } from './patrocinadores.service';

@UseGuards(JwtAuthGuard)
@Controller('patrocinadores')
export class PatrocinadoresController {
  constructor(
    private readonly patrocinadoresService: PatrocinadoresService,
    private readonly matchService: MatchService,
  ) {}

  @Post('me')
  criarPerfil(@CurrentUser() usuario: AuthenticatedUser, @Body() dto: CreatePatrocinadorDto) {
    return this.patrocinadoresService.criarPerfil(usuario.id, dto);
  }

  @Get('me')
  buscarPerfilProprio(@CurrentUser() usuario: AuthenticatedUser) {
    return this.patrocinadoresService.buscarPerfilProprio(usuario.id);
  }

  @UseGuards(AdminGuard)
  @Patch(':id/verificacao')
  atualizarVerificacao(@Param('id') id: string, @Body() dto: AtualizarVerificacaoDto) {
    return this.patrocinadoresService.atualizarVerificacao(id, dto);
  }

  @Post('me/interesses/:atletaId')
  async registrarInteresse(@CurrentUser() usuario: AuthenticatedUser, @Param('atletaId') atletaId: string) {
    const patrocinador = await this.patrocinadoresService.buscarPerfilProprio(usuario.id);
    return this.matchService.registrarInteresse(
      atletaId,
      'PATROCINADOR',
      patrocinador.id,
      DirecaoInteresse.ATOR_PARA_ATLETA,
    );
  }

  @Get('me/matches')
  async listarMatches(@CurrentUser() usuario: AuthenticatedUser) {
    const patrocinador = await this.patrocinadoresService.buscarPerfilProprio(usuario.id);
    return this.matchService.listarPorAtor('PATROCINADOR', patrocinador.id);
  }
}
