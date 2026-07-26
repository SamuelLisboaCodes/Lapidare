import { Body, Controller, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { AdminGuard } from '../../common/guards/admin.guard';
import { AtualizarVerificacaoDto } from '../../common/dto/atualizar-verificacao.dto';
import { AuthenticatedUser, CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreatePatrocinadorDto } from './dto/create-patrocinador.dto';
import { PatrocinadoresService } from './patrocinadores.service';

@UseGuards(JwtAuthGuard)
@Controller('patrocinadores')
export class PatrocinadoresController {
  constructor(private readonly patrocinadoresService: PatrocinadoresService) {}

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
}
