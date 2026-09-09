# mini-q — DOCS-PLAN (unificação + redução)

> **Propósito:** este arquivo é o **plano de trabalho** da campanha de documentação — o estado atual,
> o alvo e as próximas ações. Ele guia as sessões seguintes e é atualizado conforme as fases avançam
> (mesmo ritual do [DOCS-DRIFT.md](DOCS-DRIFT.md)). O **USAGE.md** é o capstone e fica **por último**
> (Fase 3): antes dele, unificamos e reduzimos o resto; quando ele for reescrito, a campanha fecha —
> **fechou em 2026-09-09**.

**Progresso:** **Fases 1–3 concluídas (2026-09-09)** — unificação/redução (README, ARCHITECTURE, BACKLOG
enxuto, DRIFT) + o capstone: `USAGE.md` reescrito na API atual (temático, §1–9), `STYLE.md` criado
(engine + breakpoints), GLOSSARY índice puro, README atualizado, DOCS-DRIFT fechado. **Campanha
concluída.**

## 1. Estado atual

> Snapshot do estado **inicial** da campanha (2026-09-09, antes das intervenções) — as refs à forma
> antiga (`$.mount`/`$.style`…) neste § descrevem o problema original, já resolvido. O estado
> pós-campanha está no [README](../README.md), no [USAGE](USAGE.md) e no [DOCS-DRIFT](DOCS-DRIFT.md).

| Doc | Linhas | Público | Papel | Estado | Veredito |
|---|---|---|---|---|---|
| `USAGE.md` | 472 | usuário | guia de uso | ⚠️ forma antiga da API (~87 refs aninhadas) | **reescrever por último** (F3) |
| `GLOSSARY.md` | 88 | todos | vocabulário | ✅ atualizado | enxugar p/ índice (F3) |
| `DX-MANIFESTO.md` | 134 | todos | por que a API é assim | ✅ estável | manter |
| `FLOW.md` | 143 | contribuidor | como o runtime flui | ✅ atualizado | fundir com `STRUCTURE` |
| `STRUCTURE.md` | 92 | contribuidor | onde o código mora + convenção | ✅ | fundir com `FLOW` |
| `BACKLOG.md` | 322 | todos | pendências + decisões + progresso | ⚠️ status defasado + progresso gigante | enxugar (F2) |
| `DOCS-DRIFT.md` | 57 | processo | rastreia mentiras das docs | ✅ | manter |
| `TEST-ROADMAP.md` | 147 | história | roadmap de testes E1–E6 | ✅ fechado (2026-09-08) | arquivar (F1) |
| `proposals/model.md` | 97 | ADR | `$model` com `options` (paridade Vue) | proposta em aberto | manter (aberta) |
| `proposals/ssg.md` | 83 | ADR | SSG (backend injetável + CSS por string) | proposta em aberto (P3) | manter (aberta) |
| `proposals/style-namespace.md` | 112 | ADR | redesenho do estilo | ✅ implementada | manter (arquivo) |
| `proposals/style-tokens.md` | 66 | ADR | variáveis de design | deferida (native-first) | manter (arquivo) |

**Problemas concretos:**

1. **`USAGE.md` é a doc que mais mente** — usa a forma anterior à `refactor(api)` (2026-09-08): helpers
   como `$.mount`/`$.handle`/`$.model`/`$.useSignal`/`$.style`/`$.when`/`$.each`/`$.show`
   **aninhados no `$`**. Hoje `$` é **só tags** (`$.div`); os recursos são **exports nomeados**
   (`$mount`, `$when`, `$handle`, …) e o CSS vive no entry `mini-q/style`
   (`import { style, config, media } from 'mini-q/style'`). Rastreado no [DOCS-DRIFT.md](DOCS-DRIFT.md).
2. **Modelo mental triplicado** — closure vs setup, aridade 0-param/≥1-param, região/âncora/untrack
   aparecem em `USAGE.md`, `GLOSSARY.md` **e** `FLOW.md`.
3. **"Onde mora" duplicado** — a tabela "Onde mora cada peça" do `FLOW.md` repete o mapa do `STRUCTURE.md`.
4. **`BACKLOG.md` é sacola** — progresso corrido (~35 entradas) + status defasado ("31 testes", hoje 171)
   + decisões + pendências + ordem, tudo junto.
5. **`TEST-ROADMAP.md` fechado** — E1–E6 concluídos (2026-09-08); o conteúdo virou ruído.
6. **Decisões em dois lugares** — a tabela "Decisões travadas" do manifesto × decisões inline no BACKLOG.

## 2. Alvo

