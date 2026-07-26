# 04 — Plano de Segurança e LGPD (foco em menores)

> Depende de `docs/01`, `docs/02`, `docs/03` e `docs/adr/`. Este documento
> trata segurança/LGPD como requisito de primeira classe, conforme
> `CLAUDE.md` §5 — não é um apêndice de compliance, é o que decide se o
> Lapidare pode operar com responsabilidade dado que a maioria dos atletas
> é menor de idade.

---

## 1. Princípios

1. **O padrão é a exposição mínima.** Um dado só é coletado se houver uso
   concreto no MVP; um dado só é visível a terceiros se houver consentimento
   válido e finalidade clara.
2. **Menor de idade é o caso central, não a exceção.** Todo fluxo é
   desenhado assumindo que o atleta é menor; o caminho do adulto é o desvio
   mais simples, não o contrário.
3. **Mídia de menor é a maior superfície de risco do produto.** Trato
   moderação de vídeo/foto como bloqueador de lançamento, não como
   melhoria futura.
4. **Consentimento tem que ser prova, não só um clique.** Se um dia
   formos questionados (pelo titular, por um clube, pela ANPD), precisamos
   conseguir mostrar exatamente o que foi consentido, quando e por quem.

---

## 2. Base legal por categoria de dado (LGPD art. 7º e 14º)

| Categoria de dado | Base legal | Observação |
|---|---|---|
| Cadastro/login (e-mail, senha) | Execução de contrato (art. 7º, V) | Necessário para prestar o serviço. |
| Perfil de atleta **adulto** | Consentimento do titular (art. 7º, I) | O próprio atleta consente ao se cadastrar. |
| Perfil de atleta **menor** | Consentimento específico do responsável legal (art. 14, §1º) | Precisa ser destacado, específico, não genérico — ver §4. |
| Dados do responsável legal (nome, CPF, telefone) | Execução de contrato + cumprimento de obrigação legal (ECA) | Coletado só o necessário para identificar e notificar o responsável. |
| Mídia (vídeos/fotos) | Consentimento específico (titular ou responsável) | Consentimento **separado** do consentimento de perfil — ver §7. |
| Mensagens (chat) | Execução de contrato + legítimo interesse (segurança) | Retenção justificada por segurança/moderação, não só operação. |
| Dados de verificação de clube/empresário/patrocinador (KYC manual) | Cumprimento de obrigação + legítimo interesse (prevenção a fraude) | Ver RN-03. |
| Logs de acesso/segurança | Legítimo interesse (art. 7º, IX) | Prazo de retenção limitado — ver §11. |

---

## 3. Minimização de dados — o que coletamos e o que deliberadamente não coletamos

**Coletamos (essencial ao produto):**
- Atleta: nome, data de nascimento, sexo, cidade/estado, medidas físicas
  relevantes ao vôlei, posição, categoria, histórico de clube, mídia.
- Responsável: nome, CPF, telefone (necessário para identificar quem está
  autorizando e poder contatá-lo em caso de dúvida/incidente).
- Clube/Empresário/Patrocinador: documento de identificação institucional
  para a verificação manual (RN-03).

**Deliberadamente não coletamos no MVP:**
- **CPF do atleta menor** — não há finalidade que justifique; identificação
  do menor é feita através do responsável, não de um documento próprio.
- **Endereço residencial exato** — cidade/estado bastam para os filtros de
  busca; endereço completo é risco de segurança física sem benefício de
  produto.
- **Dados de geolocalização em tempo real** — fora de escopo total do MVP.
- **Dados biométricos** (reconhecimento facial em vídeos, etc.) — nenhuma
  funcionalidade do MVP precisa disso; qualquer proposta futura de análise
  de vídeo por IA (V3) precisa passar por uma revisão de LGPD própria antes
  de ser aceita, não é uma decisão implícita deste plano.

---

## 4. Consentimento do responsável — fluxo e evidência

Formaliza RN-01/RN-02 (`docs/02-prd-mvp.md`) com o requisito de que o
consentimento precisa ser **destacado, específico e demonstrável**:

- A aprovação do responsável não é um botão genérico de "aceitar" — o texto
  exibido no momento da aprovação nomeia explicitamente o que está sendo
  autorizado (visibilidade do perfil a clubes/empresários/patrocinadores,
  contato via chat interno mediado, upload de mídia).
- `VinculoResponsavelAtleta` (modelo de domínio, `docs/03`) ganha campos de
  auditoria: `versao_termo_aceito`, `ip_aprovacao`, `user_agent_aprovacao`,
  além dos já previstos `respondido_em`/`status`. Isso permite reconstruir,
  a qualquer momento, exatamente o que foi consentido.
- Consentimento de **perfil** e consentimento de **upload de mídia** são
  eventos distintos — aprovar o perfil não aprova automaticamente todo
  vídeo futuro; cada novo vídeo entra em fila de moderação (§7) antes de
  ficar público, e o responsável é notificado quando um novo vídeo é
  publicado.
