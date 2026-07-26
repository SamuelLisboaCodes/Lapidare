/**
 * Interesse/Match são polimórficos por 3 FKs nullable no schema
 * (clubeId, empresarioId, patrocinadorId — ADR 0003), sem enum TipoAtor
 * no Prisma. Este tipo existe só na camada de aplicação para navegar
 * qual FK usar em cada operação.
 */
export type TipoAtor = 'CLUBE' | 'EMPRESARIO' | 'PATROCINADOR';

export function campoAtor(atorTipo: TipoAtor): 'clubeId' | 'empresarioId' | 'patrocinadorId' {
  switch (atorTipo) {
    case 'CLUBE':
      return 'clubeId';
    case 'EMPRESARIO':
      return 'empresarioId';
    case 'PATROCINADOR':
      return 'patrocinadorId';
  }
}
