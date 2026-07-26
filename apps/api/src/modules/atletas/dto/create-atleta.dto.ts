import { CategoriaAtleta, PosicaoVolei } from '@prisma/client';
import { IsDateString, IsEnum, IsIn, IsInt, IsOptional, IsString, MinLength } from 'class-validator';

export class CreateAtletaDto {
  @IsString()
  @MinLength(2)
  nome!: string;

  @IsDateString()
  dataNascimento!: string;

  @IsIn(['M', 'F', 'OUTRO'])
  sexo!: string;

  @IsString()
  cidade!: string;

  @IsString()
  estado!: string;

  @IsEnum(PosicaoVolei)
  posicao!: PosicaoVolei;

  @IsEnum(CategoriaAtleta)
  categoria!: CategoriaAtleta;

  @IsOptional()
  @IsInt()
  alturaCm?: number;

  @IsOptional()
  @IsInt()
  envergaduraCm?: number;

  @IsOptional()
  @IsInt()
  alcanceAtaqueCm?: number;

  @IsOptional()
  @IsInt()
  alcanceBloqueioCm?: number;

  @IsOptional()
  @IsString()
  bio?: string;
}
