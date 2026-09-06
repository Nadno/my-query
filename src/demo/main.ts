/** Entry do demo: instala o adapter e monta o App. */
import $ from '../index';
import { preact } from '../adapters/preact';
import { App } from './pocketfin';

$.useSignal(preact);
$.mount('#app', App);
