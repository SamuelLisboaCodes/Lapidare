import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { ModeracaoController } from './moderacao.controller';
import { ModeracaoService } from './moderacao.service';

@Module({
  imports: [AuthModule],
  controllers: [ModeracaoController],
  providers: [ModeracaoService],
})
export class ModeracaoModule {}
