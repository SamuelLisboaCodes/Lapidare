import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { MatchModule } from '../match/match.module';
import { PatrocinadoresController } from './patrocinadores.controller';
import { PatrocinadoresService } from './patrocinadores.service';

@Module({
  imports: [AuthModule, MatchModule],
  controllers: [PatrocinadoresController],
  providers: [PatrocinadoresService],
})
export class PatrocinadoresModule {}