- Revogação (RN-01) é sempre possível e imediata — ao revogar, o perfil
  volta a `OCULTO` e nenhuma nova aprovação de terceiros é possível até
  nova aprovação.

---

## 5. Gate de menor reforçado — mitigando o risco de idade autodeclarada falsa

O modelo de domínio (`docs/03`, §5) já registrou o risco: o atleta pode
informar uma `data_nascimento` falsa para pular o gate de aprovação. Para o
MVP, a mitigação não é tecnológica sofisticada (verificação documental
automatizada é V1+), é uma **regra de negócio mais conservadora**:

> **O gate de responsável é acionado se `idade calculada < 18` OU se o
> atleta está vinculado a uma categoria de base (sub-13 a sub-19) via
> `VinculoAtletaClube`, mesmo que a idade autodeclarada indique
> maioridade — a menos que o clube confirme explicitamente a maioridade do
> atleta.**

Isso funciona porque, no piloto com a JF Vôlei, a categoria de base é um
sinal institucional (o clube sabe a idade real de quem está matriculado),
muito mais difícil de falsificar do que um campo de formulário. Atletas
sem nenhum vínculo de clube confirmado (cadastro orgânico, fora do piloto)
seguem só com a idade autodeclarada como sinal — **risco residual
reconhecido, não eliminado**, a ser reavaliado em V1 com verificação
documental leve (ex.: confirmação de identidade do responsável via
documento, não do menor) se o volume de cadastros orgânicos crescer.

---

## 6. Visibilidade e exposição de dados de menores

O que aparece no **perfil público** (após aprovado, RN-01) de um menor:
nome, foto/vídeo aprovados, posição, categoria, clube(s) vinculado(s),
cidade/estado, selos, estatísticas autodeclaradas.

O que **nunca** aparece no perfil público, menor ou adulto:
- Telefone, e-mail, redes sociais pessoais, endereço.
- Contato só via chat interno mediado (RN-02) — reforçando que RBAC/gate
  de visibilidade não substitui a ausência de canal de contato direto.

Diferença adicional para **menores** especificamente: nome de escola (se
diferente do clube) e qualquer informação que, combinada, permita inferir
rotina/localização física recorrente (ex.: horário fixo de treino em local
específico) não é exibida no perfil público — só visível às partes com
vínculo confirmado (clube ao qual pertence).

---

## 7. Moderação de mídia e prevenção de abuso (P0 — não-negociável)

Dado que a plataforma hospeda vídeos/fotos de menores, este é o item de
maior risco legal e reputacional do produto — trato como bloqueador de
lançamento:

- **Toda mídia enviada entra em `status_moderacao = PENDENTE`** e só fica
  pública após revisão manual — viável no MVP porque o volume esperado
  (1 clube piloto) é baixo o suficiente para revisão humana (o próprio
  fundador, inicialmente).
- **Botão de denúncia** visível em todo perfil e toda mídia, endereçado a
  uma fila de revisão prioritária (nova entidade `Denuncia`: `id`,
  `denunciante_usuario_id`, `entidade_tipo`, `entidade_id`, `motivo`,
  `status`, `criado_em`).
- **Obrigação legal de reporte:** caso qualquer conteúdo sugira abuso ou
  exploração de menor, o processo é notificar as autoridades competentes
  (ECA art. 241-A; canais como SaferNet Brasil/Disque 100), preservando
  evidência antes de qualquer remoção — isso é política operacional, não
  algo a automatizar no MVP, mas precisa estar documentado e o fundador
  precisa saber que esse é o procedimento se algo aparecer.
- **Fora do MVP, para V1:** integração com serviço de hash-matching de
  CSAM (ex.: Thorn/Google CSAI Match) para triagem automática antes mesmo
  da revisão manual — hoje adiado porque o volume permite revisão 100%
  manual; se o volume crescer antes de termos essa integração, a revisão
  manual deixa de ser suficiente e isso vira bloqueador, não nice-to-have.

---

## 8. Segurança de comunicação

- Chat (RN-05) só é liberado após match mútuo (ou convite direto a
  peneira).
- Para conversas envolvendo menor: o responsável tem acesso de leitura a
  toda a conversa (RN-02) **e** é notificado imediatamente quando um novo
  match/conversa se abre envolvendo o menor — não só quando decide checar
  passivamente.
- Sem contato fora da plataforma no perfil público (§6) reduz o incentivo
  a mover a conversa para canais não mediados — mas mensagens podem tentar
  solicitar contato externo; fica registrado como possível gatilho de
  moderação futura (V1: flag automática por palavra-chave), fora do MVP.

---

## 9. Segurança técnica de base

- Senhas com hash `argon2id` (ou `bcrypt` com custo adequado) — nunca texto
  puro nem hash reversível.
- HTTPS obrigatório em todos os ambientes, incluindo staging.
- Segredos (chaves JWT, credenciais de banco/S3) em variáveis de ambiente
  geridas pelo provedor de deploy — nunca commitados no repositório.
