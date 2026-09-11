# Spec: refs de parte e "nivelamento" no `style()` — `$` como idioma único de parte

Status: **ENGINE IMPLEMENTADO (2026-09-11)**. Implementado em `src/style/*` com testes
(`dollar.test.ts` + migração dos testes legacy) e `dist/` rebuildado. **Pendente da fase de
migração** (adiada pelo usuário — "esquece os exemplos por agora"):
- remoção do legacy (`parts:{}`, `>nome`, `slots:`, topo `flags/variants/defaults`),
  hoje mantido como **compat de transição** para `examples/wai-aria` e `examples/auth` passarem;
- migração dos exemplos para o idioma `$` + docs derivadas.

---

## 1. Decisões fechadas

1. **`$nome` é a ÚNICA forma de declarar parte.** Remove-se `parts:{}` e o atalho `>nome`
   (que emitia descendente apesar do símbolo prometer filho direto).
2. **Parte declarada em chave `$nome` emite filho direto:** `& > .-bloco-nome`.
   Em parte aninhada dentro de outra parte, o "pai" da regra é o self da parte-pai:
   `.field > .-content > .-field-description` (neta filha direta de `content`).
3. **Refs `$` em seletor são GLOBAIS ao bloco** — resolvem de qualquer nível, não só do nó atual.
   Regra de precedência: o mais próximo do nó vence em colisão de nome (explicita no §4).
4. **Composição via string crua** com `$`-refs dentro (autor controla o seletor):
   `'$foo > $bar + $qux'`, `'&[aria-checked="true"] > $dot'`, `'& $nome'` (descendente explícito).
   Sem `_$nome` (descendente implícito), sem `$$nome` (subcomponente) — cortados por YAGNI.
5. **Chave exata `$:` = ficha técnica do bloco** (não gera regra): `scope`, `hosts`, `defaults`,
   `flags`, `variants`, `keyframes`. Tudo o mais no topo = CSS incondicional (decls/`&`/`$parte`/composto).
6. **`slots:` é substituído por `hosts:`** — "blocos estrangeiros que este bloco hospeda" (o
   vocabulário da doc já é hospeda/hospedado). Override em flag continua: `hosts: { control: {...} }`.
   `hosts` é **somente estilístico** (emite seletor até a classe do hospedado); o caso popup/teleport
   (render em outra árvore + contexto) continua sendo um composable runtime à parte, fora do stylesheet.
7. **flags/variants/kefyrames vivem em `$:`** (são o "CSS condicional" / recursos). O topo nunca mistura
   condicional com declaração incondicional.
8. **Call-site do handle NÃO muda** — `field.label.self === '-field-label'`, `field.content.description.self`
   (depth-independent, `src/style/scope.ts`), `field({ size, invalid })` idêntico. Só muda o **CSS emitido**
   (combinador) e a **forma de escrever** o config.

---

## 2. Forma final (referência)

```ts
const field = style('field', {
  $: {
    scope: { strategy: 'native' },
    hosts: { control: inputHandle },
    defaults: { size: 'md' },
    flags: { invalid: { $error: { color: 'red' } } },
    variants: { size: { sm: { gap: 4 }, md: { gap: 8 } } },
    keyframes: { pulse: { from: { opacity: 0.6 }, to: { opacity: 1 } } },
  },
  display: 'flex', flexDirection: 'column',
  $label: { fontSize: '.9rem' },
  $status: { $icon: { transition: 'transform .2s' } },   // .field > .-field-status > .-field-icon
  '&:hover': { boxShadow: '0 0 0 2px rgba(255,255,255,.2)' },
  '&[aria-checked="true"] > $dot': { '::after': { transform: 'scale(1)' } },  // composto c/ ref
  '& $muted': { opacity: 0.8 },                         // descendente EXPLÍCITO quando quiser
});
```

**CSS emitido (prefixed):**

```css
.field { display: flex; flex-direction: column; }
.field > .-field-label { font-size: .9rem; }
.field > .-field-status > .-field-icon { transition: transform .2s; }
.field:hover { box-shadow: 0 0 0 2px rgba(255,255,255,.2); }
.field[aria-checked="true"] > .-field-dot::after { transform: scale(1); }
.field .-field-muted { opacity: 0.8; }
.field.--is-invalid > .-field-error { color: red; }
.field.--size-sm { gap: 4px; }  .field.--size-md { gap: 8px; }
@keyframes field-pulse { … }
```

**Handle** (não muda): `field.label.self === '-field-label'`, `field.status.icon.self`,
`field.hosts.control === 'input'`, `field({ size:'sm', invalid:true })`.

---

## 3. Parsing determinístico (a régua)

| chave em `config` | tratamento |
|---|---|
| exatamente `$:` | ficha técnica (`scope`/`hosts`/`defaults`/`flags`/`variants`/`keyframes`) |
| `$nome` (`^\$[A-Za-z0-9_-]+$`) | parte direta → `& > .-prefixo-nome` (no contexto do self do nó) |
| qualquer outra string | seletor CSS; refs `$ref` dentro resolvidas para classes de parte (global) |
| escalar (`padding: 8`…) | declaração CSS do self atual |
| `&…` / `@…` | pseudo/at-rule preservadas (aninhamento atual) |
| `_$nome`, `$$nome`, … | chave comum — sem refs (não casa a regex); cai no caminho de seletor/ignorada p/ warn se objeto |

Em JS, `{ $label: … }` e `{ '$label': … }` são idênticos ⇒ **impossível** distinguir "parte filha direta"
de "parte" — ambas são filho direto. `'$label '` (com espaço, composta) não casa a regex e vira seletor.
Sem exceção, sem estado.

---

## 4. Resolver `$` global (nivelamento)

