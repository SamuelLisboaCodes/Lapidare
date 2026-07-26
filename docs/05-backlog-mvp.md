# 05 — Backlog Priorizado do MVP (Lapidare · Vôlei)

> Depende de `docs/02`, `docs/03`, `docs/04` e `docs/adr/`. Este é o último
> artefato antes de começar a codar (`CLAUDE.md` §6).

---

## 1. Princípio de sequenciamento

A ordem abaixo não é "o que é mais fácil primeiro" — é **o que reduz risco
mais rápido primeiro**. O maior risco deste produto não é técnico, é (a)
o gate de consentimento de menor funcionar de verdade, e (b) descobrir se
a JF Vôlei (e atletas reais) usam a plataforma como imaginamos. Por isso o
Bloco 2 (LGPD/menor) vem antes de qualquer coisa "bonita" de produto, e o
corte do Bloco 6 (pagamento) existe para não gastar tempo de engenharia
validando algo que ainda não tem preço definido.

## 2. Dois horizontes dentro do "MVP"

- **MVP-piloto** (o que precisa existir para testar com a JF Vôlei):
  Blocos 1–5. Cobre o loop completo (atleta descoberto por clube) sem
  cobrança real.
- **MVP-lançamento** (depois de validar o piloto): adiciona cobrança real
  (Bloco 6) quando houver clube/empresário/patrocinador disposto a pagar
  de fato — decidir preço agora, sem nenhum usuário real, seria
  especulação. `Assinatura` já existe no modelo de dados (RN-07), mas
  **sem integração de pagamento real no piloto** — tier grátis com limite
  é aplicado manualmente/por configuração, não via checkout.

---

## 3. Backlog por bloco

### Bloco 0 — Fundação (setup do repositório, ver §4)
| ID | Item | Prioridade |
|---|---|---|
| LAP-001 | Monorepo (pnpm workspaces): `apps/web`, `apps/api`, `packages/shared` | P0 |
| LAP-002 | CI (lint, typecheck, test, build) no GitHub Actions | P0 |
| LAP-003 | Schema Prisma inicial a partir de `docs/03-modelo-dominio.md` | P0 |

### Bloco 1 — Autenticação
| ID | Item | Prioridade |
|---|---|---|
| LAP-010 | Cadastro/login por e-mail+senha (`Usuario`) | P0 |
| LAP-011 | OAuth Google | P1 |
| LAP-012 | Guards de autenticação (JWT) reutilizáveis por módulo | P0 |

### Bloco 2 — Núcleo do atleta e LGPD (bloqueador de lançamento — `docs/04`)
| ID | Item | Prioridade |
|---|---|---|
| LAP-020 | Perfil de Atleta: criar/editar (dados pessoais, físicos, esportivos) | P0 |
| LAP-021 | Cálculo de `is_menor` e gate de categoria de base (`docs/04` §5) | P0 |
| LAP-022 | Cadastro de Responsável + convite/solicitação de aprovação | P0 |
| LAP-023 | Fluxo de aprovação com registro de auditoria (`versao_termo_aceito`, IP, user agent) | P0 |
| LAP-024 | Revogação de aprovação pelo responsável | P0 |
| LAP-025 | Publicação de Política de Privacidade e Termos de Uso (conteúdo, não-engenharia) | P0 — **bloqueador de qualquer cadastro real** |
| LAP-026 | Upload de mídia (vídeo) com fila de moderação manual | P0 |
| LAP-027 | Acesso do responsável às mensagens do menor (RN-02) | P0 |
| LAP-028 | Botão de denúncia (`Denuncia`) em perfil/mídia/mensagem | P0 |

### Bloco 3 — Núcleo institucional
| ID | Item | Prioridade |
|---|---|---|
| LAP-030 | Cadastro de Clube + verificação manual (RN-03) | P0 |
| LAP-031 | RBAC de clube: papéis Admin/Membro (RN-04) | P0 |
| LAP-032 | Convite de membro ao clube | P0 |
| LAP-033 | Vínculo Atleta↔Clube (N:N, com confirmação pelo clube) | P0 |
| LAP-034 | Cadastro de Empresário + verificação manual | P1 |
| LAP-035 | Cadastro de Patrocinador + verificação manual | P1 |

### Bloco 4 — Descoberta
| ID | Item | Prioridade |
|---|---|---|
| LAP-040 | Busca de atletas com filtros (posição, categoria, cidade/estado) | P0 |
| LAP-041 | Ranking heurístico na busca (RN-06, ADR 0005) | P0 |
| LAP-042 | Publicação de Peneira por clube | P0 |
| LAP-043 | Candidatura a Peneira + pipeline (interessado→avaliação→aprovado/reprovado) | P0 |
| LAP-044 | Seguir clube (RN-08) | P1 |
| LAP-045 | Notificação de nova peneira para seguidores compatíveis | P1 |
| LAP-046 | Selos básicos (perfil completo, vídeo enviado, vínculo confirmado, responsável validado) | P1 |

### Bloco 5 — Conexão
| ID | Item | Prioridade |
|---|---|---|
| LAP-050 | Interesse (like) de ator → atleta e de atleta → ator | P0 |
| LAP-051 | Match mútuo cria Conversa (RN-05) | P0 |
| LAP-052 | Chat em tempo real via WebSocket (ADR 0006) | P0 |
| LAP-053 | Notificação imediata ao responsável em novo match de menor (`docs/04` §8) | P0 |

### Bloco 6 — Monetização real (fora do MVP-piloto, ver §2)
| ID | Item | Prioridade |
|---|---|---|
| LAP-060 | Definir preço com base em conversa real com JF Vôlei/outros clubes | Bloqueador de negócio, não técnico |
| LAP-061 | Integração de cobrança (ex.: Stripe) para planos pagos | P2 — só após LAP-060 |
| LAP-062 | Aplicação de limites do tier grátis (RN-07) | P1 — pode ser manual/config no piloto |

---

## 4. Setup do repositório

Ver estrutura criada em `apps/`, `packages/` e `.github/workflows/` na raiz
do repositório, e ADR 0009 para a decisão de monorepo com pnpm workspaces
(sem Turborepo/Nx por agora).

- `apps/web` — Next.js (App Router) + TypeScript + Tailwind + shadcn/ui.
- `apps/api` — NestJS + TypeScript, módulos por domínio (`auth`, `atletas`,
  `responsaveis`, `clubes`, `empresarios`, `patrocinadores`, `peneiras`,
  `match`, `chat`, `notificacoes`, `moderacao`, `billing`), Prisma em
  `apps/api/prisma`.
- `packages/shared` — enums e tipos compartilhados entre `web` e `api`.
- `.github/workflows/ci.yml` — lint, typecheck, test e build em cada PR.

**Pendência que não é código:** este ambiente não tem Node.js/pnpm
instalados. Antes de rodar qualquer coisa, instale Node.js LTS e pnpm
(`corepack enable` já habilita o pnpm embutido no Node moderno).

---

## 5. Definição de "pronto para mostrar à JF Vôlei"

O piloto está testável quando: um atleta menor consegue se cadastrar,
o responsável aprova via fluxo auditável, o perfil fica visível, a JF
Vôlei (como clube verificado) consegue publicar uma peneira e encontrar/
avaliar esse atleta pela busca, e as duas partes conseguem conversar com o
responsável tendo visibilidade da conversa. Isso é o corte real de "MVP
funcionando" — tudo que não é necessário para essa demonstração específica
pode esperar.
