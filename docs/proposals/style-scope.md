# Proposta: scope no `$.style` (dois motores de escopo)

Status: **EM PLANEJAMENTO (2026-09-10)**. Origem: pedido do usuário — o engine hoje só tem uma
estratégia de escopo (classes globais planas `-card-title` num `<style id="mq-styles">`).

Complementa [style-tokens.md](style-tokens.md) (deferida, native-first) e
[style-namespace.md](style-namespace.md).

## Motivação

Estado atual de emissão (um bloco):
```css
.card { display: flex; }                 /* self */
.card .-card-title { font-weight: 700; } /* parte, descendente */
.card.--is-featured { border-color: gold; } /* flag */
```
Tudo **plano e global** — colisão entre apps evitada só por sufixo descritivo. O `@scope` nativo
resolve de graça: `:scope` é a raiz; o escopo é real (não furar com Popover/Toast destacado).

## Dois motores, não "nativo vs polyfill"

"Não há polyfill — há **dois motores alternativos**, ambos primeiro-classe, cada um com um contrato
explícito.**" O desenvolvedor **escolhe o motor** sabendo o que ele expressa. Nenhum é *fallback*
do outro; cada um é o certo para um alvo:

| | `native` (`@scope`) | `prefixed` (classes) |
|---|---|---|
| Semântica | `:scope`, aninhamento, `to`, `:scope.--flag` | escopo **plano**: prefixo de classe, sem `:scope`, sem `to` |
| Público | browsers com `@scope` | browsers/contextos sem `@scope` |
| Relação | motor completo | motor propositalmente simples, **escolhido** |

`hashed` é apenas `prefixed` com nome auto-gerado — não é um terceiro motor, só conveniência de nome.

## Regra de contrato (a pedra do edifício)

> Usar um recurso fora do contrato do motor é **erro do usuário** — o engine avisa (dev) e não
> degrada. Não há "aproximação": cada motor só emite o que o contrato dele permite.

- Em `native`, o contrato é o `@scope` completo — emite fiel.
- Em `prefixed`, `to` / `:scope` **não existem** no contrato. Escrever `scope: { to: … }` com o motor
  `prefixed` é uso de recurso fora do contrato → **`warn` (dev) + não emite aquele `to`**. Não é
  degradação de um recurso que existia — é um recurso que o motor não oferece, e o desenvolvedor
  escolheu esse motor.

## Hierarquia de nome (identificação/leitura, não mecânico)

1. `config({ scope })` **global** define o motor + um nome opcional para o app.
2. `style('card', { scope: 'acme' })` local sobrescreve o nome.
3. `style('card', { scope: 'hashed' })` — sem nome global — gera um hash estável do bloco.
4. `style('card', { scope: { to: '.modal' } })` — só o limite (recurso nativo).

O nome é para **debug/leitura/SSR** e compõe por concatenação no motor `prefixed`. Não define a
semântica — o motor é quem define.

## Forma da API (proposta)

```ts
type ScopeStrategy = 'native' | 'prefixed';
type ScopeName = string | 'hashed';

interface ScopeConfig {
  strategy: ScopeStrategy;   // o motor
  name?: ScopeName;          // identificação/leitura (opcional)
  to?: string;               // limite do @scope (só nativo)
}

// no config global (default):
config({ scope: { strategy: 'native', name: 'acme' } });
```
- **herdar o default:** `style('card', { … })` — usa `config.scope`.
- **só a estratégia do bloco (nome do config):** `style('card', { scope: { strategy: 'native' } })`.
- **limite local:** `style('card', { scope: { to: '.modal' } })`.
- **nome + estratégia:** `style('card', { scope: { strategy: 'prefixed', name: 'acme' } })`.

## Aninhamento: escopo global + local

**native — donut.** O global é o *lower bound*; o local/`to` o *upper*:
```css
@scope (.acme) {
  @scope (.card) {
    :scope { display: flex; }
    .-card-title { font-weight: 700; }
    :scope.--is-featured { border-color: gold; }
  }
}
```
Cobre o caso **Popover/Toast** sem API extra: o destacado vaza o `@scope` interno e o `.acme` segue
como raiz.

**prefixed — concatenação de nome** (global `acme` + local `card` → `.acme-card`):
```css
.acme-card { display: flex; }
.acme-card .-acme-card-title { font-weight: 700; }
```

### Emissão por motor (mesma definição de bloco)

```ts
const card = $.style('card', {
  display: 'flex',
  parts: { title: { fontWeight: 700 } },
  flags: { featured: { borderColor: 'gold' } },
});
```
**native:** `@scope (.card) { :scope {...} .-card-title {...} :scope.--is-featured {...} }`
**prefixed:** `.acme-card {…}` + `.acme-card .-acme-card-title {…}` + `.acme-card.--is-featured {…}`

> **Handle segue o motor ativo:** `card.self`/`card.title.self` batem com as classes emitidas — o
> call-site (`$class: () => cx(...)`) tem de concordar. (Regra de ouro, inegociável.)

## Escolha do motor

**Declarada no `config`** (o padrão): `config({ scope: { strategy: 'native' } })`. Deterministica,
prévia para build/SSR. **Detecção automática por runtime** fica como melhoria futura — a decisão é
do desenvolvedor, não adivinhada pelo engine.

## Impacto no código (ganchos mapeados)

- **`src/style/config.ts`** — `MiniQConfig.scope?` + getter com default.
- **`src/style/build.ts`** — `partClass` prefixa no motor `prefixed`; em `native`, `selfSel` do nó
  raiz vira `:scope` e sub-partes param de repetir `.card`; resolução e recursão de escopos;
  guarda de contrato (`to` em `prefixed` → warn + não emite).
- **`src/style/emit.ts`** — `wrapScope(rules, selfSel, motor)`; reescrita de flag/variant para
  `:scope.--is-x` no native.
- **`src/style/types.ts`** — `StyleConfig.scope?`, `ScopeConfig`, `ScopeStrategy`.
- **`media.ts`** — sem impacto.

## Pontos abertos (resolver no plano dedicado)

1. **Nome/contrato dos motores**: `'native'`/`'prefixed'` são bons? (alternativa: `'scope'`/`'flat'`).
2. **Detecção automática**: vale a pena (ver §Escolha do motor) ou basta a declaração no config?
3. **Aninhamento em native**: `.-a > .-b`, `& > $title`, e `:scope` do anel interno precisam de
   teste real (o teste `emit-direct` é o gancho).
4. **keyframes / at-rules**: continuam fora do `@scope` (não são seletores).
5. **Coexistência**: bloco sobrescreve o motor? Permitido — cada bloco embrulha o próprio escopo.
6. **Limite `to` — suficiente via aninhamento?** Popover/Toast já resolve; validar se algum cenário
   exige `to` direto na superfície.
7. **Hash estável**: fnv-1a → base36 (4~5 chars) determinístico do bloco, não `Math.random`;
   SSR/hydration seguros.

## Regra de ouro (inalterada)

O **handle é a autoridade** de quais classes existem. `card(...)`, `card.self`, `card.title.self` e
o resolver `$nome` precisam **concordar** — senão o call-site desmonta. E cada motor respeita seu
contrato: **fora dele, avisa, não degrada.**
