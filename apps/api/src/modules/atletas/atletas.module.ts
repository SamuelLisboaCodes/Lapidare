import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { AtletasController } from './atletas.controller';
import { AtletasService } from './atletas.service';

@Module({
  imports: [AuthModule],
  controllers: [AtletasController],
  providers: [AtletasService],
  exports: [AtletasService],
})
export class AtletasModule {}
