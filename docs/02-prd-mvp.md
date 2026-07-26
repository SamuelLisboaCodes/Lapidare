# 02 — PRD do MVP (Lapidare · Vôlei)

> Depende de `docs/01-perguntas-descoberta.md` (respostas e decisões
> registradas em 2026-07-26). Esporte único do MVP: **Vôlei**. Geografia:
> **Brasil**. Parceiro-âncora em prospecção: **JF Vôlei**.

---

## 1. Personas (aplicadas ao contexto do MVP)

### 1.1 Atleta
Jogador(a) de vôlei de base, majoritariamente **menor de idade** (dado
confirmado na descoberta: % alto de menores). Quer ser visto por clubes,
melhorar seu posicionamento em relação a outros atletas da categoria, e
eventualmente conseguir oportunidade em um clube maior.

### 1.2 Responsável legal (ator crítico, não é um dos "4 públicos" formais)
Pai/mãe/responsável do atleta menor. Não navega a plataforma para "buscar
oportunidades" como as outras personas — sua função é **autorizar e
supervisionar**. Sem ele, o perfil do menor não existe publicamente. Trato
como ator de primeira classe no MVP, não como um campo de formulário.

### 1.3 Empresário
Agente/representante que busca talentos de vôlei para indicar a clubes
maiores. Nicho menor que no futebol, mas existe, sobretudo para atletas
acima de 16-17 anos perto de transição para categoria adulta/profissional.

### 1.4 Clube
No MVP, "clube" cobre tanto **escolas de vôlei** (como JF Vôlei) quanto
**categorias de base de clubes maiores**. Tem múltiplos usuários internos
(treinador, preparador físico, coordenador, diretor). Quer descobrir e
avaliar atletas, e organizar seleções/peneiras.

### 1.5 Patrocinador
Empresa local/regional que quer associar sua marca a atletas ou categorias
de base promissoras, e acompanhar a evolução de quem patrocina.

---

## 2. Jornadas principais

### Atleta (menor de idade — caminho principal, dado o % alto de menores)
1. Atleta cria a própria conta e preenche o perfil: dados pessoais, físicos
   (altura, envergadura, alcance de ataque/bloqueio — métricas relevantes em
   vôlei), esportivos (posição: ponteiro, levantador, central, líbero,
   oposto; categoria: sub-13/15/17/19), histórico de clube(s) — **pode ter
   vínculo simultâneo com mais de um clube** (ex.: escola de base + seleção
   estadual, confirmado na descoberta), conquistas, até N vídeos.
2. No cadastro, informa o contato do responsável legal → plataforma envia
   solicitação de aprovação (RN-01).
3. Perfil fica com selo "aguardando validação" até o responsável aprovar →
   perfil se torna visível (RN-01). Antes disso, só o próprio atleta e o
   responsável o veem.
4. Atleta aparece em buscas de clubes/empresários/patrocinadores conforme
   completude e selos (ranking heurístico).
5. Pode **seguir clubes** de interesse e recebe notificação quando eles
   publicam uma peneira (RN-08).
6. Recebe interesse/proposta → pode dar match mútuo → chat liberado
   (com responsável tendo visibilidade, ver RN-02).
7. Participa de peneiras/avaliações publicadas por clubes.

### Responsável legal
1. Recebe a solicitação de aprovação (link) enviada pelo atleta no
   cadastro. Para aprovar — e para poder exercer RN-02 (ver conversas do
   menor) depois — precisa ele mesmo ter uma conta identificada na
   plataforma, não uma aprovação anônima por link único (uma aprovação sem
   conta persistente não sustenta a supervisão contínua exigida por RN-02).
2. Aprova a visibilidade do perfil, dados sensíveis e mídia antes de irem ao
   ar.
3. Pode ver todas as conversas do menor com clubes/empresários/
   patrocinadores.
4. Pode revogar a visibilidade do perfil a qualquer momento.

### Empresário
1. Cadastro institucional → verificação manual (RN-03) antes de poder
   contatar atletas.
