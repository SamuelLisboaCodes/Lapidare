import { Controller, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { AuthenticatedUser, CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ListarPeneirasDto } from './dto/listar-peneiras.dto';
import { PeneirasService } from './peneiras.service';

@UseGuards(JwtAuthGuard)
@Controller('peneiras')
export class PeneirasController {
  constructor(private readonly peneirasService: PeneirasService) {}

  @Get()
  listarAbertas(@Query() filtros: ListarPeneirasDto) {
    return this.peneirasService.listarAbertas(filtros);
  }

  @Get(':id')
  buscarPorId(@Param('id') id: string) {
    return this.peneirasService.buscarPorId(id);
  }

  @Post(':id/candidaturas')
  candidatar(@CurrentUser() usuario: AuthenticatedUser, @Param('id') id: string) {
    return this.peneirasService.candidatar(usuario.id, id);
  }
}
