# mini-q — Drift de documentação

Rastreia onde as **docs** ficaram defasadas em relação ao **código**, para varrer depois dos ajustes.
Fluxo: ao mudar a API, anote aqui o que a doc passou a dizer de errado; quando estabilizar, corrija a doc e
marque `[x]`. (O código é a fonte de verdade; esta lista aponta o débito documental.)

Legenda: **A** = afirma algo falso (corrigir já que induz a erro) · **F** = falta (cobrir) · **H** = histórico/menor.

**Estrutura atual das docs (2026-09-09):** `USAGE.md` (guia do usuário — reescrito na API atual na Fase 3)
· `STYLE.md` (**novo na F3**: engine de estilo + breakpoints) · `ARCHITECTURE.md` (como funciona + onde
mora — fusão do antigo `FLOW.md`+`STRUCTURE.md`) · `GLOSSARY.md` (índice) · `DX-MANIFESTO.md` (por quê) ·
`BACKLOG.md` (pendências + ordem) · `DOCS-PLAN.md` (campanha de docs) · `proposals/` (ADRs). O
`TEST-ROADMAP.md` (E1–E6) foi arquivado no §Histórico do BACKLOG.

---

## `docs/USAGE.md`

> **Fechada na Fase 3 (2026-09-09)** — `USAGE.md` reescrito na API atual (estrutura temática, §1–9) e o
> engine de estilo migrou p/ o novo `STYLE.md`. Nada de `$.recurso` aninhado nem `$(sel)` resta nas docs
> (verificado na sanidade do fechamento).

- [x] §11 CSS e exemplos, Regras de ouro, "Ainda não implementado", GLOSSARY — reescritos nas levas de
  estilos (2026-09-06/07: namespace → partes promovidas → slots/`--is-*`, sem `base`); o §11/engine virou
  o `STYLE.md` na F3.
- [x] **A** **Refactor de API (2026-09-08)** — fechado na F3: `$` = só tags; recursos = exports nomeados
  `$*`; estilo/breakpoints via `mini-q/style`; sem o seletor `$(sel)`.
- [x] **F** Breakpoints — `config({ breakpoints })`, `@nome`/`@número` no CSS e `media(nome|query)` →
  signal, documentados em `STYLE.md`.
- [x] **F** §1 Setup / adapter — contrato completo `{ isSignal, getValue, effect, untrack?, signal?,
  setValue? }` no USAGE §1.
- [x] **F** Referência rápida — cobertura total da API atual no USAGE (inclui `config`/`media`,
  `$match`/`$switch`/`$else`, `$on`, hooks de lifecycle).
- [x] **H** §3 eventos (era §5) — ordem de modificadores documentada no USAGE: `prevent` atrás de
  `debounce`/`throttle` age só na invocação; `prevent` antes age na hora (ordem do array = execução).

## `docs/BACKLOG.md`

- [x] Reescrito em 2026-09-09 (campanha de redução): §Status com números reais (171 testes), §Progresso →
  §Histórico condensado, pendências organizadas por área.
- [ ] **H** Manter §Histórico (condensado) e a "ordem sugerida" em dia a cada entrega — o detalhe
  continua nos commits.

## `~/.claude/plans/…-diffie.md` (spec de estilos)

- [x] **H** Virou histórico junto com as levas seguintes de estilo; o desenho em dia está em
  [STYLE.md](STYLE.md) + [GLOSSARY.md](GLOSSARY.md) §Estilo — o ADR
  [proposals/style-namespace.md](proposals/style-namespace.md) ficou como registro da decisão (sintaxe da época).

## Memória do projeto (`mini-q-project.md`)

- [x] **H** Criada em 2026-09-09 com a API atual + estrutura de docs + quirk de ambiente (WSL-UNC:
  testes contados via Grep; `npm` não roda do caminho UNC).

---

## Como usar

Ao terminar uma leva de mudanças, abrir este arquivo, corrigir os itens **A** (mentiras) primeiro, depois **F**,
marcar `[x]`, e remover o que não fizer mais sentido.
