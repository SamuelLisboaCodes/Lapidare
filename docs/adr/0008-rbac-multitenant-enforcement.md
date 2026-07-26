# ADR 0008 — Enforcement de RBAC/multi-tenant de clube

## Contexto
RN-04 exige que membros de um clube só vejam/ajam sobre dados do(s)
clube(s) a que pertencem, com papel Admin/Membro definindo o que podem
fazer (multi-tenant desde o início, conforme `CLAUDE.md` §3).

## Opções consideradas
- **(a) Enforcement na camada de aplicação** — NestJS Guards/decorators que
  checam `MembroClube.papel` e o `clube_id` do recurso acessado.
- **(b) Postgres Row-Level Security (RLS)** aplicando a mesma regra no
  nível do banco, independente da camada de aplicação.

## Decisão
(a) para o MVP — Guards/decorators no NestJS, cobertos por testes de
integração para os cenários de RBAC (ex.: Membro não pode convidar outro
membro; usuário não pode ver clube ao qual não pertence).

## Consequências
- Mais simples de implementar e depurar com Prisma sem gerenciar policies
  SQL separadas do schema.
- Depende de disciplina: todo novo endpoint que toca dado de clube precisa
  aplicar o guard certo — mitigado aplicando um guard padrão a nível de
  módulo (não por endpoint individual), para que esquecer seja a exceção,
  não a regra.
- Reavaliar RLS como camada de defesa adicional (não substituta) se a
  superfície de dados sensíveis crescer o suficiente para justificar
  defesa em profundidade extra — por exemplo, se scouting reports privados
  de clubes concorrentes passarem a coexistir no mesmo banco.
