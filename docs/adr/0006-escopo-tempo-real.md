# ADR 0006 — Escopo de tempo real (WebSocket) no MVP

## Contexto
Pergunta aberta do modelo de domínio (`docs/03-modelo-dominio.md` §6):
chat e notificações precisam de WebSocket já no MVP?

## Opções consideradas
- **(a) WebSocket para tudo** (chat + notificações) desde o MVP.
- **(b) WebSocket só para chat** (`Conversa`/`Mensagem`, RN-05);
  notificações (RN-01, RN-08) via fetch ao carregar/focar a aplicação.
- **(c) Nada de tempo real no MVP** — polling manual/refresh de página em
  tudo, inclusive chat.

## Decisão
(b). Chat é a única experiência em que a ausência de tempo real é
percebida como "quebrada" (conversa após match, RN-05). Notificações de
peneira/aprovação são eventos esporádicos por natureza — um fetch ao
carregar a página é imperceptível frente a push, no volume esperado do
MVP.

## Consequências
- Superfície de infraestrutura de tempo real fica restrita a um único
  gateway WebSocket (módulo de Chat).
- Evita a complexidade de push de notificação (sem web push/FCM no MVP).
- Notificação "chega" só quando o usuário abre/foca a aplicação, não
  instantaneamente — aceitável no volume esperado.
- Reavaliar push real de notificação se houver evidência de que o atraso
  prejudica o loop de produto (ex.: peneiras com vagas limitadas que
  enchem rápido e o atleta perde a janela).
