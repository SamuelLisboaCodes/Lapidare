import { Body, Controller, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { CurrentUser, AuthenticatedUser } from '../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AtletasService } from './atletas.service';
import { CreateAtletaDto } from './dto/create-atleta.dto';
import { SolicitarVinculoClubeDto } from './dto/solicitar-vinculo-clube.dto';
import { SolicitarVinculoDto } from './dto/solicitar-vinculo.dto';
import { UpdateAtletaDto } from './dto/update-atleta.dto';

@UseGuards(JwtAuthGuard)
@Controller('atletas')
export class AtletasController {
  constructor(private readonly atletasService: AtletasService) {}

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

  @Get(':id')
  buscarPorId(@CurrentUser() usuario: AuthenticatedUser, @Param('id') id: string) {
    return this.atletasService.buscarPorId(id, usuario.id);
  }
}
