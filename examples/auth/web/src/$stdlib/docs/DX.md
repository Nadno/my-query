# DX de lib — o que ganha lugar

Este ficheiro define **o que senta** na fachada das libs portáveis desta base e **o que não senta**. Os critérios vieram das decisões já tomadas, não as antecipam: cada acórdão na [jurisprudência](#jurisprudência) foi dado sobre código implementado, com consumidores reais. É o freio ao impulso de misturar escopos e extrapolar — consultar antes de acrescentar qualquer símbolo.

## Âmbito

Os critérios valem para qualquer pasta portável desta base (`$stdlib`, `$stdbrowser`, irmãs futuras), enunciados sem vocabulário de nenhuma lib. O [ROADMAP](ROADMAP.md) de cada pasta mantém o calendário e o filtro local; este ficheiro é o critério transversal e o **registo vivo de acórdãos** — a secção de jurisprudência cresce quando há decisão nova, não por simetria.

## Casa única

Cada operação que o host executa tem **exactamente uma casa**. Admitir um símbolo numa lib obriga a matar a alternativa no host; duas casas para a mesma operação é o estado de "soma" que o [filtro do ROADMAP](ROADMAP.md#filtro-o-que-vale) proíbe.

Exemplo actual: `Str.capitalize` existe e o host ainda chama o `capitalize` do `es-toolkit` — a mesma operação com duas casas até os call sites migrarem (apontado em [PENDENCIAS](PENDENCIAS.md)).

## O que ancora um símbolo

Três âncoras, e o símbolo precisa de todas as que se aplicam:

1. **Dor repetida** — o padrão solto que se repete de host para host. É o critério de entrada do filtro.
2. **Consumidor vivo** — no host, dentro da própria lib, ou um alvo conhecido e nomeado. Zero consumidores com alternativa viva é especulação: `Str.format` competiria com a interpolação do i18n do host e ficaria fora se não houvesse alvo — o alvo existe (`formatLabels`), por isso fica.
3. **Casa única** — admitir mata a alternativa (secção anterior).

A **dependência interna** ancora sozinha: `Obj.identity` sustenta o Obj porque as chaves de cache do `HttpQuery` o usam, mesmo que `omit`/`pick` nunca vejam o host. Fachada fina com verbo real vale; fachada larga sem consumidor não.

## O corte da fachada

Um módulo é **um verbo** — casing, duração, mapa bidireccional — nunca o inventário de uma toolkit. Cada fachada apresenta 2–4 símbolos; o que não cabe no verbo fica one-liner no host ou fora. Quando surge a tentação de acrescentar "só mais um" utilitário ao módulo, o verbo do módulo é a resposta: se o novo símbolo não é o verbo, é outro módulo ou é nada.

## Prova de admissão

Antes de acrescentar — ou de manter — um símbolo, responder em ordem:

1. **Dor repetida?** O padrão solto existe em mais que um sítio?
2. **Consumidor vivo?** No host, interno, ou alvo conhecido e nomeado.
3. **Casa única?** A alternativa no host morre nesta etapa?
4. **Qual é o corte?** Um verbo, 2–4 símbolos.

Um "não" em qualquer pergunta: fica fora. Se a resposta for "pode ser útil um dia", é extrapolação — o pé no chão é o "não" dito cedo.

A prova vale nos dois sentidos: símbolo que já está na fachada e deixa de ter resposta perde o lugar. Manter sem âncora é a mesma especulação, com custo.

## Jurisprudência

Acórdãos colhidos de decisões já tomadas sobre código implementado. Novos entram quando acontecerem — incluídos os da `$stdbrowser`.

**Type fica.** Os `is*` guards (inspiração .NET, como `Number.isNaN`) têm casa única no `Type`; validação desta família nasce em qualquer aplicação minimamente grande. O consumidor vivo é o host (`isPlainObject` em três sítios) e a migração pendente do `isNil` alarga a adoção.

**Obj fica.** Dependência interna: `identity` alimenta as chaves de cache do `HttpQuery`. `merge` tem consumidor na `$stdbrowser`; `omit`/`pick` esperam consumidor sem pressa — o módulo não depende deles para se justificar.

**Str.format fica.** Alvo conhecido e nomeado: o utilitário `formatLabels` do host interpola à mão; a migração (plano C) passa a fichá-lo. Até lá, o símbolo tem alvo, mesmo sem consumidor migrado.

**Str.slugify/truncate ficam fora.** Sem consumidor e sem alvo; `Str` para no casing + interpolação — o verbo do módulo.

**Str.capitalize pendente.** Duas casas hoje (o host chama o do `es-toolkit`); migração apontada.

| Caso | Decisão | Âncora |
|------|---------|--------|
| `Type` (`is*`) | fica | casa única dos guards; consumidor no host |
| `Obj` | fica | dependência interna (`identity` → HttpQuery) |
| `Str.format` | fica | alvo conhecido (`formatLabels`) |
| `Str.slugify` / `truncate` | fora | sem consumidor nem alvo |
| `Str.capitalize` | pendente | duas casas; migração apontada |

## O que não está aqui

Fronteiras, por link — nada disto se duplica aqui:

- Processo, três planos, etapas e cobertura: [ROADMAP](ROADMAP.md) de cada pasta.
- "Substituir, não somar" como filtro de entrada: [ROADMAP — filtro](ROADMAP.md#filtro-o-que-vale).
- throw vs Result: [ROADMAP — forma de erro](ROADMAP.md#forma-de-erro).
- Regras de prosa e de doc de módulo: skill `dev-lib-docs`.
- Defeitos e migrações pendentes: [PENDENCIAS](PENDENCIAS.md).

Este ficheiro decide só design de API: o que a fachada sente e o que ganha lugar nela.