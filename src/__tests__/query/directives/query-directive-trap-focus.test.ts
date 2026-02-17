import { beforeEach, describe, expect, it, vi } from 'vitest';
import $ from '../../../main';

describe('MyQuery Directive - Trap Focus', () => {
  beforeEach(() => {
    document.body.innerHTML = `
      <div id="container">
        <div id="trap" tabindex="-1">
          <button id="btn1">Button 1</button>
          <button id="btn2">Button 2</button>
          <button id="btn3">Button 3</button>
        </div>
      </div>
    `;
  });

  const getTrap = () => document.getElementById('trap') as HTMLElement;
  const getButton1 = () => document.getElementById('btn1') as HTMLButtonElement;
  const getButton3 = () => document.getElementById('btn3') as HTMLButtonElement;

  describe('directive method', () => {
    it('should attach keydown listener when active', () => {
      const $el = $('#trap');
      
      const addEventListenerSpy = vi.spyOn($el.element, 'addEventListener');
      
      $el.directive('trap-focus', true);
      
      expect(addEventListenerSpy).toHaveBeenCalledWith('keydown', expect.any(Function));
    });

    it('should trap Tab key at last element', () => {
      const $el = $('#trap');
      
      $el.directive('trap-focus', true);
      
      // Focus last button
      getButton3().focus();
      
      const event = new KeyboardEvent('keydown', { key: 'Tab', bubbles: true });
      const preventDefaultSpy = vi.spyOn(event, 'preventDefault');
      
      document.activeElement?.dispatchEvent(event);
      
      // Should prevent default and focus first element
      expect(preventDefaultSpy).toHaveBeenCalled();
      expect(document.activeElement).toBe(getButton1());
    });

    it('should trap Shift+Tab key at first element', () => {
      const $el = $('#trap');
      
      $el.directive('trap-focus', true);
      
      // Focus first button
      getButton1().focus();
      
      const event = new KeyboardEvent('keydown', { key: 'Tab', shiftKey: true, bubbles: true });
      const preventDefaultSpy = vi.spyOn(event, 'preventDefault');
      
      document.activeElement?.dispatchEvent(event);
      
      // Should prevent default and focus last element
      expect(preventDefaultSpy).toHaveBeenCalled();
      expect(document.activeElement).toBe(getButton3());
    });
  });

  describe('registry', () => {
    it('should register trap-focus directive', () => {
      // Verify directive can be used - this only works if it's registered
      const $el = $('#trap');
      $el.directive('trap-focus', false); // Should not throw if registered
    });
  });
});
