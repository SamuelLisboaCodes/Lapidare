import { IsOptional, IsString, MinLength } from 'class-validator';

export class CreateEmpresarioDto {
  @IsString()
  @MinLength(2)
  nome!: string;

  @IsString()
  documento!: string;

  @IsOptional()
  @IsString()
  representa?: string;
}
