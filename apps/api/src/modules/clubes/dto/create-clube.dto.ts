import { IsOptional, IsString, MinLength } from 'class-validator';

export class CreateClubeDto {
  @IsString()
  @MinLength(2)
  nomeFantasia!: string;

  @IsOptional()
  @IsString()
  documento?: string;

  @IsString()
  cidade!: string;

  @IsString()
  estado!: string;
}