```
README.md               ← porta de entrada (novo)
docs/
  DOCS-PLAN.md          ← estado + próximas ações (ESTE)
  USAGE.md              ← guia do usuário — capstone, reescrito por último
  DX-MANIFESTO.md       ← por que a API é assim (mantido)
  GLOSSARY.md           ← só índice termo → definição
  ARCHITECTURE.md       ← FLOW + STRUCTURE fundidos (como funciona + onde mora + convenção)
  STYLE.md              ← engine de CSS (novo na F3; vocabulário opt-in extraído do USAGE §11)
  BACKLOG.md            ← front (pendências, decisões pendentes, ordem) + histórico curto
  DOCS-DRIFT.md         ← processo de drift (mantido; fecha na F3)
  proposals/            ← ADRs (arquivo: implementadas/deferidas · abertas: model, ssg)
```

Regra da campanha (eco do [DX-MANIFESTO](DX-MANIFESTO.md) §8): **um assunto mora num lugar só** — um
doc de uso, um de arquitetura, um índice, um manifesto e uma doc opt-in do engine de estilo (`STYLE.md`,
novo na F3). A redução real não é de contagem de arquivos, é
de **prosa duplicada + conteúdo mentiroso/vencido** (dos 1.813 linhas atuais, ~400 são história ou mentira).

## 3. Fases

### Fase 1 — Unificação estrutural (agora; não depende da API)

- [x] **Criar `docs/DOCS-PLAN.md`** (este).
- [x] **Criar `README.md`** na raiz — porta de entrada: o que é (1 frase), exemplo de 30s, links p/ docs.
- [x] **Arquivar `TEST-ROADMAP.md`** — resumo de 3 linhas no §Histórico do BACKLOG; arquivo removido
      (recuperável no git).
- [x] **`FLOW.md` + `STRUCTURE.md` → `docs/ARCHITECTURE.md`** — uma única doc de arquitetura:
      1. *Como o runtime flui* (espinha `mount → escopo → build → unmount`);
      2. *Onde mora cada peça* (tabela do FLOW);
      3. *Como o `src/` é organizado* (colocation + feature-sliced, anatomia da slice, débito conhecido).
      Atualizar os links p/ `FLOW.md`/`STRUCTURE.md` (em `DX-MANIFESTO.md` e `GLOSSARY.md`).

### Fase 2 — Redução (agora; junto da Fase 1)

- [x] **Enxugar `BACKLOG.md`** — §Status atual com números reais (171 testes); §Progresso virou
      **"Histórico"** condensado (o detalhe está nos commits, que são a fonte de verdade); ficou só o
      que move: pendências por área, decisões pendentes, ordem sugerida.
- [x] **Atualizar `DOCS-DRIFT.md`** — nova estrutura registrada (renomes) e pendências **F** que são
      pré-requisito da Fase 3 (breakpoints/config/media, adapter `untrack?`/`signal?`, ordem de debounce).

### Fase 3 — Capstone: USAGE (concluída em 2026-09-09)

Pré-condições antigas (delegation de eventos, `$model` com `options`, behaviors de a11y, `useForm`)
**não bloqueiam** a reescrita: são features que *adicionariam* seções no futuro — não mudam nada do que
já está implementado e testado (171). A reescrita documenta a **API atual**; acréscimos de superfície
entram como diff depois. (Re-escopo de 2026-09-09.)

**Decisões da reescrita (confirmadas):**
- **Estrutura temática** — agrupa o que o leitor faz junto; cada conceito aparece uma vez.
- **`STYLE.md` novo** — o engine de CSS (§11 atual: parts/flags/variants/slots/keyframes/breakpoints,
  ~90 linhas) sai do USAGE e vira doc própria; o USAGE fica com o caminho comum (`class`/`$style`/`$cx`
  + `style.css` global + link). Eco do princípio 8 do [manifesto](DX-MANIFESTO.md): o engine é o maior
  orçamento de vocabulário — fica opt-in.
- **Baixo nível documentado** — seção própria no USAGE com o esqueleto que os `$*` envolvem.

**Mapa de migração dos § antigos → novos do USAGE:**

