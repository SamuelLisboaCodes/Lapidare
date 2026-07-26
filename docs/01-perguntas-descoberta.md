# 01 — Perguntas de Descoberta (Lapidare)

> Status: **respondido em 2026-07-26** — ver respostas e decisões registradas
> ao final do arquivo. Uma decisão estratégica (escopo de esportes no MVP)
> ficou pendente de confirmação antes de avançar para o PRD (etapa 2 de
> `CLAUDE.md` §6).

Antes de desenhar produto ou arquitetura, preciso entender as premissas de
negócio por trás do Lapidare. Sem isso, qualquer PRD ou modelo de dados seria
engenharia especulativa — e o risco maior de uma plataforma multi-lado como
essa não é técnico, é de **sequenciamento de mercado** (quem eu conquisto
primeiro) e de **confiança/segurança** (dado que menores de idade são o
principal ativo da plataforma).

---

## Mercado e validação

1. **Você já validou isso com algum público real?** Conversou com atletas,
   olheiros, clubes ou empresários? Existe alguma lista de espera, carta de
   intenção, ou sinal de demanda além da intuição? (Isso muda drasticamente
   quanto devemos investir antes de ter usuários reais.)
2. **Quem são seus concorrentes diretos e indiretos hoje** (Transfermarkt,
   Hudl, agências de olheiros, grupos de WhatsApp, Instagram de "achados",
   plataformas de peneiras online)? O que eles fazem mal que você vai fazer
   bem?
3. **Qual esporte(s) no MVP?** "Talento esportivo" é um escopo enorme —
   futebol tem dinâmica, volume de dados e cultura de peneiras muito diferente
   de vôlei, basquete ou atletismo. Atacar todos os esportes ao mesmo tempo no
   MVP dilui o produto e a base de dados de comparação (ranking/estatísticas
   só funcionam bem dentro de um esporte).
4. **Qual geografia no MVP?** Uma cidade, um estado, o Brasil inteiro? Efeitos
   de rede em marketplace são locais antes de nacionais — "maior ecossistema
   da América Latina" é a visão de V2/V3, não o ponto de partida.

## Priorização e o problema do ovo e da galinha

5. **Qual dos 4 públicos você vai conquistar primeiro, e como?** Uma
   plataforma de 4 lados não decola com os 4 lados vazios simultaneamente.
   Minha hipótese de trabalho seria: atletas primeiro (oferta), com um clube
   ou olheiro parceiro "ancora" desde o dia 1 para dar credibilidade e puxar
   demanda — mas quero validar isso com você, não assumir.
6. **Existe algum parceiro institucional já conversando com você** (uma
   federação, liga, clube, ou agência) que possa servir de cliente-piloto e
   validar o produto antes do lançamento aberto?

## Menores de idade e segurança (crítico)

7. **Qual % estimado de atletas na base serão menores?** Isso define se o
   fluxo de consentimento do responsável é o caminho principal (obrigatório
   desde o cadastro) ou uma exceção tratada depois.
8. **Como funciona hoje, na prática, o consentimento de responsáveis legais
   em plataformas esportivas/educacionais que você conhece?** Você já tem
   uma visão de como isso deveria funcionar (ex.: responsável cria a conta e
   convida o menor vs. menor se cadastra e responsável aprova depois)?
9. **Quem pode ver o perfil de um menor, e com que informação?** Um
   empresário ou clube pode ver dados de contato direto de um menor, ou toda
   comunicação passa obrigatoriamente por um responsável/canal mediado? Isso
   é uma decisão de produto com implicação jurídica direta (LGPD + ECA).
10. **Você já tem, ou pretende ter, algum tipo de verificação de identidade
    (KYC) para clubes e empresários**, para reduzir o risco de perfis falsos
    ou má conduta com menores na plataforma?

## Modelo de dados e diferenciação

