# Plano de Otimização do Builder (my-query)

## Análise do Desempenho Atual

Resultados do benchmark (10,000 elementos):
- React (build): <1ms (baseline)
- Vanilla JS: 7.20ms
- My-Query: 28.30ms (47x mais lento que Vanilla)
- jQuery: 75.50ms

## Principais Gargalos Identificados

### 1. Chamadas de Função Excessivas
**Local:** `src/modules/my-query/builder.ts`

Cada elemento criado executa múltiplas verificações:
- `isReactiveSource()` - linha 10, 223, 230, 252, 270
- `isNode()` - linhas 28, 35, 46
- `isPropsObject()` - linha 195
- `getReactiveValue()` - linhas 59, 81, 241, 286

**Impacto:** ~15-20 funções chamadas por elemento

### 2. Criação de Instâncias Desnecessárias
**Linhas:** 190, 215, 220, 266
```typescript
new MyQuery(element)  // Criado múltiplas vezes!
```
Isso envolve:
- Alocação de memória
- Chamada de construtor
- Inicialização de herança

### 3. Console.log no Código de Produção
**Linhas:** 214, 265
```typescript
console.log({ directiveKey, directiveValue, key, value });
console.log(element, { eventName, value });
```
**Impacto:** ~3-5ms por 10k elementos (muito lento!)

### 4. Object.entries() em Loops
**Linhas:** 209, 212, 234, 250
```typescript
for (const [key, value] of Object.entries(props)) {
```
Cria novo array a cada iteração.

### 5. Funções Definidas Dentro de Funções
**Linha:** 232-240
```typescript
const applyStyleObject = (styleObj: any) => {
  // função definida em runtime
};
```
Cria novo objeto de função a cada elemento.

### 6. flattenChildren() Recursivo
**Linhas:** 16-23
```typescript
function flattenChildren(children: any[]): any[] {
  return children.flatMap((child) => {
    if (Array.isArray(child)) {
      return flattenChildren(child); // Recursão!
    }
    return child;
  });
}
```

---

## Plano de Otimização

### Phase 1: quick Wins (Alto Impacto, Baixo Esforço)

#### 1.1 Remover Console.log
**Arquivo:** `src/modules/my-query/builder.ts`
- Remover linhas 214 e 265
- **Impacto esperado:** ~30-40% faster

#### 1.2 Criar Instância MyQuery Uma Vez
**Arquivo:** `src/modules/my-query/builder.ts`
```typescript
// Antes: criar instância múltiplas vezes
new MyQuery(element).directive(direciveKey, directiveValue);
new MyQuery(element).on(eventName, value);

// Depois: reutilizar instância
const mq = new MyQuery(element);
mq.directive(direciveKey, directiveValue);
mq.on(eventName, value);
```

#### 1.3 Cache de Object.entries
**Arquivo:** `src/modules/my-query/builder.ts`
```typescript
// Antes
for (const [key, value] of Object.entries(props)) {

// Depois - iterar diretamente
for (const key in props) {
  const value = props[key];
```

---

### Phase 2: Refatoração Estrutural

#### 2.1 Separar Fast Path do Slow Path
Criar função otimizada para elementos simples:
```typescript
function createElementFast(tag: string, children?: string | number): HTMLElement {
  const el = document.createElement(tag);
  if (children) el.textContent = String(children);
  return el;
}
```

#### 2.2 Inline de Verificações de Tipo
Substituir chamadas de função por checks diretos:
```typescript
// Antes
function isReactiveSource(value: any): boolean {
  return typeof value === 'object' && value !== null && 'subscribe' in value;
}

// Depois - inline (se possível)
const isReactive = value && typeof value === 'object' && 'subscribe' in value;
```

#### 2.3 Remover Recursão em flattenChildren
```typescript
// Antes - recursivo
function flattenChildren(children: any[]): any[] {
  return children.flatMap(child => Array.isArray(child) ? flattenChildren(child) : child);
}

// Depois - iterativo
function flattenChildren(children: any[]): any[] {
  const result: any[] = [];
  const stack = [...children];
  while (stack.length) {
    const child = stack.pop()!;
    if (Array.isArray(child)) {
      stack.push(...child);
    } else {
      result.push(child);
    }
  }
  return result;
}
```

---

### Phase 3: API Alternativa de Alta Performance

#### 3.1 Criar Fast Builder
Adicionar API alternativa para criação rápida:
```typescript
// $.div() - atual (flexível, lento)
$.div({ class: 'foo', style: {...} }, child1, child2)

// $.fast.div() - novo (rápido)
$.fast.div('class-name', 'text-content')
```

#### 3.2 Factory Function Otimizada
```typescript
function createElement(
  tag: string, 
  className?: string, 
  text?: string,
  styles?: Record<string, string>
): HTMLElement {
  const el = document.createElement(tag);
  if (className) el.className = className;
  if (text) el.textContent = text;
  if (styles) Object.assign(el.style, styles);
  return el;
}
```

---

## Estimativa de Melhoria

| Otimização | Impacto | Esforço |
|------------|---------|---------|
| Remover console.log | 30-40% | 5 min |
| Reutilizar MyQuery | 10-15% | 15 min |
| Inline type checks | 15-20% | 30 min |
| Fast path API | 50-70% | 2-3 horas |
| Iterative flatten | 5-10% | 20 min |

**Meta:** Reduzir de 47x para ~5-10x mais lento que Vanilla JS

---

## Métricas de Validação

Após cada otimização, rodar:
```
npm run benchmark  # ou abrir benchmark.html
```

Verificar progressivamente:
- 10k elementos: target <10ms
- 1k elementos: target <2ms
