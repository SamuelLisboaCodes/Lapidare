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

## Nota de implementação (Bloco 4, 2026-07-26)
Na prática, o score é calculado em **código da aplicação** após um
`findMany` do Prisma com os filtros como `WHERE` (`AtletasService.buscar`),
não em `ORDER BY` de SQL cru. Motivo: o volume do MVP (dezenas de atletas)
torna ordenar em memória com custo desprezível, e evita `$queryRaw` do
Prisma (perde type-safety para ganhar uma otimização que não é gargalo
neste volume). O espírito da decisão (a) — fórmula simples de pesos, sem
serviço separado, sem ML — continua o mesmo; só a mecânica mudou. Ainda
sem o termo de "selos" no score (depende de LAP-046, não implementado).
Reavaliar mover para SQL se o volume crescer a ponto de ordenar em memória
virar gargalo real — não antes disso.

## Nota de implementação 2 (LAP-046, 2026-07-26)
Selos implementados (`SelosModule`) — o score agora é
`0.5 * completude + 0.2 * (selos/4) + 0.3 * recência` (pesos
redistribuídos para abrir espaço ao termo de selos). Fecha a pendência
registrada na nota anterior.
