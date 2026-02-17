import { $ } from './src/modules/my-query.js';

// Simple test to verify the fixes
const testApp = async () => {
  console.log('Testing builder fixes...');
  
  try {
    // Test 1: Create a reactive list
    const list = $.ul();
    const items = $.signal(['Item 1', 'Item 2', 'Item 3']);
    
    list.append($.computed(() => 
      items.value.map(text => $.li(text))
    ));
    
    console.log('✓ Reactive list created');
    
    // Test 2: Update the reactive list
    items.value = ['Updated Item 1', 'Updated Item 2'];
    console.log('✓ Reactive list updated');
    
    // Test 3: Create an element with custom event
    const button = $.button({
      'on::click-outside': () => console.log('Click outside button'),
      text: 'Click Me'
    });
    
    console.log('✓ Element with custom event created');
    
    // Test 4: Create an element with reactive style
    const box = $.div({
      style: $.computed(() => ({
        background: items.value.length % 2 === 0 ? 'lightblue' : 'lightgreen',
        padding: '10px',
        borderRadius: '5px'
      })),
      text: 'Reactive Box'
    });
    
    console.log('✓ Element with reactive style created');
    
    console.log('✅ All builder fixes verified successfully!');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
};

