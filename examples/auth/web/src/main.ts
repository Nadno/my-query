import { $mount, $useSignal } from 'mini-q';
import { preact } from 'mini-q/adapters/preact';
import { App } from './App';
import './ui/theme';

$useSignal(preact);
$mount('#app', App);
