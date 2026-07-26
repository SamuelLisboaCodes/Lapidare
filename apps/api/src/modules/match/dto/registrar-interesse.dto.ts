import { IsIn, IsString } from 'class-validator';
import { TipoAtor } from '../tipo-ator';

const TIPOS_ATOR: TipoAtor[] = ['CLUBE', 'EMPRESARIO', 'PATROCINADOR'];

export class RegistrarInteresseDto {
  @IsIn(TIPOS_ATOR)
  atorTipo!: TipoAtor;

  @IsString()
  atorId!: string;
}
