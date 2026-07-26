import { CategoriaAtleta, PosicaoVolei } from '@prisma/client';
import { IsEnum, IsOptional } from 'class-validator';

export class ListarPeneirasDto {
  @IsOptional()
  @IsEnum(CategoriaAtleta)
  categoria?: CategoriaAtleta;

  @IsOptional()
  @IsEnum(PosicaoVolei)
  posicaoAlvo?: PosicaoVolei;
}
