import { PartialType } from '@nestjs/mapped-types';
import { CreateAtletaDto } from './create-atleta.dto';

export class UpdateAtletaDto extends PartialType(CreateAtletaDto) {}
