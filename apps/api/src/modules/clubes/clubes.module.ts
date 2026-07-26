import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { MatchModule } from '../match/match.module';
import { PeneirasModule } from '../peneiras/peneiras.module';
import { SelosModule } from '../selos/selos.module';
import { ClubesController } from './clubes.controller';
import { ClubesService } from './clubes.service';
import { ClubeAdminGuard } from './guards/clube-admin.guard';
import { ClubeMembroGuard } from './guards/clube-membro.guard';

@Module({
  imports: [AuthModule, PeneirasModule, MatchModule, SelosModule],
  controllers: [ClubesController],
  providers: [ClubesService, ClubeAdminGuard, ClubeMembroGuard],
  exports: [ClubesService],
})
export class ClubesModule {}
