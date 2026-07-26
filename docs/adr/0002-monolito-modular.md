# ADR 0002 — Monólito modular (não microsserviços) no MVP

## Contexto
Fundador solo, MVP com 1 esporte e 1 cliente piloto em prospecção (JF
Vôlei), sem tráfego real ainda. `CLAUDE.md` pede arquitetura "pensada para
milhões de usuários", mas também prioriza cortar escopo no MVP.

## Opções consideradas
- **Microsserviços desde já** (Auth, Atletas, Clubes, Match/Chat,
  Notificações etc. como serviços separados).
- **Monólito modular**: um único deploy, dividido em módulos NestJS por
  domínio (Auth, Atletas, Responsaveis, Clubes, Peneiras, Match/Chat,
  Notificacoes, Billing), com fronteiras de import explícitas.
- **Monólito sem modularização** (tudo misturado, sem fronteiras).

## Decisão
Monólito modular. Cada módulo Nest expõe uma interface de serviço clara;
módulos não importam direto de dentro de outro módulo, só através do que é
exportado.

## Consequências
- Um único pipeline de deploy/CI/observabilidade — barato de operar para
  1 pessoa.
- Chamadas entre "domínios" são em memória (sem latência de rede, sem
  necessidade de service mesh, retries, etc. que microsserviços exigem).
- Exige disciplina para não deixar módulos vazarem acoplamento — mitigado
  por revisão de código e, se necessário mais adiante, lint de fronteiras
  de import (ex. `eslint-plugin-boundaries`).
- Caminho de extração para microsserviço fica mais barato no futuro
  exatamente por já existir a fronteira de módulo — se um domínio
  específico (ex.: Chat, sob carga de WebSocket) precisar escalar ou ser
  operado isoladamente, extrai-se esse módulo, não o sistema todo de uma
  vez.
- Reavaliar split em serviços separados apenas quando um módulo específico
  tiver requisito real de escala/deploy/time dedicado que o monólito não
  atenda — não antes de V2/V3.
