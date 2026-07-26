import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { MatchModule } from '../match/match.module';
import { EmpresariosController } from './empresarios.controller';
import { EmpresariosService } from './empresarios.service';

@Module({
  imports: [AuthModule, MatchModule],
  controllers: [EmpresariosController],
  providers: [EmpresariosService],
})
export class EmpresariosModule {}
