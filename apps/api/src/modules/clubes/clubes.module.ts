import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { ClubesController } from './clubes.controller';
import { ClubesService } from './clubes.service';
import { ClubeAdminGuard } from './guards/clube-admin.guard';
import { ClubeMembroGuard } from './guards/clube-membro.guard';

@Module({
  imports: [AuthModule],
  controllers: [ClubesController],
  providers: [ClubesService, ClubeAdminGuard, ClubeMembroGuard],
  exports: [ClubesService],
})
export class ClubesModule {}
