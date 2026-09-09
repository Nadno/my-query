import { computed } from '@preact/signals-core';
import { config, media } from 'mini-q/style';

config({
  breakpoints: {
    mobile: 0,
    tablet: 600,
    desktop: 900,
  },
});

export const isMobile = media('mobile');
export const isTablet = media('tablet');
export const isDesktop = media('desktop');

export const breakpoint = computed(() => {
  if (isDesktop.value) return 'desktop' as const;
  if (isTablet.value) return 'tablet' as const;
  return 'mobile' as const;
});
