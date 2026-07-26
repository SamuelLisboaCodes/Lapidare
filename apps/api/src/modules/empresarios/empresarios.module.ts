import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { EmpresariosController } from './empresarios.controller';
import { EmpresariosService } from './empresarios.service';

@Module({
  imports: [AuthModule],
  controllers: [EmpresariosController],
  providers: [EmpresariosService],
})
export class EmpresariosModule {}
