import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { adminApi, type AdminUser } from '../api/adminApi';
import { session } from './session';

interface AuthValue {
  user: AdminUser | null;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthValue | null>(null);

const currentUser = (): AdminUser | null => {
  const s = session.get();
  return s ? { username: s.username } : null;
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AdminUser | null>(currentUser);

  // Любое изменение сессии (вход, выход, 401 от API, истечение) обновляет состояние.
  useEffect(() => session.subscribe(() => setUser(currentUser())), []);

  // Проверяем сохранённый токен на сервере при открытии админки.
  useEffect(() => {
    if (session.get()) adminApi.me().catch(() => session.clear('unauthorized'));
  }, []);

  // Автоматический выход, когда токен истекает.
  useEffect(() => {
    const s = session.get();
    if (!s) return;
    const timer = window.setTimeout(() => session.clear('expired'), Math.max(0, s.expiresAt - Date.now()));
    return () => window.clearTimeout(timer);
  }, [user]);

  const login = useCallback(async (username: string, password: string) => {
    await adminApi.login(username, password);
  }, []);

  const logout = useCallback(() => adminApi.logout(), []);

  const value = useMemo(() => ({ user, login, logout }), [user, login, logout]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}

/** Пускает дальше только вошедшего администратора, остальных отправляет на вход. */
export function RequireAuth() {
  const { user } = useAuth();
  const location = useLocation();
  if (!user) return <Navigate to="/admin/login" replace state={{ from: location.pathname }} />;
  return <Outlet />;
}
