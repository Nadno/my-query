import $ from 'mini-q';
import { $when, $match, $else } from 'mini-q';
import { initSession, isAuthenticated, screen, sessionLoading } from './composables/useAuth';
import { Spinner } from './ui/Spinner';
import { ToastHost } from './ui/ToastHost';
import { sApp, sCard } from './ui/shell.style';
import { Login } from './screens/Login';
import { Register } from './screens/Register';
import { Dashboard } from './screens/Dashboard';

// Tenta restaurar a sessão via cookie de refresh antes de montar a UI.
await initSession();

export function App() {
  return $.div(
    { class: sApp },
    ToastHost(),
    $when(
      () => sessionLoading.value,
      () =>
        $.div(
          { class: sCard },
          $.p(
            { style: 'display:flex;align-items:center;gap:var(--space-md)' },
            [Spinner, {}],
            'Restaurando sessão…',
          ),
        ),
      () =>
        $match(
          [isAuthenticated, Dashboard],
          [() => screen.value === 'register', Register],
          [$else, Login],
        ),
    ),
  );
}
