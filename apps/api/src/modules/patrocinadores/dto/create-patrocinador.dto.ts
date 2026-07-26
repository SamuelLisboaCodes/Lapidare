import { IsString, MinLength } from 'class-validator';

export class CreatePatrocinadorDto {
  @IsString()
  @MinLength(2)
  razaoSocial!: string;

  @IsString()
  @MinLength(11)
  cnpj!: string;
}
