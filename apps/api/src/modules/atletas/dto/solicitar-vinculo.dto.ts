import { TipoRelacaoResponsavel } from '@prisma/client';
import { IsEmail, IsEnum } from 'class-validator';

export class SolicitarVinculoDto {
  @IsEmail()
  email!: string;

  @IsEnum(TipoRelacaoResponsavel)
  tipoRelacao!: TipoRelacaoResponsavel;
}
