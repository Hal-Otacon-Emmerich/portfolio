import { useState, type FormEvent } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { adminApi, MOCK_LOGIN_ALLOWED } from '../api/adminApi';
import { useAuth } from '../auth/AuthProvider';
import { session, type LogoutReason } from '../auth/session';
import { Input } from '../components/fields';
import { errorMessage } from '../lib/utils';

const REASON_TEXT: Record<LogoutReason, string | null> = {
  expired: 'Сессия истекла. Войдите снова.',
  unauthorized: 'Нужно войти заново.',
  manual: null,
};

export function LoginPage() {
  const { user, login } = useAuth();
  const location = useLocation();
  const from = (location.state as { from?: string } | null)?.from ?? '/admin';

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [notice] = useState(() => {
    const reason = session.lastReason();
    return reason ? REASON_TEXT[reason] : null;
  });

  if (user) return <Navigate to={from.startsWith('/admin') ? from : '/admin'} replace />;

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password) {
      setError('Введите логин и пароль');
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      await login(username.trim(), password);
    } catch (err) {
      setError(errorMessage(err));
      setPassword('');
    } finally {
      setSubmitting(false);
    }
  };

  const mockUnavailable = adminApi.isMock && !MOCK_LOGIN_ALLOWED;

  return (
    <div className="adm-login">
      <form className="adm-login__card" onSubmit={onSubmit} noValidate>
        <div className="adm-login__bar">
          <span>DEV-01 / Admin</span>
          <span>Restricted</span>
        </div>
        <div className="adm-login__body">
          <h1 className="adm-title">Вход</h1>
          <p className="adm-lead">Панель управления содержимым портфолио.</p>

          {notice && <p className="adm-login__notice">{notice}</p>}

          <Input label="Логин" value={username} onChange={setUsername} autoComplete="username" required />
          <Input label="Пароль" value={password} onChange={setPassword} type="password" autoComplete="current-password" required />

          {error && (
            <p className="af-error" role="alert">
              {error}
            </p>
          )}

          <button type="submit" className="btn btn--ink btn--lg adm-login__submit" disabled={submitting || mockUnavailable}>
            {submitting ? 'Проверка…' : 'Войти →'}
          </button>

          {adminApi.isMock && MOCK_LOGIN_ALLOWED && (
            <p className="af-hint">
              Режим без бэкенда (только dev). Логин и пароль задаются в <code>.env.local</code> переменными{' '}
              <code>VITE_ADMIN_MOCK_USER</code> / <code>VITE_ADMIN_MOCK_PASSWORD</code>, по умолчанию admin / admin.
            </p>
          )}
          {mockUnavailable && (
            <p className="af-error">Вход без бэкенда отключён в продакшн-сборке. Подключите FastAPI.</p>
          )}
        </div>
      </form>
    </div>
  );
}
