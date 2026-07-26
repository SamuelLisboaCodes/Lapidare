import { IsString, Length, MinLength } from 'class-validator';

export class CreateResponsavelDto {
  @IsString()
  @MinLength(2)
  nome!: string;

  @IsString()
  @Length(11, 14)
  cpf!: string;

  @IsString()
  @MinLength(8)
  telefone!: string;
}
