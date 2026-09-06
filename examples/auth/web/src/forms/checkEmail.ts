import { send, ApiError } from '../api';
import { getAccessToken } from '../composables/useAuth';

export async function checkEmail(email: string): Promise<string | null> {
  const q = new URLSearchParams({ email });
  try {
    const data = await send<{ available: boolean; error?: string }>(
      `/email-available?${q.toString()}`,
      { token: getAccessToken() },
    );
    return data.available ? null : (data.error ?? 'E-mail já cadastrado');
  } catch (err) {
    if (err instanceof ApiError) return err.message;
    return 'Falha ao validar e-mail';
  }
}
