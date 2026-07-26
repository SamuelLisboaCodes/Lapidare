# ADR 0003 — Prisma e modelagem das relações polimórficas

## Contexto
O modelo de domínio (`docs/03-modelo-dominio.md`) tem casos de "ator
polimórfico": `Interesse`/`Match` (o outro lado pode ser Clube, Empresário
ou Patrocinador) e `Assinatura` (mesmo conjunto de titulares). Prisma não
tem suporte nativo a relações polimórficas (union de FK).

## Opções consideradas
- **(a) `ator_tipo` (enum) + `ator_id` sem FK real** — simples, mas o banco
  não impede um `ator_id` apontar para um registro inexistente.
- **(b) 3 colunas FK nullable** (`clube_id`, `empresario_id`,
  `patrocinador_id`) **+ CHECK constraint** garantindo exatamente uma
  não-nula.
- **(c) 3 tabelas separadas** (`InteresseClube`, `InteresseEmpresario`,
  `InteressePatrocinador`), duplicando a estrutura.

## Decisão
Opção (b). Colunas FK nullable com CHECK constraint no Postgres.

## Consequências
- Integridade referencial real: o Postgre impede um `Interesse`/
  `Assinatura` apontar para um Clube/Empresário/Patrocinador que não existe.
- Custo pequeno (3 colunas em vez de 1) comparado à opção (a).
- Evita a duplicação de lógica de negócio da opção (c) — uma única tabela,
  um único conjunto de regras e migrations.
- Se um 4º tipo de ator surgir (improvável — os 4 públicos já estão
  fechados no PRD), exige migration adicionando coluna + ajustando o CHECK.
