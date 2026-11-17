import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';

/* ---------- Уведомления ---------- */

type ToastKind = 'success' | 'error';
interface Toast {
  id: number;
  kind: ToastKind;
  text: string;
}

const ToastContext = createContext<(kind: ToastKind, text: string) => void>(() => {});

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const nextId = useRef(1);

  const push = useCallback((kind: ToastKind, text: string) => {
    const id = nextId.current++;
    setToasts((list) => [...list, { id, kind, text }]);
    window.setTimeout(() => setToasts((list) => list.filter((t) => t.id !== id)), kind === 'error' ? 6000 : 3500);
  }, []);

  return (
    <ToastContext.Provider value={push}>
      {children}
      <div className="adm-toasts" aria-live="polite">
        {toasts.map((t) => (
          <div key={t.id} className={`adm-toast adm-toast--${t.kind}`} role={t.kind === 'error' ? 'alert' : 'status'}>
            {t.text}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export const useToast = () => useContext(ToastContext);

/* ---------- Подтверждение ---------- */

interface ConfirmProps {
  open: boolean;
  title: string;
  message?: ReactNode;
  confirmLabel: string;
  cancelLabel?: string;
  danger?: boolean;
  busy?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({ open, title, message, confirmLabel, cancelLabel = 'Отмена', danger, busy, onConfirm, onCancel }: ConfirmProps) {
  const cancelRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    const lastFocused = document.activeElement as HTMLElement | null;
    cancelRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCancel();
    };
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('keydown', onKey);
      lastFocused?.focus();
    };
  }, [open, onCancel]);

  if (!open) return null;

  return createPortal(
    <div className="adm-dialog-backdrop" onMouseDown={(e) => e.target === e.currentTarget && onCancel()}>
      <div className="adm-dialog" role="alertdialog" aria-modal="true" aria-labelledby="adm-dialog-title">
        <h2 id="adm-dialog-title" className="adm-dialog__title">
          {title}
        </h2>
        {message && <div className="adm-dialog__message">{message}</div>}
        <div className="adm-dialog__actions">
          <button ref={cancelRef} type="button" className="btn" onClick={onCancel} disabled={busy}>
            {cancelLabel}
          </button>
          <button type="button" className={`btn ${danger ? 'btn--danger' : 'btn--ink'}`} onClick={onConfirm} disabled={busy}>
            {busy ? 'Подождите…' : confirmLabel}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}

export function LoadState({ loading, error, onRetry }: { loading: boolean; error: string | null; onRetry?: () => void }) {
  if (error) {
    return (
      <div className="adm-state adm-state--error" role="alert">
        <p>{error}</p>
        {onRetry && (
          <button type="button" className="btn btn--sm" onClick={onRetry}>
            Повторить
          </button>
        )}
      </div>
    );
  }
  if (loading) return <p className="adm-state">Загрузка…</p>;
  return null;
}
