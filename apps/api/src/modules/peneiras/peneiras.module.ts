import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { PeneirasController } from './peneiras.controller';
import { PeneirasService } from './peneiras.service';

@Module({
  imports: [AuthModule],
  controllers: [PeneirasController],
  providers: [PeneirasService],
  exports: [PeneirasService],
})
export class PeneirasModule {}
