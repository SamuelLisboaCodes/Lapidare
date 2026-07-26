import { Module } from '@nestjs/common';
import { SelosService } from './selos.service';

@Module({
  providers: [SelosService],
  exports: [SelosService],
})
export class SelosModule {}
