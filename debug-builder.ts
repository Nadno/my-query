import { $ } from './src/modules/my-query/builder.ts';

console.log('=== $ object properties ===');
console.log('typeof $:', typeof $);
console.log('$.style:', $.style);
console.log('typeof $.style:', typeof $.style);

console.log('=== Check div property ===');
console.log('$.div:', ($ as any).div);
console.log('typeof $.div:', typeof ($ as any).div);

if (typeof ($ as any).div === 'function') {
  console.log('=== Test $.div() ===');
  const div = ($ as any).div('Hello World');
  console.log('div:', div);
  console.log('div.tagName:', div.tagName);
  console.log('div.textContent:', div.textContent);
}

console.log('=== Check all properties ===');
const allProps = Object.getOwnPropertyNames($ as any);
console.log('Own properties:', allProps);

const allKeys = Object.keys($ as any);
console.log('Enumerable properties:', allKeys);
