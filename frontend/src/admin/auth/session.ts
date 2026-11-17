/**
 * Хранение сессии администратора.
 * sessionStorage, а не localStorage: токен пропадает при закрытии вкладки,
 * и его нельзя прочитать из других вкладок/окон.
 */

export interface Session {
  token: string;
  username: string;
  /** Unix-время в мс, когда токен перестаёт действовать. */
  expiresAt: number;
}

export type LogoutReason = 'expired' | 'unauthorized' | 'manual';

const KEY = 'portfolio.admin.session';
const listeners = new Set<() => void>();
let lastReason: LogoutReason | null = null;

function read(): Session | null {
  try {
    const raw = sessionStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as Session) : null;
  } catch {
    return null;
  }
}

const notify = () => listeners.forEach((fn) => fn());

export const session = {
  get(): Session | null {
    const current = read();
    if (current && current.expiresAt <= Date.now()) {
      session.clear('expired');
      return null;
    }
    return current;
  },

  set(next: Session) {
    lastReason = null;
    sessionStorage.setItem(KEY, JSON.stringify(next));
    notify();
  },

  clear(reason: LogoutReason = 'manual') {
    if (!read()) return;
    lastReason = reason;
    sessionStorage.removeItem(KEY);
    notify();
  },

  /** Причина последнего выхода — для сообщения на странице входа. Сбрасывается при следующем входе. */
  lastReason(): LogoutReason | null {
    return lastReason;
  },

  subscribe(fn: () => void) {
    listeners.add(fn);
    return () => {
      listeners.delete(fn);
    };
  },
};
