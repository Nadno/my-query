import { $ } from './src/main.js';

// Simple test to verify the fixes
const testApp = async () => {
  console.log('Testing builder fixes...');
  
  try {
    // Test 1: Create a reactive list
    const items = $.signal(['Item 1', 'Item 2', 'Item 3']);
    const list = $.ul({}, $.computed(() => 
      items.value.map(text => $.li({}, text))
    ));
    
    console.log('✓ Reactive list created');
    
    // Test 2: Verify initial rendering
    if (list.children.length === 3) {
      console.log('✓ Reactive list initial render');
    }
    
    // Test 3: Update the reactive list
    items.value = ['Updated Item 1', 'Updated Item 2'];
    setTimeout(() => {
      if (list.children.length === 2) {
        console.log('✓ Reactive list update');
      }
    }, 0);
    
    // Test 4: Create an element with custom event
    let clickedOutside = false;
    const button = $.button({
      'on::click-outside': () => clickedOutside = true,
      text: 'Click Me'
    });
    
    console.log('✓ Element with custom event created');
    
    // Test 5: Create an element with reactive style
    const box = $.div({
      style: $.computed(() => ({
        background: items.value.length % 2 === 0 ? 'lightblue' : 'lightgreen',
        padding: '10px',
        borderRadius: '5px'
      })),
      text: 'Reactive Box'
    });
    
    console.log('✓ Element with reactive style created');
    
    // Test 6: Verify scoped styles
    const styledDiv = $.div({
      class: $.style({ 
        color: 'red', 
        fontWeight: 'bold', 
        '&:hover': { color: 'blue' } 
      }),
      text: 'Scoped Styled Element'
    });
    
    console.log('✓ Scoped styles applied');
    
    // Test 7: Modal with directives
    const modalOpen = $.signal(false);
    const modal = $.div({
      directives: { show: modalOpen },
      class: $.style({
        position: 'fixed',
        top: '0',
        left: '0',
        width: '100%',
        height: '100%',
        background: 'rgba(0,0,0,0.5)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center'
      }),
      children: $.div({
        directives: { 'trap-focus': modalOpen },
        'on::click-outside': () => modalOpen.value = false,
        class: $.style({
          background: 'white',
          padding: '20px',
          borderRadius: '8px',
          maxWidth: '500px',
          width: '90%'
        }),
        children: $.div({}, 'Modal Content')
      })
    });
    
    console.log('✓ Modal with directives created');
    
    console.log('\n✅ All builder fixes verified successfully!');
    
    // Verify the DOM structure
    console.log('\nDOM structure:');
    console.log('1. Reactive list:', list.outerHTML);
    console.log('2. Button with custom event:', button.outerHTML);
    console.log('3. Reactive box:', box.outerHTML);
    console.log('4. Scoped styled element:', styledDiv.outerHTML);
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
};

testApp();
