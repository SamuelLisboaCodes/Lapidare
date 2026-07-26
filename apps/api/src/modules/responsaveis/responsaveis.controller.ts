import { Body, Controller, Get, Param, Post, Req, UseGuards } from '@nestjs/common';
import type { Request } from 'express';
import { AuthenticatedUser, CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateResponsavelDto } from './dto/create-responsavel.dto';
import { ResponsaveisService } from './responsaveis.service';

@UseGuards(JwtAuthGuard)
@Controller('responsaveis')
export class ResponsaveisController {
  constructor(private readonly responsaveisService: ResponsaveisService) {}

  @Post('me')
  criarPerfil(@CurrentUser() usuario: AuthenticatedUser, @Body() dto: CreateResponsavelDto) {
    return this.responsaveisService.criarPerfil(usuario.id, dto);
  }

  @Get('me')
  buscarPerfilProprio(@CurrentUser() usuario: AuthenticatedUser) {
    return this.responsaveisService.buscarPerfilProprio(usuario.id);
  }

  @Get('me/vinculos')
  listarVinculos(@CurrentUser() usuario: AuthenticatedUser) {
    return this.responsaveisService.listarVinculos(usuario.id);
  }

  @Post('me/vinculos/:id/aprovar')
  aprovar(@CurrentUser() usuario: AuthenticatedUser, @Param('id') id: string, @Req() req: Request) {
    return this.responsaveisService.aprovar(usuario.id, id, {
      ip: req.ip,
      userAgent: req.headers['user-agent'],
    });
  }

  @Post('me/vinculos/:id/revogar')
  revogar(@CurrentUser() usuario: AuthenticatedUser, @Param('id') id: string) {
    return this.responsaveisService.revogar(usuario.id, id);
  }
}
