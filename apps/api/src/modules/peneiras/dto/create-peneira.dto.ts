import { CategoriaAtleta, PosicaoVolei } from '@prisma/client';
import { IsDateString, IsEnum, IsOptional, IsString, MinLength } from 'class-validator';

export class CreatePeneiraDto {
  @IsString()
  @MinLength(2)
  titulo!: string;

  @IsEnum(CategoriaAtleta)
  categoria!: CategoriaAtleta;

  @IsOptional()
  @IsEnum(PosicaoVolei)
  posicaoAlvo?: PosicaoVolei;

  @IsDateString()
  dataEvento!: string;

  @IsString()
  local!: string;

  @IsOptional()
  @IsString()
  descricao?: string;
}
