import { beforeEach, describe, expect, it } from 'vitest';
import $ from '../../../main';

describe('MyQuery Directive - Roving Index', () => {
  beforeEach(() => {
    document.body.innerHTML = `
      <div id="container">
        <div id="roving" role="listbox">
          <div id="item0" role="option" tabindex="-1">Item 0</div>
          <div id="item1" role="option" tabindex="-1">Item 1</div>
          <div id="item2" role="option" tabindex="-1">Item 2</div>
        </div>
      </div>
    `;
  });

  const getItem0 = () => document.getElementById('item0') as HTMLElement;
  const getItem1 = () => document.getElementById('item1') as HTMLElement;
  const getItem2 = () => document.getElementById('item2') as HTMLElement;

  describe('directive method', () => {
    it('should set initial index tabindex to 0', () => {
      const $el = $('#roving');
      
      $el.directive('roving-index', 0);
      
      expect(getItem0().getAttribute('tabindex')).toBe('0');
      expect(getItem1().getAttribute('tabindex')).toBe('-1');
      expect(getItem2().getAttribute('tabindex')).toBe('-1');
    });

    it('should change active index', () => {
      const $el = $('#roving');
      
      $el.directive('roving-index', 0);
      expect(getItem0().getAttribute('tabindex')).toBe('0');
      
      $el.directive('roving-index', 2);
      expect(getItem0().getAttribute('tabindex')).toBe('-1');
      expect(getItem2().getAttribute('tabindex')).toBe('0');
    });

    it('should handle navigation with ArrowRight', () => {
      const $el = $('#roving');
      
      $el.directive('roving-index', { index: 0, direction: 'horizontal' });
      
      // Focus first item
      getItem0().focus();
      
      const event = new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true });
      document.activeElement?.dispatchEvent(event);
      
      expect(document.activeElement).toBe(getItem1());
    });

    it('should loop navigation forward', () => {
      const $el = $('#roving');
      
      $el.directive('roving-index', { index: 2, direction: 'horizontal', loop: true });
      
      // Focus last item
      getItem2().focus();
      
      const event = new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true });
      document.activeElement?.dispatchEvent(event);
      
      expect(document.activeElement).toBe(getItem0());
    });
  });

  describe('vertical direction', () => {
    it('should handle ArrowDown key', () => {
      const $el = $('#roving');
      
      $el.directive('roving-index', { index: 0, direction: 'vertical' });
      
      getItem0().focus();
      
      const event = new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true });
      document.activeElement?.dispatchEvent(event);
      
      expect(document.activeElement).toBe(getItem1());
    });
  });

  describe('registry', () => {
    it('should register roving-index directive', () => {
      const $el = $('#roving');
      $el.directive('roving-index', 0);
      
      expect(getItem0().getAttribute('tabindex')).toBe('0');
    });
  });
});
