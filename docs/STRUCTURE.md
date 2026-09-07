# mini-q — Padrão estrutural (colocation + feature-sliced)

Como o código de `src/` é organizado. Duas ideias governam tudo:

1. **Colocation** — o que muda junto, mora junto. **Tipos, utils, testes e afins vivem na
   mesma pasta da feature**, não em árvores paralelas (`types/` global, `__tests__/` à parte).
   Abrir a pasta de um assunto deve mostrar *tudo* dele.
2. **Feature-sliced** — cada subsistema é uma **slice** (fatia) autocontida com uma **superfície
   pública única** (o barril `index.ts`). O resto é interno à slice.

O objeto raiz `$` (`src/index.ts`) só **compõe as slices** — não implementa regra de negócio.

---

## Anatomia de uma slice

Uma slice é uma pasta cujo `index.ts` é a única porta de entrada. Dentro, os arquivos são
nomeados pelo **papel**, não por tipo genérico:

```
src/style/
  index.ts     ← barril: a superfície pública (o que o resto do app importa)
  emit.ts      ← motor: objeto JS → CSS → injeção no DOM
  build.ts     ← lógica de domínio: $.style(name, config) → StyleHandle
  types.ts     ← contrato público da slice (colocado, não global)
  style.test.ts (ideal: teste colocado — ver "Débito" abaixo)
```

Regras:

- **Imports externos apontam para o barril** (`from './style'`), **nunca** para o interior
  (`from './style/build'`). O interior pode ser refatorado à vontade sem quebrar ninguém.
- **Dentro da slice**, os arquivos importam uns dos outros por caminho direto (`./emit`, `./types`).
- **Tipos da slice** ficam em `types.ts` **dentro** dela. Só sobe para um lugar comum o que é
  genuinamente compartilhado por várias slices.
- **Utils** de uma slice ficam na slice. Um util só migra para um lugar comum quando um **segundo**
  consumidor real aparece (evitar abstração especulativa).
- **Testes colocados**: `x.test.ts` ao lado de `x.ts` (ou um `__tests__/` **dentro** da slice).

---

## Quando promover arquivo → pasta

Comece simples. Um módulo nasce como **arquivo solto** (`reactive.ts`, `mount.ts`). Ele vira
**pasta/slice** quando cruza qualquer um destes limiares:

- passa a ter **mais de uma preocupação** separável (ex.: emissão vs. build vs. tipos);
- ganha **tipos próprios não triviais** + **utils** + **testes** que se beneficiam de morar juntos;
- o arquivo único fica grande o bastante para que "onde está X?" deixe de ser óbvio.

Promover = criar a pasta, quebrar por papel, adicionar `index.ts` reexportando a superfície que
já existia. Como o import externo era `./style`, ele **continua resolvendo** para `./style/index.ts`
— a promoção é invisível para quem consome. Foi exatamente assim que `style.ts` virou `style/`.

Não promova só por estética: um arquivo coeso de 80 linhas não precisa de pasta.

---

## Mapa atual

| Slice / módulo | Forma | Papel |
|---|---|---|
| `style/` | slice (emit/build/types + barril) | CSS: `$.style` namespace |
| `events/` | slice (handle/apply/custom/types + barril) | eventos + custom events + `handle` |
| `dom/` | pasta (só `nodes.ts`) | primitivas de nó/`cx` |
| `adapters/` | pasta (só `preact.ts`) | adapters de signal |
| `reactive.ts` | arquivo | contrato de reatividade (adapter) |
| `element.ts` | arquivo | `createTag` + children + região keyed + `when` |
| `mount.ts` / `lifecycle.ts` | arquivos | escopo de montagem/cleanup |
| `behaviors.ts` | arquivo | `model`/`show` (`use`) |
| `config.ts` / `media.ts` | arquivos | breakpoints (`$.config` + `@nome` + `$.media`) |
| `types.ts` | arquivo (global) | tipos de View compartilhados (`Props`, `Child`, …) |
| `index.ts` | raiz | compõe o `$` a partir das slices |

---

## Débito conhecido (rumo à colocation plena)

Onde a prática ainda não bateu com o princípio — corrigir aos poucos:

- **`src/__tests__/` é uma árvore paralela.** O ideal é teste colocado (`style/style.test.ts`
  ou `style/__tests__/`). Migrar por slice quando mexer nela.
- **`src/types.ts` é global.** Parte é genuinamente compartilhada (View/`Props`); se algum tipo
  ali pertence a uma slice só, ele deveria descer para a slice.
- **`config.ts` + `media.ts`** são uma mesma preocupação (breakpoints) espalhada em dois arquivos
  soltos — candidatos a uma slice `breakpoints/` (ou entrar em `style/`, dado o acoplamento via
  `resolveMedia`).
- **`dom/` e `adapters/` são pastas-de-um sem barril.** Ok enquanto tiverem um arquivo; se
  crescerem, ganham `index.ts` como as demais.
