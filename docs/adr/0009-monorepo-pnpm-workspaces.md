# ADR 0009 — Monorepo com pnpm workspaces (sem Turborepo/Nx por agora)

## Contexto
Um único fundador mantém simultaneamente o frontend (Next.js) e o backend
(NestJS), que compartilham tipos e contratos (enums de posição/categoria de
vôlei, DTOs de request/response). Repositórios separados forçariam
duplicar esses tipos e sincronizar manualmente — risco real de divergência
silenciosa entre o que a API retorna e o que o frontend espera.

## Opções consideradas
- **Dois repositórios separados** (web, api) — mais simples de início, mas
  duplica tipos/contratos e exige coordenar 2 PRs para toda mudança de
  contrato de API.
- **Monorepo com pnpm workspaces**, sem orquestrador de build adicional.
- **Monorepo com Turborepo ou Nx** — trazem cache remoto de build e
  paralelização inteligente de tarefas, mas são ferramentas pensadas para
  múltiplos times/muitos pacotes; para 2 apps + 1 pacote compartilhado
  mantidos por 1 pessoa, o ganho não paga a complexidade extra ainda.

## Decisão
Monorepo com **pnpm workspaces** puro: `apps/web`, `apps/api`,
`packages/shared`. Sem Turborepo/Nx por agora.

## Consequências
- Tipos e enums do domínio (`packages/shared`) são importados por `web` e
  `api` sem duplicação — mudança de contrato é 1 PR, não 2.
- pnpm é mais rápido e econômico em disco que npm/yarn para workspaces,
  sem exigir uma ferramenta de orquestração adicional.
- Scripts de lint/test/build rodam via `pnpm -r` (recursivo) na raiz —
  suficiente no tamanho atual do monorepo.
- Reavaliar Turborepo/Nx se o tempo de build/test começar a doer (mais
  pacotes, mais apps) ou se cache remoto de CI se tornar um problema real
  de custo/tempo — não antes disso.
