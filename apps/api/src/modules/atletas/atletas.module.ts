import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { MatchModule } from '../match/match.module';
import { SelosModule } from '../selos/selos.module';
import { AtletasController } from './atletas.controller';
import { AtletasService } from './atletas.service';

@Module({
  imports: [AuthModule, MatchModule, SelosModule],
  controllers: [AtletasController],
  providers: [AtletasService],
  exports: [AtletasService],
})
export class AtletasModule {}