| novo § | título | migra de | acrescenta (drift) |
|---|---|---|---|
| 1 | Setup | §1 | contrato do adapter `{isSignal,getValue,effect,untrack?,signal?,setValue?}` (**F**); `$`=só tags + exports `$*` |
| 2 | Elementos | §2+§3+§4 | nada: criar/açúcar de aridade, reatividade `$`-prefixo, filhos reativos, class/style/data, `$cx` |
| 3 | Eventos | §5 | **`$on(ctx, nome, valor)`**; ordem de modificadores (**H**: `prevent` atrás de `debounce` só age no leading); nota `$handlers` raiz → `$handle.handlers` |
| 4 | Behaviors | §6 | **modos do `$model`** (text / boolean / grupo–signal array / radio / select-multiple) e o fluxo DOM→signal (`$on`) · DOM←signal (`bind`) · escrita (`setValue`) |
| 5 | Componentes + listas keyed | §7+§8 | — |
| 6 | Control-flow | §9 | **`$match`/`$switch`/`$else`** (**F**) |
| 7 | Lifecycle | §10 | **`$onMounted`/`$onUnmounted`** (**F**) |
| 8 | Exemplo completo | §12 | reescrito na API atual (imports nomeados, `use: $model`, `$handle.keys`, `$each`) |
| 9 | Baixo nível | novo | `$append(parent, child)`; `createTag`; `compose`; `getCustomEvent`; `applyUse`; `isSignal`/`isReactive`; `read`; `bind`; `untrack`; `setValue` |
| — | Regras de ouro | atual | 8 regras na API nova + link `STYLE.md`; fronteira inclui `$on` |
| — | Referência rápida | atual | + `$match`/`$switch`/`$else`, `$on`, hooks de lifecycle, `config`/`media`, `$append` (fecha o **F** referência rápida) |
| — | Ainda não implementado | atual | linha "API estilo jQuery" sobra só `remove`/`text` (`$append` já existe); demais seguem + link BACKLOG |

**`docs/STYLE.md` (novo, ≈70–90 linhas)** — o vocabulário do engine num lugar só: `style(name, config)`
→ `StyleHandle` callable; tabela de chaves do config (topo/parts/flags/variants/defaults/slots/
keyframes); partes promovidas (`field.input`); classe `-{bloco}-{chave}`, flag `.bloco.--is-{nome}`,
variante `.bloco.--{grupo}-{valor}`; slots (bloco estrangeiro hospedado); decls no topo (sem `base`);
aninhamento `&`/`@media`; **breakpoints** `config({ breakpoints })` + `@nome`/`@número` + `media(nome|query)`
→ signal (**F**); `style.css` global (escape hatch); deprecados `parts`/`css`; warnings (nome duplicado,
chave inesperada).

**GLOSSARY enxuto** — a prosa que sobrar migra p/ USAGE/STYLE; fica o índice termo → definição de
1 linha (links de engine de estilo passam a apontar p/ `STYLE.md`).

**Ordem de execução:** (1) `STYLE.md` — o USAGE linka para ele; (2) reescrever `docs/USAGE.md` (mapa
acima); (3) enxugar `GLOSSARY.md`; (4) `README.md` — tirar o ⚠️ "USAGE em reescrita" e adicionar link
p/ `STYLE.md`; (5) `DOCS-DRIFT.md` — fechar itens **A**/**F**/**H** do USAGE e registrar `STYLE.md` na
estrutura; (6) sanidade.

**Checklist:**
- [x] **Criar `docs/STYLE.md`** (engine de CSS + breakpoints) e linkar do USAGE.
- [x] **Reescrever `docs/USAGE.md`** — mapa de seções acima; cobertos `$match`/`$switch`/`$else`, `$on`,
      hooks de lifecycle, modos do `$model`, breakpoints (via STYLE), contrato do adapter,
      `$.tag(...children)` sem `{}`, §9 baixo nível.
- [x] **Enxugar `GLOSSARY.md`** a índice puro.
- [x] **Atualizar `README.md`** — destaque de reescrita removido; link `STYLE.md` adicionado.
- [x] **Fechar `DOCS-DRIFT.md`** — itens **A**/**F** do USAGE marcados `[x]`; **H** da ordem de
      `debounce`/`prevent` resolvido no USAGE §3; `STYLE.md` na "Estrutura atual das docs"; memória do
      projeto criada.
- [x] **Sanidade**: Grep em `docs/` por `$.recurso` aninhado e `$(sel)` → 0; links `.md` verificados.

## 4. Critério de pronto

- Nenhum item **A** (mentira) aberto no [DOCS-DRIFT.md](DOCS-DRIFT.md).
- Um assunto em um só doc: USAGE (uso), STYLE (engine de estilo), ARCHITECTURE (arquitetura),
  GLOSSARY (índice), MANIFESTO (por quê).
- Docs de uso na API atual: zero refs `$.recurso` aninhadas nem `$(sel)`; estilo/breakpoints via `mini-q/style`.
- BACKLOG = só o que move o projeto; histórico em 3–5 linhas; números reais.
- Links cruzados apontando para os nomes atuais.