2. Busca avançada: posição, categoria/idade, cidade/estado, clube atual.
3. Lista de favoritos, envio de proposta/interesse.
4. Recebe recomendações heurísticas simples ("atletas na mesma categoria e
   região com perfil completo").

### Clube
1. Cadastro institucional → verificação manual (RN-03).
2. Convida usuários internos com papel definido (RN-04 — RBAC simplificado
   no MVP).
3. Publica peneira/avaliação (título, categoria, data, local, vagas).
4. Busca atletas com os mesmos filtros do empresário.
5. Gerencia candidatos em pipeline simples: interessado → em avaliação →
   aprovado/reprovado.

### Patrocinador
1. Cadastro institucional → verificação manual (RN-03).
2. Descobre atletas/categorias via ranking de "promessas" (completude +
   selos + heurística).
3. Acompanha métricas básicas de evolução de quem segue/patrocina.
4. Pode publicar edital de patrocínio no feed.

---

## 3. Regras de negócio (MVP)

- **RN-01 — Gate de consentimento do menor.** Perfil de atleta menor nunca
  fica visível a clube/empresário/patrocinador sem confirmação explícita do
  responsável legal. Sem essa confirmação, o perfil existe mas é privado
  (só o próprio atleta e o responsável o veem). Base legal: LGPD art. 14 +
  ECA — detalhado no plano de segurança (etapa 5).
- **RN-02 — Comunicação mediada para menores.** Toda conversa entre atleta
  menor e clube/empresário/patrocinador é visível ao responsável legal.
  Nenhum dado de contato direto (telefone, e-mail, redes sociais pessoais)
  é exposto no perfil público do menor — contato só via chat interno.
- **RN-03 — Verificação de contas institucionais.** Clube, empresário e
  patrocinador passam por verificação manual (admin revisa documento/CNPJ)
  antes de poder buscar ativamente ou contatar atletas. Ver ADR de KYC na
  etapa 4/5 — a decisão de automatizar isso é adiada para quando houver
  volume que justifique o custo.
- **RN-04 — RBAC simplificado no MVP.** Clube tem 2 papéis internos:
  **Admin do clube** (gerencia usuários, publica peneiras, vê tudo) e
  **Membro** (busca atletas, participa da avaliação de candidatos, não
  gerencia usuários nem configurações). Os 4 papéis distintos do CLAUDE.md
  (treinador/olheiro/coordenador/diretor) ficam para V1 — ver §5.
- **RN-05 — Match mútuo libera chat.** Conversa privada só é possível após
  interesse mútuo (like duplo) OU quando um clube convida um atleta
  diretamente para uma peneira específica.
- **RN-06 — Ranking heurístico.** Ordenação de busca considera, em ordem de
  peso: (1) compatibilidade de filtro (posição/categoria/região — exato),
  (2) completude do perfil, (3) selos conquistados, (4) recência de
  atividade. Sem ML nesta fase.
- **RN-07 — Monetização MVP.** Atleta: gratuito. Clube/Empresário/
  Patrocinador: tier grátis com limite de buscas/propostas por mês; plano
  pago remove limite e dá destaque em busca. (Preço não definido — depende
  de conversa real com JF Vôlei e outros clubes, ver ação prioritária.)
- **RN-08 — Seguir clube e notificação de peneira.** Atleta pode seguir
  clubes; ao publicar uma peneira, o clube notifica automaticamente seus
  seguidores compatíveis com a categoria/posição do evento. Esta é a versão
  mínima de "rede social" do MVP — ver §5 sobre o que fica de fora (feed
  completo com posts/curtidas).

---

## 4. Recorte MVP → V1 → V2 → V3

### MVP (validar com JF Vôlei)
- Esporte único: **Vôlei**.
- As 4 personas + responsável legal, com os fluxos acima.
- Perfil de atleta (dados pessoais, físicos, esportivos, mídia limitada a
  N vídeos).
- Gate de consentimento do responsável (RN-01, RN-02).
- Cadastro de clube com RBAC de 2 papéis (RN-04).
- Peneiras/avaliações publicadas por clube (formulário simples).
- Busca com filtros (posição, categoria, cidade/estado).
- Match mútuo + chat interno mediado.
- Seguir clube + notificação de peneira (RN-08).
- Selos básicos: perfil completo, vídeo enviado, vínculo de clube
  confirmado, responsável validado.
- Verificação manual de contas institucionais (RN-03).
- Ranking heurístico (RN-06).
- Web responsivo (mobile-first no navegador) — **app nativo fica fora do
  MVP**: dobraria o esforço de build/manutenção antes de sabermos se o
  produto retém uso. Reavaliar em V1 conforme retenção de uso mobile web.

### V1 (após validar com JF Vôlei e ≥1 clube adicional)
- RBAC completo de 4 papéis (treinador/olheiro/coordenador/diretor).
- +1–2 esportes (candidatos: Basquete, Futebol — decidir com base no
  aprendizado do MVP e apetite de risco competitivo em futebol).
- Feed estilo LinkedIn completo (hoje o MVP não tem feed dedicado — a
  descoberta via busca/ranking é suficiente para validar o loop principal).
- Dashboard de métricas de evolução para patrocinador.
- App nativo, se a retenção em web mobile justificar o investimento.

### V2
- Esportes restantes da visão original (Handebol, Atletismo) + Vôlei já
  maduro.
- IA de recomendação cruzada mais sofisticada (ainda sem análise de vídeo).
- Comissão opcional sobre contratações.

### V3
- Análise de vídeo por IA.
- Expansão geográfica (demais países da América Latina).
- Integrações com federações (CBV e equivalentes) para verificação
  semi-automática de estatísticas/selos.

---

## 5. Fora do MVP — e por quê (aplicando o filtro obrigatório do CLAUDE.md §2.5)

| Corte | Por quê |
|---|---|
| Múltiplos esportes | Cada esporte é um esquema de dados novo; validar 1 esporte com 1 parceiro real vale mais que modelar 5 sem uso real. |
| RBAC de 4 papéis | Com 1 clube piloto, 2 papéis cobrem ~80% do valor; granularidade fina só compensa com múltiplos clubes pedindo isso de fato. |
| KYC automatizado (terceiros) | Sem orçamento definido (Q14) e com poucas contas institucionais no início, revisão manual por admin resolve com custo zero de integração. |
| Verificação de estatísticas via federação | Não há parceria com CBV ainda; autodeclaração + selo por clube já dá confiança suficiente para o MVP. |
| Feed de conteúdo (posts, vídeos, curtidas, comentários) | A parte que mais importa da "rede social" — clube divulga peneira e atleta fica sabendo — entra no MVP como seguir clube + notificação (RN-08), que é ~80% do valor a uma fração do custo. O feed de conteúdo contínuo (estilo LinkedIn, com algoritmo de ranking de posts) só compensa quando já há massa crítica de conteúdo publicado. |
| App nativo | Web responsivo testa a proposta de valor com menor custo de manutenção para um fundador solo. |
| Análise de vídeo por IA, ML pesado | Sem dados de uso reais ainda; heurística simples primeiro (RN-06), conforme já acordado na descoberta. |
| Comissão sobre contratações | Modelo de receita mais simples (assinatura + destaque) primeiro; comissão exige rastrear transações reais de contratação, o que é fricção alta para validar agora. |

---

## 6. Ação prioritária fora do código

Como não há parceiro-âncora fechado (só uma pista), a ação de maior
prioridade **não é engenharia**: iniciar conversa com JF Vôlei para validar
premissas deste PRD (categorias de base que eles têm, se há interesse real
em publicar peneiras na plataforma, o que eles hoje usam para "descobrir"
atletas) antes de investirmos tempo em domínio/ADRs além do necessário para
uma primeira versão testável.

---

## 7. Decisões registradas (2026-07-26) — fecham as perguntas abertas da v1 deste PRD

- **Onboarding de menor:** o atleta cria a própria conta; o responsável
  aprova depois (não o contrário). O responsável precisa ter conta própria
  identificada, não apenas clicar um link, para sustentar a supervisão
  contínua de RN-02.
- **Vínculo atleta-clube:** é **muitos-para-muitos** — um atleta pode ter
  vínculo simultâneo com mais de um clube (ex.: escola de base + seleção
  estadual). O modelo de domínio (etapa 3) precisa refletir isso desde já,
  não como um relacionamento 1:1 com "clube atual".
- **Peneira:** por ora tratada como entidade própria (não um tipo de post),
  com "seguir clube + notificação" (RN-08) como o mecanismo de descoberta no
  MVP. Um feed de conteúdo unificado (onde peneira poderia ser um tipo de
  post entre outros) é avaliado para V1.
