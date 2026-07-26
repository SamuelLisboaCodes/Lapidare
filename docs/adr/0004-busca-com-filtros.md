# ADR 0004 — Estratégia de busca com filtros pesados

## Contexto
RN-06 exige busca por posição, categoria, cidade/estado, com ranking
heurístico. Volume esperado no MVP: dezenas a poucas centenas de atletas
(1 clube piloto + descoberta orgânica em vôlei), não milhões.

## Opções consideradas
- **(a) Postgres nativo** — índices B-tree nas colunas de filtro
  (posição, categoria, cidade/estado) + extensão `pg_trgm` para busca
  textual fuzzy em nome/bio.
- **(b) Motor de busca dedicado** (Elasticsearch, Typesense ou Meilisearch)
  desde o MVP.

## Decisão
(a) Postgres nativo.

## Consequências
- Zero infraestrutura nova, zero pipeline de sincronização de índice para
  manter consistente com o banco transacional.
- Filtros estruturados (enum, faixa de idade, localização) são rápidos com
  índice simples nesse volume.
- Busca textual fica limitada a fuzzy matching básico via `pg_trgm` — não
  há relevância semântica sofisticada, o que é aceitável para nome/bio
  curtos.
- Reavaliar Typesense ou Meilisearch (mais simples de operar que
  Elasticsearch) quando o volume de atletas ativos ou a necessidade de
  busca textual relevante crescerem — provável gatilho: múltiplos esportes
  e milhares de atletas simultâneos (V1/V2), não antes.
