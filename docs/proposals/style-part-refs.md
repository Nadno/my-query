# Proposta: refs de parte e "nivelamento" no `style()` (design em aberto)

Status: **DESIGN EM ABERTO (2026-09-11)** — ainda não implementado. Surge da refatoração dos
exemplos WAI-ARIA: `parts` aninhado complica a leitura e o `$parte` cru dentro de `&[...]` resolve
só nomes do **mesmo nó**. Antes de migrar os exemplos, o usuário levantou duas direções de API.

## Contexto / decisão travada

- **`style()` (sem `$`)** é o nome do namespace de subsistema, decidido em
  [style-namespace.md](style-namespace.md): *raiz usa `$`* (coisas chamadas escrevendo view:
  `$mount`, `$when`, `$cx`); *namespace/subsistema não* (`style`, `handle`, e `mini-q/aria` também:
  `RovingFocus`, `CheckGroup`). `mini-q/style` já separa por contexto de import.
- **`$style` já existe como prop reativa** no caminho comum (`$.div({ $style: () => ({...}) })`,
  [USAGE](../USAGE.md) §2). Nesse contexto, `$` = "reativo", não "namespace".
- O **atalho `>nome`** (partes no topo, `>title` ≡ `parts: { title }`) já está implementado
  (`src/style/parts.ts`, `splitShortcutParts`/`mergeParts`) e documentado em
  [STYLE](../STYLE.md). Recursivo. Este é o idioma atual preferido de declaração.

## Problema real (nivelamento)

O resolver de refs de parte (`src/style/emit.ts`, `resolvePartRefs`) só conhece os nomes de parte
**do nó atual** (`src/style/buildNode.ts:60-66`: `PartRefs` montado por nó). Consequências:

- `'&[aria-checked="true"] $dot'` funciona **dentro** da parte `radio` (o `dot` é filho dela);
- no **root** do bloco **não** dá para escrever `'& $radio $dot'` mirando um neto 2 níveis abaixo —
  o mapa de refs é local, não global do bloco.

Isso força declarações aninhadas profundas (a forma `parts` explícito) e é uma das razões de os
exemplos ficarem com `parts` aninhado em vez do shortcut `>nome`.

**Evidência (2026-09-11, `examples/wai-aria/`):** dos 10 exemplos, **todos (10/10)** declaram a
árvore com `parts: {}` (accordion 3, radio-group/switch 2, os demais 1) e **nenhum** usa o shortcut
`>nome` (0/10). O `>nome` existe desde 2026-09-10 ([BACKLOG](../BACKLOG.md)) mas não virou o idioma
— a falta do documento-guia (`AGENTS.md` anterior) e o costume das referências explicam o desvio.

> Nota: as **classes** de parte já são **depth-independent** (`-{bloco}-{chave}` em toda
> profundidade, `src/style/scope.ts`, `partClass`) — o bloqueio é só no **resolver de refs no
> seletor**, não na nomenclatura.

## Proposta do usuário (a avaliar)

Rename `style` → `$style` (decisão apontada como "passada batido") **e** um shape declarativo novo
para partes com refs de selector:

```js
$style({
  $partName: { $: '>', ... },              // $partName permite `$: ':scope > .prefixo'`
  '$parentPartName >': { ... },
  '$parentPartName > $partName': { ... },    // referência entre níveis
});
```

A ideia central: fazer as partes referenciadas por `$` **resolverem entre níveis** (nivelamento),
em vez de só do próprio nó — `$: '$parentPartName >'` ou `'$parentPartName > $partName'`.

## Análise honesta

1. **Rename `style` → `$style`: não recomendo.**
   - Conflito léxico real com a prop reativa `$style` no caminho comum — a mesma string com dois
     significados no mesmo ecossistema.
   - Derruba a régua raiz-vs-namespace já travada (style-namespace.md) sem ganho claro: o contexto
     `mini-q/style` no import já desambigua.
   - Mudança de contrato pública (docs, tests `STY.*`, call-sites) por um ganho de cosmética.

2. **Resolver refs de parte globalmente no bloco: tem mérito real.**
   - Atende a dor concreta (mexer um neto a partir do root / de um nível irmão).
   - Como as classes são depth-independent, o `$nome` global é tecnicamente trivial: o `PartRefs`
     de cada nó já poderia incluir **todas** as partes declaradas no bloco (ou herdar as do pai).
   - O formato `$nome` em seletor já existe; o risco é de **colisão de nomes** entre níveis
     (dois `dot` em lugares diferentes) — precisa de regra de precedência (o mais próximo vence?)
     ou de qualificação (`$pai.filho`?).

3. **`parts:` aninhado vs `>nome`:** a migração dos exemplos **não precisa esperar** essa decisão.
   `>nome` já dá a leitura plana; `$dot`/`$icon` atuais (mesmo nó) já funcionam.

## Recomendação

Separar as duas decisões:

- **Agora:** refatorar os exemplos com o idioma atual (`>nome` + flags de parte no `$class`),
  matando os bugs silenciosos encontrados (`&[aria-checked]` dentro de `style:` inline — nunca
  compila; `value:` cru recebendo signal).
- **Separado (spike/plano próprio):** o nivelamento global de `$partes` — mexe no contrato do
  engine e nos 324 testes `src/style/__tests__`; merece proposta independente com regras de
  precedência/qualificação antes de qualquer implementação.