`resolvePartRefs` (`src/style/emit.ts`) hoje usa `PartRefs` do **nó atual** (`buildNode.ts:60-66`).
Nova regra: cada nó constrói seu mapa = **próprios `$parte` + herdado do pai**, mais distante vence
(o mais próximo sobrescreve em colisão de nome). As classes continuam `partClass` depth-independent,
então `$dot` no root resolve `-field-dot` do bloco. Efeito:

- `'&[aria-checked="true"] > $dot'` no **root** passa a funcionar (hoje só dentro da parte `radio`).
- `'$foo > $bar + $qux'` compõe três refs de nível qualquer.

Colisão (dois `$dot` em níveis diferentes): o do nó corrente (o mais próximo) vence. Documentado; se a
prática cobrar qualificação (`pai.filho`), é adição futura — YAGNI hoje.

---

## 5. Superfície de mudança

**Engine — `src/style/`:**
- `types.ts` — `StyleConfig`: `$:` (subset tipado), index `$nome`/composto; remove índice `>nome`
  e `parts`; `slots`→`hosts` (rename só de chave).
- `parts.ts` — **morre** (`splitShortcutParts`), substituído por separador `$:`/`$nome`/topo.
- `build.ts`/`buildNode.ts` — monta `selfSel` com combinador **filho-direto** para partes (`& >`);
  `PartRefs` global (acumula pai); handle idêntico; `injectBody` (flags/variants) passa a mirar
  partes por `$error` e hosts por `hosts`.
- `scope.ts` — inalterado (classes/ids já depth-independent).
- `emit.ts` — `resolvePartRefs` ganha o mapa global (acumulado) — mecânica continua igual.

**Testes existentes (contrato que muda):**
- `emit.test.ts:12-39` — `parts`→`$nome`/`$:{}`; seletor descendente→`>` (ex.: `.-content .-description`
  vira `> .-content > .-description`); override `flags: { invalid: { parts:… } }`→`$: { flags: { invalid: { $error } } }`.
- `slots.test.ts:11-38` — `slots:`→`hosts:`; override idêntico; aviso renomeia ("host").
- `variants.test.ts`, `handle.test.ts`, `warns.test.ts`, `scope.test.ts`, `media.test.ts` —
  onde usam `parts:`/`>nome`/`slots`, migram; asserts de CSS atualizam combinador.
- **NOVOS testes** (TDD antes da migração dos exemplos):
  - `$nome` → `.field > .-field-label` (filho direto).
  - Neta: `$status: { $icon }` → `.field > .-field-status > .-field-icon`
  (classe depth-independent `-{bloco}-{chave}`, `./scope.ts` `partClass`).
  - Composto: `'$foo > $bar + $qux'` e `'& $muted'` (descendente explícito) resolvem refs globais.
  - Ref global: `'&[aria-checked="true"] > $dot'` **no root** resolve o neto do bloco.
  - `$:` com `hosts` + `flags` mirando host; `defaults`; `scope`; `keyframes` no `$:`.
  - Colisão: duas `$dot` → a mais próxima vence.
  - Warn: `_$nome`/`$$nome`/objeto desconhecido no topo avisam (não viram parte silenciosa).

**Exemplos — `examples/wai-aria/*.html` (10):** migração `>nome`→`$nome` (o commit `3668ead` recém
migrou para `>nome`; reverter para a forma `$`). Os usos `'& \$icon'`/`'& \$dot'` dentro de `&[...]`
continuam (agora globais). `switch` já usa flags; `disclosure` idêntico com `$`.

**`examples/auth/web/src/**/*.style.ts` (~12 arquivos, todos `parts:`/`slots:`):** migrar. Casos:
Flat — `shell`, `Modal`, `Tabs`, `Accordion`, `Stepper`, `Switch`, `Carousel`, `Settings`, `Login`,
`PartnersFields`, `Field` (`slots`→`hosts`, flags `invalid`). Sem neta real no auth (verificadas —
`Field` usa host `input`; `Switch`/`Tabs` usam `flags` locais de parte). Call-sites (`sField.label`,
`field({ invalid })`) não mudam de nome.

**Docs:** `docs/STYLE.md` (reforma do §config/partes/hosts/`$:`), `docs/GLOSSARY.md`,
`docs/USAGE.md` §Referência (§11, linha 561: `class/$class/$style` — sem `parts`/`slots`),
`docs/TEST-SPEC.md` (STY.9.x: partes `>$nome`→`$nome`, slots→hosts), `AGENTS.md` §4
(exemplos + tabela de chaves + idioma `$class:`), `docs/proposals/style-scope.md`/`style-namespace.md`
(referem `parts`/`slots`).

---

## 6. Ordem de execução (plano dedicado)

1. Rewrite do engine (`types`→separador→`buildNode`→`emit` global) com testes **novos** primeiro
   (TDD, §5) e os existentes ajustados ao contrato novo.
2. Migração `examples/wai-aria` (10) — specs como oráculo (já cobrem comportamento, não CSS string).
3. Migração `examples/auth` (12 `.style.ts`) — testes do auth (vitest+playwright do exemplo) verdes.
4. Docs (STYLE/GLOSSARY/USAGE/TEST-SPEC/AGENTS) + BACKLOG anotado.
5. Verificação de fechamento obrigatória: `npx vitest run`, `npx tsc --noEmit`,
   `npm run build:lib`, `npx playwright test`, `npx playwright test static.spec.ts`.

> Não-decisões: keepyframes na árvore (sob `$:`), `style.css/shortcut do `$` em prop reativa `$style`
> permanece (régua raiz-vs-namespace, style-namespace.md). `hosts` só estilístico — popup/teleport
> é composable runtime à parte, fora desta spec.
