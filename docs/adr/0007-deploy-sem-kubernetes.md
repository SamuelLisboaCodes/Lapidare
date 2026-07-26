# ADR 0007 — Deploy sem Kubernetes no MVP

## Contexto
`CLAUDE.md` §4 propõe Docker + Kubernetes (futuro) + AWS, mas pede
validação crítica da stack. Fundador solo, sem orçamento definido, 1
cliente piloto em prospecção.

## Opções consideradas
- **(a) Kubernetes desde já** (AWS EKS).
- **(b) Container gerenciado sem orquestração própria** (AWS ECS Fargate
  ou App Runner).
- **(c) PaaS de terceiro fora da AWS** (Railway, Render, Fly.io) durante a
  fase de validação, antes de qualquer receita.

## Decisão
Docker (mantido — útil para paridade dev/prod e CI, independente da
decisão de orquestração) + **AWS ECS Fargate** para rodar o monólito.
Kubernetes é overengineering explícito neste estágio.

## Consequências
- Zero cluster para provisionar, atualizar e proteger sozinho.
- Custo proporcional ao uso real (Fargate cobra por task rodando, sem nó
  ocioso à espera de tráfego que não existe ainda).
- O requisito de "10 milhões de usuários" do `CLAUDE.md` §2.5 é atendido
  por ECS Fargate com auto-scaling até uma escala muito maior que qualquer
  cenário do MVP/V1 — Kubernetes não é o gargalo dessa meta neste estágio.
- Migração para EKS, se um dia fizer sentido, exige trabalho de migração —
  aceitável, pois esse dia só chega se/quando o monólito for de fato
  dividido em múltiplos serviços (ADR 0002) em número que justifique
  orquestração própria.
- **Nota à margem:** para a fase pré-tração (antes de qualquer cliente
  pagante), um PaaS como Render/Fly.io reduziria o custo operacional a
  quase zero comparado a ECS. Não adotado como decisão formal aqui porque
  `CLAUDE.md` já define AWS como nuvem-alvo, mas vale considerar como
  ambiente de staging/demo enquanto se conversa com a JF Vôlei.
