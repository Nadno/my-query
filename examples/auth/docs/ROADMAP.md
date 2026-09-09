# ROADMAP — examples/auth

Referência para o desenvolvimento futuro do exemplo. Registra a avaliação das std libs
(`$stdlib` / `$stdbrowser`) e a direção de robustez do showcase. As etapas do roadmap
são definidas na conversa e registradas aqui.

---

## Contexto

`examples/auth` é o showcase full-stack do mini-q: Fastify + JWT com refresh, cadastro
multi-step (acesso → empresa → sócios), dashboard. O código está 100% na API atual
(`$` = tags, recursos nomeados `$*`, CSS via `mini-q/style`).

As std libs do autor (`$stdlib` — JS puro; `$stdbrowser` — DOM/Web API) foram adicionadas
em `web/src/` para avaliação. Este doc é o resultado dessa avaliação e o ponto de partida
do roadmap de robustez.

---

## Avaliação das std libs

### Veredito

As libs são bem-feitas e a filosofia ("Substitui, não soma") é correta. O problema é de
**encaixe, não de qualidade**: a complexidade do exemplo é *reativa* (signals, `$match`,
behaviors, forms) — trabalho do mini-q. Os problemas genéricos que as libs resolvem já
estão resolvidos por helpers locais (ex.: `api.ts` `send()`, 28 linhas). Trazer tudo
adicionaria um segundo vocabulário que compete com o do mini-q pela atenção do leitor.

A exceção é a **a11y**: focus trap, inert, roving tabindex são o "extrapolar em código
próprio" mais traiçoeiro do DOM. `FocusScope` / `RovingIndex` / `FocusGrid` são a
ferramenta certa — mas o exemplo atual não tem os componentes que precisam deles (sem
modal, sem menu, sem grid).

### Mapa de encaixe

| Primitiva | Encaixe no /auth | Veredito |
|---|---|---|
| `Task.debounce` | `useAsyncValidator` — substitui timer + contador `gen` manual | Encaixa agora |
| `Task.wait(id)` / `cancel` | `scheduleRefresh` em `useAuth` | Encaixa agora |
| `TimeSpan` | durações legíveis nos call sites de timer | Encaixa agora (pequeno) |
| `FocusScope` | modal (termos, confirmar logout) | Encaixa se adicionarmos o modal |
| `Storage` | "lembrar e-mail" no login | Encaixa se adicionarmos persistência |
| `HttpQuery` + `Cache` | lista de membros (GET memoizado) | Encaixa se adicionarmos a lista |
| `Fetcher` | substituir `api.ts` `send()` | Borderline (28 linhas vs ~270) |
| `Result` | — | Exagero: `ApiError` + throw já modela erro |
| `Pattern` | — | Exagero: compete com `$match` do mini-q |
| `Str` / `Obj` / `Type` / `RawJSON` / `BiMap` | — | Exagero: o fluxo não tem o problema |
| `RovingIndex` / `FocusGrid` | — | Exagero hoje: sem menu/grid |

### Fronteira

Composables/behaviors dono do **quando** (ciclo de vida); std libs dono do **como**
(mecânica). É o que as libs declaram ("O host decide o quando").

- `usePopover` → `FocusScope` internamente quando `open` vira true
- `useAsyncValidator` → `Task.debounce(check, '400ms')`
- `useAuth` → `Task.wait('refresh', ...)` + `Task.cancel('refresh')`
- `api.ts` → `Fetcher.create({ credentials: 'include' })` + middleware de token

### Regra de admissão

Uma primitiva entra no exemplo **só quando ganha um consumidor real** (≥1 componente ou
composable que a use). Não trazer por princípio; não duplicar vocabulário do mini-q
(`Pattern` vs `$match`).

---

## Direção do showcase

Objetivo: 2–3 páginas, fluxo simples, interações complexas (ou bem funcionais), com a11y.

Decisões (2026-09-09):
- **Domínio**: SaaS de equipe — o dashboard vira gestão de membros (lista, settings, convites).
- **Carousel**: testemunhos na página de login (conteúdo estático + lib de terceiros).
- **Começo**: funcional (Task/TimeSpan).

Interações que justificam as libs:
- **Modal** (termos no cadastro / confirmar logout) → `FocusScope`
- **Lembrar e-mail** no login → `Storage`
- **Lista de membros** no dashboard → `HttpQuery` + `Cache`
- **Carousel** (testemunhos no login) → integração de lib de terceiros

---

## Convenções de estrutura

Decidido em 2026-09-09, aplicado na Etapa 2:

- **`Component.style.ts` co-locado**: cada componente tem um arquivo de estilo ao lado,
  com default export `s<Component>` (`import sCard from './EntityCard.style.ts'`).
- **Estilos compartilhados**: `ui/shell.style.ts` com exports nomeados (`sCard`, `sForm`,
  `sAuthGate`, `sApp`, `sHeader`) — não duplicar por tela.
- **CSS global**: `ui/global.style.ts` (`style.css(':root'|'*'|'body')`), importado pelo `main.ts`.
- **`use*` vs `$use*`**: `use*` para composables sem DOM; `$use*` para os que tocam o DOM
  (retornam/usam `Behavior` ou leem/escrevem o DOM). Espelha o split `$stdlib`/`$stdbrowser`.
  No exemplo: `useMask` → `$useMask`, `usePopover` → `$usePopover`.

---

## Roadmap

| Etapa | Escopo | Estado |
|-------|--------|--------|
| 0 — Fundação | Doc + decisões (domínio, carousel, começo) | feita |
| 1 — Task/TimeSpan | `useAsyncValidator` (debounce), `useAuth` (wait/cancel), `useToast` (TimeSpan) | feita |
| 2 — Visual | Estrutura (`.style.ts`, `$use*`), theme tokens, breakpoints (`config`/`media`), estados loading/empty/error | pendente |
| 3 — Carousel | Testemunhos no login com lib de terceiros (Embla) — padrão de coexistência | pendente |
| 4 — A11y | Modal (`FocusScope`) para termos/confirmar, gestão de foco | pendente |
| 5 — Dados | Lista de membros (`HttpQuery`/`Cache`), lembrar e-mail (`Storage`), settings | pendente |

Notas:
- **Alias `@/`** configurado na Etapa 1 (tsconfig `paths` + vite `resolve.alias`) — pré-requisito para as std libs resolverem (`Storage.ts` já usava `@/$stdlib/...`).
- **`**/*.test.ts` excluídos** do tsconfig do exemplo — os testes das std libs usam `vitest`, que não é dependência do exemplo.
