export const CAMPOS_OPCIONAIS_COMPLETUDE = [
  'alturaCm',
  'envergaduraCm',
  'alcanceAtaqueCm',
  'alcanceBloqueioCm',
  'bio',
] as const;

type AtletaComCamposOpcionais = Record<(typeof CAMPOS_OPCIONAIS_COMPLETUDE)[number], unknown>;

export function contarCamposPreenchidos(atleta: AtletaComCamposOpcionais): number {
  return CAMPOS_OPCIONAIS_COMPLETUDE.filter(
    (campo) => atleta[campo] !== null && atleta[campo] !== undefined && atleta[campo] !== '',
  ).length;
}

/** Critério do selo PERFIL_COMPLETO: todos os campos opcionais preenchidos. */
export function perfilTemTodosCamposOpcionais(atleta: AtletaComCamposOpcionais): boolean {
  return contarCamposPreenchidos(atleta) === CAMPOS_OPCIONAIS_COMPLETUDE.length;
}
