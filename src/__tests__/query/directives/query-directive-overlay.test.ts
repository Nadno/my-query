import { beforeEach, describe, expect, it } from 'vitest';
import $ from '../../../main';
import { resetInertLevel } from '../../../mini-stack/query/directives/builtin/inert';

describe('MyQuery Directive - Overlay', () => {
  beforeEach(() => {
    // Reset inert level counter before each test
    resetInertLevel();
    document.body.innerHTML = `
      <div id="container">
        <button id="outside">Outside Button</button>
        <div id="overlay" hidden aria-hidden="true">
          <button id="overlay-btn">Overlay Button</button>
        </div>
      </div>
    `;
  });

  const getOverlay = () => document.getElementById('overlay') as HTMLElement;
  const getOverlayBtn = () => document.getElementById('overlay-btn') as HTMLButtonElement;

  describe('directive method', () => {
    it('should create overlay element and move target to body when open is true', () => {
      const $el = $('#overlay');
      
      $el.directive('overlay', true);
      
      // Element should be moved to body
      expect(document.body.contains(getOverlay())).toBe(true);
      // Element should be visible
      expect(getOverlay().hasAttribute('hidden')).toBe(false);
      expect(getOverlay().getAttribute('aria-hidden')).toBe('false');
      // Overlay element should be created
      const overlayEl = document.querySelector('[data-overlay="true"]');
      expect(overlayEl).not.toBeNull();
      expect(overlayEl?.classList.contains('is-overlay-open')).toBe(true);
    });

    it('should remove overlay element when open is false', () => {
      const $el = $('#overlay');
      
      $el.directive('overlay', true);
      $el.directive('overlay', false);
      
      // Element should be hidden
      expect(getOverlay().style.display).toBe('none');
      expect(getOverlay().getAttribute('aria-hidden')).toBe('true');
      // Overlay element should be removed
      const overlayEl = document.querySelector('[data-overlay="true"]');
      expect(overlayEl).toBeNull();
    });

    it('should add class to overlay element when opening', () => {
      const $el = $('#overlay');
      
      $el.directive('overlay', true);
      
      // Overlay element should have the class
      const overlayEl = document.querySelector('[data-overlay="true"]');
      expect(overlayEl?.classList.contains('is-overlay-open')).toBe(true);
    });

    it('should add custom class when specified', () => {
      const $el = $('#overlay');
      
      $el.directive('overlay', { open: true, className: 'custom-overlay' });
      
      // Overlay element should have custom class
      const overlayEl = document.querySelector('[data-overlay="true"]');
      expect(overlayEl?.classList.contains('custom-overlay')).toBe(true);
    });

    it('should apply inert to children but NOT to target element or body', () => {
      const $el = $('#overlay');
      
      $el.directive('overlay', true);
      
      // Body should NOT have inert (we apply to children, not container)
      expect(document.body.inert).toBe(false);
      
      // Target element should NOT have inert
      expect(getOverlay().inert).toBe(false);
      
      // Other elements in container should be inert
      const outsideBtn = document.getElementById('outside');
      expect(outsideBtn?.inert).toBe(true);
    });

    it('should apply inert to children, not to container', () => {
      const $el = $('#overlay');
      
      $el.directive('overlay', true);
      
      // Container (body) should NOT have inert
      expect(document.body.inert).toBe(false);
      
      // Other elements should have inert
      const outsideBtn = document.getElementById('outside');
      expect(outsideBtn?.inert).toBe(true);
    });

    it('should use custom container when specified', () => {
      document.body.innerHTML = `
        <div id="container">
          <button id="outside">Outside Button</button>
          <div id="modal-container"></div>
          <div id="overlay">
            <button id="overlay-btn">Overlay Button</button>
          </div>
        </div>
      `;
      
      const $el = $('#overlay');
      $el.directive('overlay', { open: true, container: '#modal-container' });
      
      // Element should be in the custom container
      const container = document.getElementById('modal-container');
      expect(container?.contains(getOverlay())).toBe(true);
    });

    it('should emit overlay:open event', () => {
      const $el = $('#overlay');
      let eventFired = false;
      let eventDetail: any = null;
      
      getOverlay().addEventListener('overlay:open', ((e: CustomEvent) => {
        eventFired = true;
        eventDetail = e.detail;
      }) as EventListener);
      
      $el.directive('overlay', true);
      
      expect(eventFired).toBe(true);
      expect(eventDetail.element).toBe(getOverlay());
      expect(eventDetail.level).toBe(1);
    });

    it('should emit overlay:close event', () => {
      const $el = $('#overlay');
      let eventFired = false;
      
      getOverlay().addEventListener('overlay:close', (() => {
        eventFired = true;
      }) as EventListener);
      
      $el.directive('overlay', true);
      $el.directive('overlay', false);
      
      expect(eventFired).toBe(true);
    });
  });

  describe('focus management', () => {
    it('should focus overlay or first focusable element when opening', () => {
      const $el = $('#overlay');
      
      $el.directive('overlay', true);
      
      expect(document.activeElement).toBe(getOverlayBtn());
    });
  });

  describe('multilayered overlays', () => {
    it('should increment z-index level for each new overlay', () => {
      const $el1 = $('#overlay');
      const $el2 = $('#outside');
      
      $el1.directive('overlay', true);
      
      const overlayEl1 = document.querySelector('[data-overlay="true"]') as HTMLElement;
      const level1 = overlayEl1?.getAttribute('data-level');
      
      // Create another overlay
      $el2.directive('overlay', { open: true });
      
      const overlayEl2 = document.querySelectorAll('[data-overlay="true"]')[1] as HTMLElement;
      const level2 = overlayEl2?.getAttribute('data-level');
      
      expect(level1).toBe('1');
      expect(level2).toBe('2');
    });
  });

  describe('registry', () => {
    it('should register overlay directive', () => {
      const $el = $('#overlay');
      $el.directive('overlay', true);
      
      // Should work - element moved to body and visible
      expect(document.body.contains(getOverlay())).toBe(true);
      expect(getOverlay().hasAttribute('hidden')).toBe(false);
    });
  });
});
