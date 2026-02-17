const { $ } = require('./src/main');
const { createTagFactories } = require('./src/modules/my-query/builder');

console.log('=== $ object ===');
console.log('$:', $);
console.log('typeof $:', typeof $);
console.log('$.style:', $.style);
console.log('typeof $.style:', typeof $.style);

console.log('=== Create tag factories ===');
const tagFactories = createTagFactories();
console.log('tagFactories:', tagFactories);
console.log('tagFactories.div:', tagFactories.div);
console.log('typeof tagFactories.div:', typeof tagFactories.div);

// Add tag factories directly to $ for testing
for (const [tag, factory] of Object.entries(tagFactories)) {
  $[tag] = factory;
}

console.log('=== After adding tag factories ===');
console.log('$.div:', $.div);
console.log('typeof $.div:', typeof $.div);
if (typeof $.div === 'function') {
  console.log('Testing $.div():', $.div('Hello World'));
}
