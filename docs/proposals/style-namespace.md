# Proposta: `$.style` como namespace (partes/flags/variants explícitos)

Status: **✅ IMPLEMENTADA (2026-09-06)**. Origem: review externo, 2026-09-06. Substituiu o módulo de
estilo de entidade (chaves reservadas + heurística de filho). Ver `docs/GLOSSARY.md` p/ vocabulário.
Nota: o idioma de parte evoluiu em **2026-09-11** para `$nome`/`$:`/`hosts`
(`docs/proposals/style-part-refs.md`); esta spec é o registro histórico do namespace `style`.

> **Decisões finais do usuário** (divergem do §"Decisões acopladas" abaixo, que era pré-implementação):
> **(1)** nome = **completo do bloco sempre**, depth-independent (`-category-card-title`); sem `elementWord`,
> sem `$.config({ classNames })`. **(2)** combinador **descendente automático** mantido (não filho-direto).
> **(3)** keyframes **fica na árvore** (chave `keyframes`), **não** içado p/ `$.style.keyframes`.
> `$.handlers` (raiz) **não** foi removido nesta leva (fora do escopo de estilo).

## Problema com o atual
`$.style` é sobrecarregada por formato do argumento (`isVariantConfig` = tem `variants`). Defeitos verificados:
bloco não pode ter partes **e** variantes (partes descartadas em silêncio); parte chamada `variants` vira cva;
chaves reservadas (`base`/`modifiers`/`keyframes`/`variants`) disputam namespace com nomes de parte. E a
superfície de CSS (`$.style`/`$.parts`/`$.css`/`$.cx`) está espalhada na raiz sem indicar que é um subsistema.

## Forma proposta

```ts
type CSSObject = { [k: string]: string | number | boolean | null | undefined | CSSObject };

interface StyleApi {
  <T extends StyleConfig>(name: string, config: T): StyleHandle<T>; // define entidade
  (name: string): string;                                           // só reserva o nome
  css(selector: string, styles: CSSObject): void;                   // escape hatch global
  keyframes(name: string, frames: Record<string, CSSObject>): string; // animação compartilhável
}

interface StyleConfig {
  base?: CSSObject;
  parts?: Record<string, StyleConfig>;                    // recursivo (partes explícitas)
  flags?: Record<string, CSSObject>;                      // booleanas independentes
  variants?: Record<string, Record<string, CSSObject>>;   // grupos exclusivos
  defaults?: Record<string, string>;
}

interface StyleHandle<T> {
  (props?: VariantProps<T>): string;   // field({size:'sm', invalid:true}) → 'field --size-sm --invalid'
  readonly self: string;               // 'field'
  readonly parts:    { [K in keyof T['parts']]: StyleHandle<T['parts'][K]> };
  readonly flags:    { [K in keyof T['flags']]: string };      // '--invalid'
  readonly variants: { [G in keyof T['variants']]: { [V in keyof T['variants'][G]]: string } };
}
```

`style: StyleApi` na raiz. Saem `$.parts` (alias deprecated por 1 versão) e `$.css` (vira `$.style.css`).
`cx`, `config`, `media` **ficam na raiz** (cx monta prop do DOM; breakpoints são registro compartilhado
CSS+reativo). Alias de raiz `$.handlers` **sai** (usar `$.handle.handlers`) — mesma régua.

**Régua raiz-vs-namespace (p/ o glossário):** raiz = o que se chama escrevendo view (factories, `mount`,
`when`, `cx`, `append`); namespace = subsistema com vocabulário próprio (`style`, `handle`).

## Exemplo + CSS emitido

```ts
const field = $.style('field', {
  base: { display: 'flex', flexDirection: 'column' },
  parts: { input: { base: { padding: 8 } }, error: { base: { color: 'var(--danger)' } } },
  flags: { invalid: { parts: { input: { base: { borderColor: 'red' } } } } },
  variants: { size: { sm: { gap: 4 }, md: { gap: 8 } } },
  defaults: { size: 'md' },
});
```
```css
.field { display: flex; flex-direction: column; }
.field .-input { padding: 8px; }
.field .-error { color: var(--danger); }
.field.--invalid .-input { border-color: red; }
.field.--size-sm { gap: 4px; }
.field.--size-md { gap: 8px; }
```
Uso reativo: `$class: () => $.cx(field.self, err.value && field.flags.invalid)` ou `field({ size: size.value })`.
Override de filho dentro de flag vem sob `parts` (não mais heurística frágil). `field.parts.input` (espelha config).

## keyframes içado
`const pulse = $.style.keyframes('pulse', { from:{opacity:.6}, to:{opacity:1} })` → string p/ `animationName`.
Compartilhável entre blocos. **Removido da árvore de entidade** (evita dois lugares p/ declarar). Custo: nome
não é mais auto-escopado — entra no `warnDup` e no `prefix` (que ainda falta no `config`).

## Decisões acopladas — RESOLVIDAS (2026-09-06)
1. **Nome da parte: manter `elementWord`, uniforme nos dois níveis.** Regra passa a ser depth-independent:
   `partClass(key) = kebab(key) tem '-' ? -{kebab} : -{element(bloco)}-{kebab}` — aplicada em TODA profundidade
   (filho e neto ambos "duas palavras"), então mover parte de nível não renomeia. **Prefix configurável**:
   `$.config({ classNames: 'element' | 'full' })` — `element` (default) → `-card-title`; `full` → nome completo
   do bloco no prefixo (`-category-card-title`). Usuário escolhe o estilo.
2. **Sem combinador automático** entre bloco e parte — "o usuário insere como bem entender" (ver §Combinador abaixo, a confirmar).
3. **keyframes içado** para `$.style.keyframes`, **removido da árvore**.

## Combinador — interpretação a confirmar
"Sem combinador" ⇒ o engine **não** encadeia bloco→parte por padrão. Interpretação: cada parte vira uma
**classe solta** escopada pelo prefixo (`.-card-title { … }`), e o bloco é sua própria regra (`.category-card { … }`);
qualquer relacionamento (descendente/`>`) o usuário escreve à mão (via `&`/seletor cru no `base`). Em aberto:
como o override de flag sobre parte é emitido (`flags.invalid.parts.input`) — com ou sem encadeamento.

## O que quebra (migração)
| Antes | Depois |
|---|---|
| `$.parts(name, tree)` | `$.style(name, { parts:{…} })` |
| `$.css(sel, obj)` | `$.style.css(sel, obj)` |
| `modifiers` → `.mods.x` | `flags` → `.flags.x` |
| `keyframes` na árvore | `$.style.keyframes(name, frames)` |
| variantes ⊻ partes | coexistem |
| folha devolve `string` | sempre `StyleHandle` |
| `.blk--sm` | `.blk.--size-sm` |
| `$.handlers` (raiz) | `$.handle.handlers` |

8 call-sites do `examples/auth` migram junto (`Field`/`Stepper` são o teste real). USAGE §11 e GLOSSARY reescrevem.

## Endosso (meu)
Adotar o **estrutural** (namespace, `parts` explícito, flags×variants coexistindo, retorno callable único).
As 3 decisões acopladas são do usuário. Executar como um plano dedicado (rewrite de `style.ts` + migração + docs).