- Rate limiting em endpoints de login/cadastro/recuperação de senha
  (prevenção a força bruta e credential stuffing).
- Validação de entrada em todos os DTOs (`class-validator` no NestJS) —
  mitiga injeção e dados malformados; Prisma já parametriza queries,
  mitigando SQL injection por padrão.
- Upload de mídia com limite de tipo/tamanho de arquivo antes de qualquer
  processamento.
- Dependências com scan de vulnerabilidade no pipeline de CI (etapa 6).

---

## 10. Direitos do titular e canal de atendimento

LGPD art. 18 garante ao titular (ou ao responsável, em nome do menor):
acesso, correção, eliminação, portabilidade e revogação de consentimento.

MVP: um canal simples (e-mail dedicado, ex. `privacidade@lapidare...`) para
essas solicitações, tratadas manualmente dado o volume — automação de
autoatendimento (ex.: botão "baixar meus dados") é V1+, não bloqueador de
lançamento, desde que o canal manual funcione e tenha prazo de resposta
definido (recomendo 15 dias, alinhado ao prazo usual de boas práticas
LGPD).

---

## 11. Retenção e eliminação de dados

- Dados de perfil: retidos enquanto a conta estiver ativa; eliminados ou
  anonimizados em até 30 dias após solicitação de exclusão, exceto o que a
  lei exigir manter (ex.: registro de consentimento, para defesa legal em
  caso de disputa — retido por prazo mais longo, com acesso restrito).
- Mensagens: retidas enquanto a conversa/conta existir; consideradas na
  exclusão de conta como as demais, respeitando a mesma exceção de
  registro de consentimento/moderação quando aplicável a uma denúncia em
  aberto.
- Logs de segurança/acesso: retenção limitada (recomendo 6 meses), depois
  descartados ou anonimizados.

---

## 12. Encarregado de dados e documentos obrigatórios

- LGPD art. 41 exige um Encarregado (DPO). No MVP, esse papel é do próprio
  fundador — formalizar isso já no site/app (nome + canal de contato,
  mesmo que seja o e-mail de privacidade do §10) é suficiente para o
  estágio atual; não exige contratar um DPO externo agora.
- Documentos que precisam existir **antes do primeiro atleta real se
  cadastrar** (não é código, é conteúdo, mas é bloqueador de lançamento
  tanto quanto qualquer feature): Política de Privacidade e Termos de Uso,
  escritos em linguagem acessível (o público inclui adolescentes e seus
  responsáveis, não só advogados).

---

## 13. Plano de resposta a incidentes (resumo)

LGPD art. 48 exige comunicar à ANPD e aos titulares afetados em caso de
incidente de segurança com risco relevante — com peso adicional dado que
os titulares incluem menores.

MVP: processo simples e documentado (não uma ferramenta):
1. Detectar/confirmar o incidente (ex.: acesso não autorizado, vazamento).
2. Conter (revogar credenciais, isolar o que for possível).
3. Avaliar risco aos titulares (com atenção redobrada se envolver dados de
   menores).
4. Notificar ANPD e titulares afetados em prazo razoável, com transparência
   sobre o que aconteceu e o que foi feito.
5. Registrar o incidente e a resposta para aprendizado — mesmo sendo só o
   fundador, documentar evita repetir o mesmo erro.

---

## 14. O que fica fora do MVP nesta frente — e por quê

| Corte | Por quê |
|---|---|
| Hash-matching automatizado de CSAM | Volume do MVP permite revisão manual de 100% da mídia; automatizar antes de precisar é custo sem benefício imediato — mas vira bloqueador se o volume crescer antes da integração existir (§7). |
| Verificação documental automatizada de idade | Mitigado no MVP pela regra de categoria de base + vínculo de clube confirmado (§5); documentação automatizada é fricção alta para o piloto. |
| Autoatendimento de direitos do titular (self-service) | Canal manual (§10) resolve no volume esperado; automatizar quando o volume de solicitações justificar. |
| Row-Level Security no Postgres (defesa em profundidade extra) | Já registrado na ADR 0008 — enforcement na aplicação é suficiente para 1 clube piloto. |
| Flag automática de palavras-chave suspeitas no chat | Moderação é 100% reativa (denúncia) no MVP; automatizar quando houver volume de mensagens que torne revisão manual inviável. |

---

## 15. Ação de bloqueio antes do primeiro cadastro real

Diferente das etapas anteriores, aqui a lista de bloqueadores não é só
código: **Política de Privacidade, Termos de Uso e o fluxo de consentimento
do responsável (§4) precisam existir e funcionar antes de qualquer atleta
real (ex.: da JF Vôlei) se cadastrar** — inclusive antes de um teste piloto
informal. Diferente de outras features que podem nascer incompletas e
melhorar depois, isto aqui não tem versão "boa o suficiente" abaixo deste
patamar.