11. **O que hoje comprova que um atleta é "real" e as estatísticas dele são
    confiáveis?** Sem isso, o produto vira só "mais um Instagram de vídeos".
    Você imagina validação por clube/federação, por vídeo com metadados,
    autodeclaração mesmo, ou um misto?
12. **"Recomendação de IA" no MVP — você concorda em começar com regras e
    ranking heurístico simples** (ex.: completude de perfil, posição,
    idade/categoria, localização), deixando ML real para depois de termos
    dados de uso reais? Ou já tem expectativa de algo mais sofisticado no
    lançamento?

## Monetização e negócio

13. **Quem paga primeiro, e por quê?** Freemium com premium "por perfil"
    normalmente funciona melhor no lado que tem orçamento (empresários,
    clubes, patrocinadores) do que no lado que é o produto (atletas). Qual é
    sua hipótese de quem gera a primeira receita, e quanto isso pode custar
    para esse público pagar?
14. **Existe algum orçamento e prazo de referência para o MVP** (ex.: "3
    meses e R$X para validar com um clube parceiro")? Isso define
    diretamente quanto cortar de escopo e stack.

## Time e operação

15. **Quem mais está construindo isso com você?** Só você e eu, ou já existe
    time (dev, design, jurídico, comercial)? Isso muda a complexidade de
    processo (CI, ADRs, etc.) que faz sentido ter desde o dia 1 — para um time
    de uma pessoa, alguns rituais devem ser mais leves do que o descrito em
    `CLAUDE.md` §5.

---

### Por que estas perguntas antes de qualquer PRD

- As perguntas 3–6 (esporte, geografia, priorização de público) mudam
  completamente o recorte do MVP — sem elas, um PRD seria um chute.
- As perguntas 7–10 (menores) são o maior risco legal e reputacional do
  produto; segundo `CLAUDE.md` §5, isto é requisito de primeira classe, não
  detalhe — preciso da sua visão antes de desenhar o modelo de domínio.
- As perguntas 13–14 (monetização/orçamento) determinam se a stack e a
  infraestrutura propostas em `CLAUDE.md` §4 são adequadas ou
  over-engineering para o estágio atual — vou dar minha opinião crítica sobre
  a stack no momento dos ADRs (etapa 4), mas o orçamento/prazo aqui muda essa
  análise.

**Próximo passo:** responda o que puder (não precisa ser definitivo — pode
ser "hipótese de trabalho: X"). Onde você não tiver resposta, eu listo minha
premissa e seguimos, mas deixo explícito no PRD o que é suposição a validar.

---

## Respostas do fundador (2026-07-26)

| # | Pergunta | Resposta |
|---|---|---|
| 1 | Validado com público real? | Ainda não |
| 2 | Concorrentes conhecidos? | Não sabia — pesquisa de mercado feita abaixo |
| 3 | Esporte(s) no MVP | Futebol, Basquete, Handebol e Atletismo (e variações) |
| 4 | Geografia no MVP | Brasil |
| 5 | Público a conquistar primeiro | Atleta + Clube |
| 6 | Parceiro institucional âncora? | Ainda não |
| 7 | % estimado de menores na base | Bem alto |
| 8 | Modelo de consentimento de referência | Não sabe — proposta abaixo |
| 9 | Visibilidade de perfil de menor | Só fica visível a clubes/empresários/patrocinadores após validação dos pais/responsável |
| 10 | KYC para clubes/empresários | Quer ter |
| 11 | Validação de estatísticas do atleta | Não tem forma ainda, aceita proposta |
| 12 | IA simples (regras/heurística) no MVP | De acordo |
| 13 | Quem paga | Atleta grátis/barato; empresário, clube e patrocinador pagam mais |
| 14 | Orçamento/prazo do MVP | Nenhum definido — foco em qualidade agora |
| 15 | Time | Só o fundador, por ora |

### Pesquisa de concorrência (mercado brasileiro, 2026)

Existem concorrentes diretos e ativos, todos focados **exclusivamente em
futebol**, ocupando total ou parcialmente a proposta de "LinkedIn do
futebol":

- **Linksport** — maior tração encontrada (~120 mil downloads, cadastros em
  800+ cidades do Brasil); rede de perfis para olheiros convidarem atletas
  para peneiras.
- **Futex** — conecta atletas a olheiros/clubes/agentes no Brasil e Europa.
- **Olheiros App** — conecta atletas a clubes via peneiras.
- **CUJU** — usa IA para selecionar atletas via desafios; presença
  internacional.
- **Footlink** — base de ~650 mil atletas; foco em gestão de scouting e
  transferências para clubes.
- **Futtest** — avaliação profissional conectando atletas a consultores/
  olheiros.
- Referências internacionais (não concorrem diretamente no Brasil ainda):
  Transfermarkt, Hudl/Wyscout, Scoutium/Scoutastic — focados em dados
  profissionais, não em descoberta de base.

**Implicação:** o mercado de "app de scouting de futebol" no Brasil já não é
espaço vazio. A diferenciação do Lapidare não pode ser "existir" — precisa
vir de (a) multi-esporte além do futebol, hoje sem concorrente claro no
Brasil; (b) o modelo de 4 lados com empresário/patrocinador como personas
pagantes e RBAC multi-usuário de clube, que os concorrentes listados não
parecem ter; e/ou (c) segurança/LGPD de menores como diferencial de
confiança, não só compliance.

### Decisão: escopo de esportes no MVP — FECHADA

**Vôlei é o único esporte do MVP.** Futebol, Basquete, Handebol e Atletismo
ficam na visão de V1/V2/V3, reaproveitando a arquitetura multi-esporte
pensada desde o início (ver premissa de modelagem abaixo).

Motivação (registrada em 2026-07-26):
- Nenhum concorrente mapeado (Linksport, Futex, Olheiros App, CUJU,
  Footlink, Futtest) atua em vôlei — espaço sem disputa direta, ao contrário
  de futebol.
- Estrutura institucional madura no Brasil (CBV, federações estaduais,
  Superliga) facilita achar um clube/categoria de base parceiro-âncora.
- Cultura de patrocínio comercial já existe em clubes de vôlei — valida a
  persona "patrocinador" do Lapidare, diferencial que os concorrentes de
  futebol não exploram.
- Base feminina forte e estruturada — relevante para o produto não nascer
  implicitamente masculino, e para pensar segurança de menores desde o
  início cobrindo ambos os sexos.
- Clubes de base de vôlei já operam com treinador/preparador/coordenador/
  diretor — RBAC multi-usuário de clube (CLAUDE.md §3) é diretamente
  aplicável, não teórico.

**Parceiro-âncora:** ainda não fechado, mas há uma pista concreta — **JF
Vôlei**, escola de vôlei da cidade do fundador. Ação prioritária em paralelo
à etapa de PRD: iniciar conversa com JF Vôlei para validar o produto com um
cliente/piloto real antes ou durante a construção do MVP.

### Premissas de trabalho registradas (a validar depois)

- Fluxo de consentimento de responsável: proposta de trabalho é que o
  responsável legal deve **validar/aprovar** o perfil do menor antes que ele
  fique visível a clubes/empresários/patrocinadores (confirmado na resposta
  9). O desenho exato (responsável cria a conta vs. aprova depois) será
  decidido no modelo de domínio (etapa 3), com base em LGPD art. 14 + ECA.
- KYC de clubes/empresários no MVP: dado que não há orçamento definido (Q14),
  a proposta de trabalho é verificação **manual/administrativa** (upload de
  documento, aprovação por admin) em vez de KYC automatizado de terceiros —
  a decidir formalmente no plano de segurança/LGPD (etapa 5).
- Validação de estatísticas do atleta no MVP: proposta de trabalho é
  autodeclaração + evidência em vídeo + confirmação por clube/responsável
  (selo), sem integração com federações no MVP — a detalhar no PRD (etapa 2).
