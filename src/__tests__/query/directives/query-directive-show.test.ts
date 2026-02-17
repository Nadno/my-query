import { beforeEach, describe, expect, it } from 'vitest';
import $ from '../../../main';

describe('MyQuery Directive - Show', () => {
  beforeEach(() => {
    document.body.innerHTML = `
      <div id="container">
        <div id="target" style="display: block;">Content</div>
      </div>
    `;
  });

  const getTarget = () => document.getElementById('target') as HTMLElement;

  describe('directive method', () => {
    it('should show element when value is true', () => {
      const $el = $('#target');
      
      $el.directive('show', true);
      
      // When showing, it should restore to empty (browser default)
      expect(getTarget().style.display).not.toBe('none');
    });

    it('should hide element when value is false', () => {
      const $el = $('#target');
      
      $el.directive('show', false);
      
      expect(getTarget().style.display).toBe('none');
    });

    it('should toggle visibility based on boolean value', () => {
      const $el = $('#target');
      
      // Hide
      $el.directive('show', false);
      expect(getTarget().style.display).toBe('none');
      
      // Show
      $el.directive('show', true);
      expect(getTarget().style.display).not.toBe('none');
    });

    it('should preserve previous display value when hiding', () => {
      const $el = $('#target');
      getTarget().style.display = 'flex';
      
      $el.directive('show', false);
      expect(getTarget().style.display).toBe('none');
      
      $el.directive('show', true);
      expect(getTarget().style.display).toBe('flex');
    });
  });

  describe('registry', () => {
    it('should register show directive', () => {
      // Just verify the directive can be used - if it works, it was registered
      const $el = $('#target');
      $el.directive('show', false);
      expect(getTarget().style.display).toBe('none');
    });
  });
});
