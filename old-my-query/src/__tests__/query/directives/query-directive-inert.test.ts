import { beforeEach, describe, expect, it } from 'vitest';
import $ from '../../../main';
import { resetInertLevel } from '../../../mini-stack/query/directives/builtin/inert';

describe('MyQuery Directive - Inert', () => {
  beforeEach(() => {
    // Reset inert level before each test
    resetInertLevel();
    // Reset body overflow from previous tests
    document.body.style.overflow = '';
    
    document.body.innerHTML = `
      <div id="container">
        <button id="btn1">Button 1</button>
        <button id="btn2" tabindex="0">Button 2</button>
        <a id="link" href="#">Link</a>
        <input id="input" type="text" />
        <div id="div1">
          <button id="nested-btn">Nested Button</button>
        </div>
      </div>
    `;
  });

  describe('directive method', () => {
    it('should apply inert to container children, not to container itself', () => {
      const $el = $('#container');
      
      $el.directive('inert', true);
      
      // Container (body) should NOT have inert attribute
      expect(document.body.hasAttribute('inert')).toBe(false);
      
      // But children should have inert
      const btn1 = document.getElementById('btn1');
      expect(btn1?.inert).toBe(true);
    });

    it('should remove inert when deactivated (last layer)', () => {
      const $el = $('#container');
      
      $el.directive('inert', true);
      $el.directive('inert', false);
      
      // Children should not have inert after last layer is removed
      const btn1 = document.getElementById('btn1');
      expect(btn1?.inert).toBe(false);
    });

    it('should lock body scroll when activated', () => {
      const $el = $('#container');
      
      $el.directive('inert', true);
      
      expect(document.body.style.overflow).toBe('hidden');
    });

    it('should unlock body scroll when last layer is deactivated', () => {
      const $el = $('#container');
      
      $el.directive('inert', true);
      $el.directive('inert', false);
      
      expect(document.body.style.overflow).toBe('');
    });
  });

  describe('multiple layers', () => {
    it('should not remove inert when second layer is still active', () => {
      const $el1 = $('#btn1');
      const $el2 = $('#btn2');
      
      // First inert - apply to children of #container
      $el1.directive('inert', { active: true, container: '#container' });
      
      // Check children have inert
      const btn2 = document.getElementById('btn2');
      expect(btn2?.inert).toBe(true);
      
      // Second inert
      $el2.directive('inert', { active: true, container: '#container' });
      
      // Remove first - should still be active
      $el1.directive('inert', { active: false });
      expect(btn2?.inert).toBe(true);
      
      // Remove second - should be removed
      $el2.directive('inert', { active: false });
      expect(btn2?.inert).toBe(false);
    });

    it('should maintain scroll lock until last layer is removed', () => {
      const $el1 = $('#btn1');
      const $el2 = $('#btn2');
      
      $el1.directive('inert', { active: true, lockScroll: true });
      expect(document.body.style.overflow).toBe('hidden');
      
      $el2.directive('inert', { active: true, lockScroll: true });
      
      $el1.directive('inert', { active: false });
      // Scroll should still be locked
      expect(document.body.style.overflow).toBe('hidden');
      
      $el2.directive('inert', { active: false });
      // Scroll should be unlocked
      expect(document.body.style.overflow).toBe('');
    });
  });

  describe('options', () => {
    it('should apply inert to children of specified container', () => {
      const $el = $('#div1');
      
      $el.directive('inert', { active: true, container: '#div1' });
      
      // Container should NOT have inert
      const div1 = document.getElementById('div1');
      expect(div1?.hasAttribute('inert')).toBe(false);
      
      // But nested child should have inert
      const nestedBtn = document.getElementById('nested-btn');
      expect(nestedBtn?.inert).toBe(true);
    });

    it('should accept lockScroll option', () => {
      const $el = $('#container');
      
      $el.directive('inert', { active: true, lockScroll: false });
      
      // Body scroll should not be locked
      expect(document.body.style.overflow).toBe('');
    });
  });

  describe('events', () => {
    it('should emit inert:activate event with level', () => {
      const $el = $('#container');
      let eventFired = false;
      let eventDetail: any = null;
      
      $el.on('inert:activate' as any, (e: Event) => {
        eventFired = true;
        eventDetail = (e as CustomEvent).detail;
      });
      
      // Using native addEventListener since .on() has strict typing
      document.body.addEventListener('inert:activate', ((e: CustomEvent) => {
        eventFired = true;
        eventDetail = e.detail;
      }) as EventListener);
      
      $el.directive('inert', true);
      
      expect(eventFired).toBe(true);
      expect(eventDetail.level).toBe(1);
    });

    it('should emit inert:deactivate event with level', () => {
      const $el = $('#container');
      let eventFired = false;
      
      document.body.addEventListener('inert:deactivate', (() => {
        eventFired = true;
      }) as EventListener);
      
      $el.directive('inert', true);
      $el.directive('inert', false);
      
      expect(eventFired).toBe(true);
    });
  });

  describe('callbacks', () => {
    it('should call onActivate callback', () => {
      let activated = false;
      const $el = $('#container');
      
      $el.directive('inert', { 
        active: true, 
        onActivate: () => { activated = true; } 
      });
      
      expect(activated).toBe(true);
    });

    it('should call onDeactivate callback', () => {
      let deactivated = false;
      const $el = $('#container');
      
      $el.directive('inert', { 
        active: true 
      });
      $el.directive('inert', { 
        active: false,
        onDeactivate: () => { deactivated = true; } 
      });
      
      expect(deactivated).toBe(true);
    });
  });

  describe('registry', () => {
    it('should register inert directive and apply to children', () => {
      const $el = $('#container');
      $el.directive('inert', true);
      
      // Container should NOT have inert
      expect(document.body.hasAttribute('inert')).toBe(false);
      
      // But children should have inert
      const btn1 = document.getElementById('btn1');
      expect(btn1?.inert).toBe(true);
    });
  });
});
