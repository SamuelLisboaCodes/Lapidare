import { TipoEntidadeDenuncia } from '@prisma/client';
import { IsEnum, IsString, MinLength } from 'class-validator';

export class CriarDenunciaDto {
  @IsEnum(TipoEntidadeDenuncia)
  entidadeTipo!: TipoEntidadeDenuncia;

  @IsString()
  entidadeId!: string;

  @IsString()
  @MinLength(3)
  motivo!: string;
}
