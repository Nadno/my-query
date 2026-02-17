import { describe, it, expect, vi } from 'vitest';
import $ from '../../main';
import { style } from '../../mini-stack/query/style';

describe('Element Builder', () => {
  describe('Basic Usage', () => {
    it('should create simple elements with text content', () => {
      const div = $.div('Hello World');
      expect(div.tagName).toBe('DIV');
      expect(div.textContent).toBe('Hello World');
    });

    it('should create elements with properties', () => {
      const input = $.input({ type: 'text', value: 'test' });
      expect(input.tagName).toBe('INPUT');
      expect(input.type).toBe('text');
      expect(input.value).toBe('test');
    });

    it('should create elements with children', () => {
      const span = $.span('Span Content');
      const div = $.div(span);

      expect(div.tagName).toBe('DIV');
      expect(div.children.length).toBe(1);
      expect(div.firstChild?.textContent).toBe('Span Content');
    });

    it('should create elements with multiple children', () => {
      const div = $.div($.span('First'), ' ', $.span('Second'));

      expect(div.tagName).toBe('DIV');
      expect(div.children.length).toBe(2);
      expect(div.textContent).toBe('First Second');
    });
  });

  describe('Style System', () => {
    it('should generate scoped class names', () => {
      const style1 = style({ color: 'red' });
      const style2 = style({ color: 'blue' });

      expect(typeof style1).toBe('string');
      expect(typeof style2).toBe('string');
      expect(style1).not.toBe(style2);
      expect(style1.startsWith('mq-')).toBe(true);
    });

    it('should reuse class names for identical styles', () => {
      const style1 = style({ color: 'red' });
      const style2 = style({ color: 'red' });

      expect(style1).toBe(style2);
    });

    it('should apply classes to elements', () => {
      const className = style({ color: 'red' });
      const div = $.div({ class: className });

      expect(div.classList.contains(className)).toBe(true);
    });
  });

  describe('Scoped Setup (Island Pattern)', () => {
    it('should execute setup function and return element', () => {
      let setupCalled = false;

      const div = $.div((self: any) => {
        setupCalled = true;
        expect(self.element.tagName).toBe('DIV');
        return ['Test Content'];
      });

      expect(setupCalled).toBe(true);
      expect(div.tagName).toBe('DIV');
      expect(div.textContent).toBe('Test Content');
    });

    it('should allow modifying element in setup', () => {
      const div = $.div((self: any) => {
        self.classlist.add('custom-class');
        return ['Test'];
      });

      expect(div.classList.contains('custom-class')).toBe(true);
    });
  });

  describe('Events', () => {
    it('should attach event listeners', () => {
      const handleClick = vi.fn();
      const button = $.button({ onclick: handleClick }, 'Click Me');

      button.click();

      expect(handleClick).toHaveBeenCalled();
    });
  });

  describe('Attributes and Properties', () => {
    it('should handle boolean attributes', () => {
      const input = $.input({ disabled: true });
      expect(input.disabled).toBe(true);
    });

    it('should handle data attributes', () => {
      const div = $.div({ 'data-test': 'value' });
      expect(div.getAttribute('data-test')).toBe('value');
    });

    it('should handle style property as string', () => {
      const div = $.div({ style: 'color: red; font-size: 14px' });
      expect(div.getAttribute('style')).toBe('color: red; font-size: 14px');
    });

    it('should handle style property as object', () => {
      const div = $.div({ style: { color: 'red', fontSize: '14px' } });
      expect(div.style.color).toBe('red');
      expect(div.style.fontSize).toBe('14px');
    });
  });
});

