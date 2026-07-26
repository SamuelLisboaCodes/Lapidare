import { CategoriaAtleta, PosicaoVolei } from '@prisma/client';
import { IsEnum, IsOptional, IsString } from 'class-validator';

export class BuscarAtletasDto {
  @IsOptional()
  @IsEnum(PosicaoVolei)
  posicao?: PosicaoVolei;

  @IsOptional()
  @IsEnum(CategoriaAtleta)
  categoria?: CategoriaAtleta;

  @IsOptional()
  @IsString()
  cidade?: string;

  @IsOptional()
  @IsString()
  estado?: string;
}
