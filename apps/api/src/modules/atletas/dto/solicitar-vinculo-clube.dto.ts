import { TipoVinculoClube } from '@prisma/client';
import { IsEnum, IsString } from 'class-validator';

export class SolicitarVinculoClubeDto {
  @IsString()
  clubeId!: string;

  @IsEnum(TipoVinculoClube)
  tipoVinculo!: TipoVinculoClube;
}
