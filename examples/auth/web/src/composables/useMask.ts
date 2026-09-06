import { bind, type Behavior } from 'mini-q';

export interface WritableSignal<T> {
  value: T;
}

export function maskCnpj(value: string): string {
  const v = value.replace(/\D/g, '').slice(0, 14);
  if (v.length <= 2) return v;
  if (v.length <= 5) return `${v.slice(0, 2)}.${v.slice(2)}`;
  if (v.length <= 8) return `${v.slice(0, 2)}.${v.slice(2, 5)}.${v.slice(5)}`;
  if (v.length <= 12) return `${v.slice(0, 2)}.${v.slice(2, 5)}.${v.slice(5, 8)}/${v.slice(8)}`;
  return `${v.slice(0, 2)}.${v.slice(2, 5)}.${v.slice(5, 8)}/${v.slice(8, 12)}-${v.slice(12)}`;
}

export function maskCpf(value: string): string {
  const v = value.replace(/\D/g, '').slice(0, 11);
  if (v.length <= 3) return v;
  if (v.length <= 6) return `${v.slice(0, 3)}.${v.slice(3)}`;
  if (v.length <= 9) return `${v.slice(0, 3)}.${v.slice(3, 6)}.${v.slice(6)}`;
  return `${v.slice(0, 3)}.${v.slice(3, 6)}.${v.slice(6, 9)}-${v.slice(9)}`;
}

export function maskPercent(value: string): string {
  let v = value.replace(/[^\d.,]/g, '').replace(',', '.');
  const parts = v.split('.');
  if (parts.length > 2) v = `${parts[0]}.${parts.slice(1).join('')}`;
  if (v === '' || v === '.') return v;
  const n = Number.parseFloat(v);
  if (!Number.isNaN(n) && n > 100) return '100';
  return v;
}

export function useMask(
  sig: WritableSignal<string>,
  mask: (raw: string) => string,
): Behavior<HTMLInputElement> {
  return (ctx) => {
    const el = ctx.element;
    bind(sig, (value) => {
      const next = value == null ? '' : String(value);
      if (el.value !== next) el.value = next;
    });
    const onInput = () => {
      sig.value = mask(el.value);
    };
    el.addEventListener('input', onInput);
    return () => el.removeEventListener('input', onInput);
  };
}
