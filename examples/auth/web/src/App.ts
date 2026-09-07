import $ from 'mini-q';
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
    $.when(
      isAuthenticated,
      () => Dashboard(),
      () => (screen.value === 'register' ? Register() : Login()),
    ),
  );
}
