# ADR 0001 — Estilo de API: REST

## Contexto
O MVP tem um único cliente controlado pelo próprio time (Next.js web), sem
parceiros externos consumindo a API ainda. As operações são majoritariamente
orientadas a recurso (atletas, clubes, peneiras, candidaturas, mensagens)
com regras de autorização por rota (RBAC de clube — RN-04; gate de
visibilidade de menor — RN-01).

## Opções consideradas
- **REST + OpenAPI** (via `@nestjs/swagger`).
- **GraphQL** (via `@nestjs/graphql`).
- **tRPC** — atrativo por ser TS ponta a ponta no mesmo monorepo
  (Next.js + NestJS), sem boilerplate de DTOs nem schema GraphQL. Descartado
  porque acopla fortemente frontend e backend ao mesmo repositório/tipos,
  o que dificulta expor a API a um futuro app mobile nativo ou a parceiros
  (ex.: integração com a CBV em V3) sem reescrever a camada de contrato.

## Decisão
REST + OpenAPI para o MVP.

## Consequências
- Guards de rota mapeiam 1:1 com as regras de RBAC/RN-01, o que simplifica
  auditoria de segurança.
- Cache HTTP, rate limiting e observabilidade por rota são triviais.
- Menos flexível para telas que precisem agregar dados de vários recursos
  de uma vez — mitigado criando endpoints compostos específicos quando
  necessário (ex.: `GET /atletas/:id/perfil-completo`), não adotando
  GraphQL só para isso.
- Reavaliar GraphQL (como camada adicional, não substituta) somente se
  surgir necessidade real de múltiplos consumidores com formatos de dados
  muito diferentes entre si.
