import './setup';
import './ui/global.style';
import './ui/shell.style';
import './ui/media';
import { $mount } from 'mini-q';
import { App } from './App';

$mount('#app', App);
