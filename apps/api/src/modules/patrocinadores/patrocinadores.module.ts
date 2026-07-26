import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { PatrocinadoresController } from './patrocinadores.controller';
import { PatrocinadoresService } from './patrocinadores.service';

@Module({
  imports: [AuthModule],
  controllers: [PatrocinadoresController],
  providers: [PatrocinadoresService],
})
export class PatrocinadoresModule {}
