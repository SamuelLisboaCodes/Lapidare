import { Module } from '@nestjs/common';
import { AtletasModule } from '../atletas/atletas.module';
import { AuthModule } from '../auth/auth.module';
import { ResponsaveisController } from './responsaveis.controller';
import { ResponsaveisService } from './responsaveis.service';

@Module({
  imports: [AuthModule, AtletasModule],
  controllers: [ResponsaveisController],
  providers: [ResponsaveisService],
})
export class ResponsaveisModule {}
