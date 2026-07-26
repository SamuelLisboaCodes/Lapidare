import { PapelClube } from '@prisma/client';
import { IsEmail, IsEnum, IsOptional } from 'class-validator';

export class ConvidarMembroDto {
  @IsEmail()
  email!: string;

  @IsOptional()
  @IsEnum(PapelClube)
  papel?: PapelClube;
}
