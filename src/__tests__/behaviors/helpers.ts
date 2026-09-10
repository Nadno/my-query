/** Helpers compartilhados da suíte de behaviors (não é coletado como teste). */

import { beforeAll } from 'vitest';
import { $useSignal } from '../../index';
import { preact } from '../../adapters/preact';

beforeAll(() => $useSignal(preact));

/** Cria um host montado no body e devolve o cleanup. */
export function setupHost(): { host: HTMLDivElement; cleanup: () => void } {
  const host = document.createElement('div');
  document.body.appendChild(host);
  return { host, cleanup: () => document.body.removeChild(host) };
}

/** Cria um alvo montado no body e devolve o cleanup. */
export function setupTarget(): { target: HTMLDivElement; cleanup: () => void } {
  const target = document.createElement('div');
  document.body.appendChild(target);
  return { target, cleanup: () => document.body.removeChild(target) };
}
