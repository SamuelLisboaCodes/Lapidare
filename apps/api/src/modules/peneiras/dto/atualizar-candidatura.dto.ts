import { StatusCandidaturaPeneira } from '@prisma/client';
import { IsIn } from 'class-validator';

export class AtualizarCandidaturaDto {
  @IsIn([
    StatusCandidaturaPeneira.EM_AVALIACAO,
    StatusCandidaturaPeneira.APROVADO,
    StatusCandidaturaPeneira.REPROVADO,
  ])
  status!: StatusCandidaturaPeneira;
}
