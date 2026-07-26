import { JwtService } from '@nestjs/jwt';
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ChatService } from './chat.service';

interface JwtPayload {
  sub: string;
  email: string;
}

@WebSocketGateway({ cors: { origin: '*' } })
export class ChatGateway implements OnGatewayConnection {
  @WebSocketServer()
  server!: Server;

  constructor(
    private readonly jwtService: JwtService,
    private readonly chatService: ChatService,
  ) {}

  handleConnection(client: Socket) {
    const token = client.handshake.auth?.token as string | undefined;
    if (!token) {
      client.disconnect(true);
      return;
    }

    try {
      const payload = this.jwtService.verify<JwtPayload>(token);
      client.data.usuarioId = payload.sub;
    } catch {
      client.disconnect(true);
    }
  }

  @SubscribeMessage('entrar')
  async entrar(@ConnectedSocket() client: Socket, @MessageBody() body: { conversaId: string }) {
    const acesso = await this.chatService.podeAcessar(client.data.usuarioId, body.conversaId);
    if (!acesso.podeLer) {
      client.emit('erro', { mensagem: 'Você não tem acesso a esta conversa.' });
      return;
    }
    await client.join(body.conversaId);
    client.emit('entrou', { conversaId: body.conversaId });
  }

  @SubscribeMessage('mensagem')
  async mensagem(
    @ConnectedSocket() client: Socket,
    @MessageBody() body: { conversaId: string; conteudo: string },
  ) {
    try {
      const mensagem = await this.chatService.enviarMensagem(
        client.data.usuarioId,
        body.conversaId,
        body.conteudo,
      );
      this.server.to(body.conversaId).emit('mensagem', mensagem);
    } catch (erro) {
      client.emit('erro', {
        mensagem: erro instanceof Error ? erro.message : 'Erro ao enviar mensagem.',
      });
    }
  }
}
