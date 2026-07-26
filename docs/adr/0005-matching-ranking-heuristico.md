# ADR 0005 — Matching e ranking heurístico sem overengineering

## Contexto
RN-06 define o ranking de busca por (1) compatibilidade de filtro exato,
(2) completude de perfil, (3) selos conquistados, (4) recência de
atividade. `CLAUDE.md` pede explicitamente "comece simples (regras +
ranking heurístico) antes de ML pesado".

## Opções consideradas
- **(a) Score computado na própria query SQL** — fórmula de pesos aplicada
  direto no `ORDER BY` da consulta de busca, dentro do módulo de busca do
  monólito.
- **(b) Serviço de recomendação separado** (mesmo que baseado em regras),
  consultado via chamada interna.
- **(c) Pipeline de ML** (embeddings, modelo treinado) desde já.

## Decisão
(a) — `ORDER BY (peso1 * match_filtro + peso2 * completude + peso3 *
selos + peso4 * recencia) DESC`, calculado na query, com os pesos
configuráveis (não hardcoded) para poder ajustar sem deploy enquanto
aprendemos o que de fato importa.

## Consequências
- Zero infraestrutura extra; qualquer engenheiro consegue auditar e ajustar
  a fórmula lendo a query.
- Não captura padrões não-lineares ou correlações que um modelo aprenderia
  — aceitável, pois não há dados de uso reais ainda para treinar algo
  melhor.
- Reavaliar ML real (ranking treinado com dados de cliques/matches) apenas
  quando houver volume de interação suficiente **e** evidência concreta de
  que a heurística está deixando valor na mesa — não antes de V2.
