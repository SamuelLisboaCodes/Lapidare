import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { AuthenticatedUser, CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ChatService } from './chat.service';

@UseGuards(JwtAuthGuard)
@Controller('conversas')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Get(':id/mensagens')
  listarMensagens(@CurrentUser() usuario: AuthenticatedUser, @Param('id') id: string) {
    return this.chatService.listarMensagens(usuario.id, id);
  }
}
