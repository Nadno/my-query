const { $ } = require('./src/main');

console.log('=== $ object properties ===');
console.log('typeof $:', typeof $);
console.log('$.style:', $.style);
console.log('typeof $.style:', typeof $.style);

console.log('=== Check div property ===');
console.log('$.div:', $.div);
console.log('typeof $.div:', typeof $.div);

if (typeof $.div === 'function') {
  console.log('=== Test $.div() ===');
  const div = $.div('Hello World');
  console.log('div:', div);
  console.log('div.tagName:', div.tagName);
  console.log('div.textContent:', div.textContent);
}

console.log('=== Check all properties ===');
const allProps = Object.getOwnPropertyNames($);
console.log('Own properties:', allProps);

const allKeys = Object.keys($);
console.log('Enumerable properties:', allKeys);
