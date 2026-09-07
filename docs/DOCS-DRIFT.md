# mini-q — Drift de documentação

Rastreia onde as **docs** ficaram defasadas em relação ao **código**, para varrer depois dos ajustes.
Fluxo: ao mudar a API, anote aqui o que a doc passou a dizer de errado; quando estabilizar, corrija a doc e
marque `[x]`. (O código é a fonte de verdade; esta lista aponta o débito documental.)

Legenda: **A** = afirma algo falso (corrigir já que induz a erro) · **F** = falta (cobrir) · **H** = histórico/menor.

---

## `docs/USAGE.md`

Defasou com o **redesenho de estilos** e os **fixes de runtime** (2026-09-06).

- [x] **A** §11 CSS: reescrita p/ o **namespace** (2026-09-06): `$.style(name, config)` → `StyleHandle`
  (callable + `self`/`parts`/`flags`/`variants`/`keyframes`); `base`/`parts`/`flags`/`variants`/`defaults`/`keyframes`;
  parte = nome completo do bloco; `$.style.css` global. Partes e variantes coexistem.
- [x] **A** §11: exemplos migrados de `$.parts('card', { root, title })` p/ `$.style('field', { parts:{…} })`
  → `field.self` / `field.parts.input.self`. `$.parts`/`$.css` = **alias deprecated** (documentado).
- [x] **A** Regras de ouro (item 8): reescrito — `$.style` devolve StyleHandle e injeta; globais em `$.style.css`.
- [x] **A** §"Ainda não implementado": "Engine de CSS" removido; keyframes já feito. Mantidos os demais débitos.
- [x] **A** §11/GLOSSARY reescritos de novo p/ a **polida** (2026-09-07): partes **promovidas** (`field.input`),
  `class`/`cx` aceitam o handle, **sem `base`** (decls no topo), flags `--is-*`, **slots**, overload só-nome
  removido. Os pontos acima que citam `.parts.x.self`/`--flag`/`base` são do estágio namespace anterior.
- [ ] **F** Breakpoints: documentar `$.config({ breakpoints })`, `@nome`/`@número` no CSS, e `$.media(nome|query)` → signal.
- [ ] **F** §1 Setup / adapter: contrato ganhou `untrack?` e `signal?` (necessário p/ `$.media`); mencionar.
- [ ] **F** Referência rápida: adicionar `$.config`, `$.media`; ajustar linha de `$.style`/`$.parts`.
- [ ] **H** §5 eventos: `handle.debounce`/`throttle` adiam o handler, então `prevent` composto atrás deles
  chega tarde — documentar a ordem (ou tratar `preventDefault` na captura).

## `docs/BACKLOG.md`

- [x] §Progresso + status + §Estilo (resolvido) + organização modular + ordem — atualizados em 2026-09-06.
- [ ] **H** Manter §Progresso e a "ordem sugerida" em dia a cada entrega.

## `~/.claude/plans/…-diffie.md` (spec de estilos)

- [ ] **H** É a spec **aprovada** do redesenho de estilos; virou histórico após implementar. Um detalhe divergiu:
  `base` ficou **opcional** (escalares/`&…`/`@…` no topo também são declarações) — a spec dizia declarações sob `base`.

## Memória do projeto (`mini-q-project.md`)

- [x] Estado/desvios atualizados em 2026-09-06 (estilo entidade, fixes, pendências).

---

## Como usar

Ao terminar uma leva de mudanças, abrir este arquivo, corrigir os itens **A** (mentiras) primeiro, depois **F**,
marcar `[x]`, e remover o que não fizer mais sentido.
