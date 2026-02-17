import { HTML_TAGS } from './src/modules/my-query/tags';
import { createTagFactories } from './src/modules/my-query/builder';
import { $ } from './src/modules/my-query/builder';

console.log('HTML_TAGS:', HTML_TAGS);
console.log('Tags count:', HTML_TAGS.length);

const factories = createTagFactories();
console.log('Factories created:', Object.keys(factories).length);
console.log('Factories:', Object.keys(factories));

console.log('$.style:', typeof $.style);

// Test if div tag is available
console.log('$.div:', typeof ($ as any).div);
if (typeof ($ as any).div === 'function') {
  const div = ($ as any).div('Hello World');
  console.log('Div created:', div);
  console.log('Div text:', div.textContent);
}
