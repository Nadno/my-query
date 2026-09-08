import $ from 'mini-q';
import { $when, $match, $else } from 'mini-q';
import { isAuthenticated, screen } from './composables/useAuth';
import { ToastHost } from './ui/ToastHost';
import { app } from './ui/theme';
import { Login } from './screens/Login';
import { Register } from './screens/Register';
import { Dashboard } from './screens/Dashboard';

export function App() {
  return $.div(
    { class: app },
    ToastHost(),
    // Condicional flat: cada condição é rastreada; cada view é construída
    // destrastreada (como no `$when`). 1ª condição verdadeira vence.
    $match(
      [isAuthenticated, Dashboard],
      [() => screen.value === 'register', Register],
      [$else, Login],
    ),
  );
}
