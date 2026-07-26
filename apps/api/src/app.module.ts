import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { AtletasModule } from './modules/atletas/atletas.module';
import { ResponsaveisModule } from './modules/responsaveis/responsaveis.module';
import { ClubesModule } from './modules/clubes/clubes.module';
import { EmpresariosModule } from './modules/empresarios/empresarios.module';
import { PatrocinadoresModule } from './modules/patrocinadores/patrocinadores.module';
import { PeneirasModule } from './modules/peneiras/peneiras.module';
import { MatchModule } from './modules/match/match.module';
import { ChatModule } from './modules/chat/chat.module';
import { NotificacoesModule } from './modules/notificacoes/notificacoes.module';
import { ModeracaoModule } from './modules/moderacao/moderacao.module';
import { BillingModule } from './modules/billing/billing.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ThrottlerModule.forRoot([{ ttl: 60_000, limit: 60 }]),
    PrismaModule,
    AuthModule,
    AtletasModule,
    ResponsaveisModule,
    ClubesModule,
    EmpresariosModule,
    PatrocinadoresModule,
    PeneirasModule,
    MatchModule,
    ChatModule,
    NotificacoesModule,
    ModeracaoModule,
    BillingModule,
  ],
  providers: [{ provide: APP_GUARD, useClass: ThrottlerGuard }],
})
export class AppModule {}
