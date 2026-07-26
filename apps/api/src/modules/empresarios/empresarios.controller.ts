import { Body, Controller, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { DirecaoInteresse } from '@prisma/client';
import { AdminGuard } from '../../common/guards/admin.guard';
import { AtualizarVerificacaoDto } from '../../common/dto/atualizar-verificacao.dto';
import { AuthenticatedUser, CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { MatchService } from '../match/match.service';
import { CreateEmpresarioDto } from './dto/create-empresario.dto';
import { EmpresariosService } from './empresarios.service';

@UseGuards(JwtAuthGuard)
@Controller('empresarios')
export class EmpresariosController {
  constructor(
    private readonly empresariosService: EmpresariosService,
    private readonly matchService: MatchService,
  ) {}

  @Post('me')
  criarPerfil(@CurrentUser() usuario: AuthenticatedUser, @Body() dto: CreateEmpresarioDto) {
    return this.empresariosService.criarPerfil(usuario.id, dto);
  }

  @Get('me')
  buscarPerfilProprio(@CurrentUser() usuario: AuthenticatedUser) {
    return this.empresariosService.buscarPerfilProprio(usuario.id);
  }

  @UseGuards(AdminGuard)
  @Patch(':id/verificacao')
  atualizarVerificacao(@Param('id') id: string, @Body() dto: AtualizarVerificacaoDto) {
    return this.empresariosService.atualizarVerificacao(id, dto);
  }

  @Post('me/interesses/:atletaId')
  async registrarInteresse(@CurrentUser() usuario: AuthenticatedUser, @Param('atletaId') atletaId: string) {
    const empresario = await this.empresariosService.buscarPerfilProprio(usuario.id);
    return this.matchService.registrarInteresse(
      atletaId,
      'EMPRESARIO',
      empresario.id,
      DirecaoInteresse.ATOR_PARA_ATLETA,
    );
  }

  @Get('me/matches')
  async listarMatches(@CurrentUser() usuario: AuthenticatedUser) {
    const empresario = await this.empresariosService.buscarPerfilProprio(usuario.id);
    return this.matchService.listarPorAtor('EMPRESARIO', empresario.id);
  }
}
