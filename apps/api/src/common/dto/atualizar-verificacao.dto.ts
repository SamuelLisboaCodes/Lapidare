import { StatusVerificacaoConta } from '@prisma/client';
import { IsIn } from 'class-validator';

export class AtualizarVerificacaoDto {
  @IsIn([StatusVerificacaoConta.APROVADO, StatusVerificacaoConta.REJEITADO])
  status!: StatusVerificacaoConta;
}
