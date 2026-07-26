import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { MatchService } from './match.service';

@Module({
  imports: [AuthModule],
  providers: [MatchService],
  exports: [MatchService],
})
export class MatchModule {}
