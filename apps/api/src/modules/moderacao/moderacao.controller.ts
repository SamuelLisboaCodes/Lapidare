import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { AuthenticatedUser, CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CriarDenunciaDto } from './dto/criar-denuncia.dto';
import { ModeracaoService } from './moderacao.service';

@UseGuards(JwtAuthGuard)
@Controller('moderacao')
export class ModeracaoController {
  constructor(private readonly moderacaoService: ModeracaoService) {}

  @Post('denuncias')
  criarDenuncia(@CurrentUser() usuario: AuthenticatedUser, @Body() dto: CriarDenunciaDto) {
    return this.moderacaoService.criarDenuncia(usuario.id, dto);
  }
}
