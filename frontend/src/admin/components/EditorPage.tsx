import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { Link, useBlocker } from 'react-router-dom';
import { errorMessage, type Errors } from '../lib/utils';
import { ConfirmDialog, LoadState, useToast } from './feedback';

export type Setter<T> = <K extends keyof T>(key: K, value: T[K]) => void;

interface EditorPageProps<T> {
  /** Меняется — форма загружается заново (например, id записи). */
  resourceKey: string;
  eyebrow: string;
  title: (draft: T) => string;
  backTo?: { to: string; label: string };
  load: () => Promise<T>;
  save: (draft: T) => Promise<T>;
  validate: (draft: T) => Errors;
  onSaved?: (saved: T) => void;
  onDelete?: () => Promise<void>;
  deleteLabel?: string;
  /** Ссылка «Открыть на сайте». */
  viewUrl?: (draft: T) => string | null;
  children: (ctx: { draft: T; set: Setter<T>; errors: Errors }) => ReactNode;
}

/**
 * Общая логика формы: загрузка, сохранение, проверка полей, удаление
 * и защита от потери несохранённых изменений.
 */
export function EditorPage<T>(props: EditorPageProps<T>) {
  const { resourceKey, load, save, validate, onSaved, onDelete } = props;
  const toast = useToast();
  const [draft, setDraft] = useState<T | null>(null);
  const [original, setOriginal] = useState('');
  const [loadError, setLoadError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const leaving = useRef(false);

  // Загрузка данных формы
  useEffect(() => {
    let cancelled = false;
    setDraft(null);
    setLoadError(null);
    setSubmitted(false);
    load()
      .then((data) => {
        if (cancelled) return;
        setDraft(data);
        setOriginal(JSON.stringify(data));
      })
      .catch((err) => !cancelled && setLoadError(errorMessage(err)));
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resourceKey, attempt]);

  const dirty = draft !== null && JSON.stringify(draft) !== original;
  const errors = useMemo(() => (submitted && draft ? validate(draft) : {}), [submitted, draft, validate]);

  const set: Setter<T> = useCallback((key, value) => {
    leaving.current = false;
    setDraft((d) => (d ? { ...d, [key]: value } : d));
  }, []);

  // Предупреждение при уходе со страницы с несохранёнными изменениями
  const blocker = useBlocker(
    ({ currentLocation, nextLocation }) => dirty && !leaving.current && currentLocation.pathname !== nextLocation.pathname,
  );

  useEffect(() => {
    if (!dirty) return;
    const onBeforeUnload = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener('beforeunload', onBeforeUnload);
    return () => window.removeEventListener('beforeunload', onBeforeUnload);
  }, [dirty]);

  const handleSave = useCallback(async () => {
    if (!draft || saving) return;
    setSubmitted(true);
    const found = validate(draft);
    if (Object.keys(found).length > 0) {
      toast('error', `Проверьте поля формы (${Object.keys(found).length})`);
      requestAnimationFrame(() => document.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus());
      return;
    }
    setSaving(true);
    try {
      const saved = await save(draft);
      setDraft(saved);
      setOriginal(JSON.stringify(saved));
      setSubmitted(false);
      leaving.current = true;
      toast('success', 'Сохранено');
      onSaved?.(saved);
    } catch (err) {
      toast('error', errorMessage(err));
    } finally {
      setSaving(false);
    }
  }, [draft, saving, validate, save, toast, onSaved]);

  // Cmd/Ctrl + S
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 's') {
        e.preventDefault();
        void handleSave();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [handleSave]);

  const handleDelete = async () => {
    if (!onDelete) return;
    setDeleting(true);
    try {
      leaving.current = true;
      await onDelete();
      toast('success', 'Удалено');
    } catch (err) {
      leaving.current = false;
      toast('error', errorMessage(err));
      setDeleting(false);
      setConfirmDelete(false);
    }
  };

  const revert = () => {
    setDraft(JSON.parse(original) as T);
    setSubmitted(false);
  };

  if (!draft) {
    return (
      <div className="adm-page">
        {props.backTo && (
          <Link to={props.backTo.to} className="adm-back">
            ← {props.backTo.label}
          </Link>
        )}
        <LoadState loading={!loadError} error={loadError} onRetry={() => setAttempt((n) => n + 1)} />
      </div>
    );
  }

  const viewUrl = props.viewUrl?.(draft);

  return (
    <div className="adm-page">
      {props.backTo && (
        <Link to={props.backTo.to} className="adm-back">
          ← {props.backTo.label}
        </Link>
      )}
      <header className="adm-head">
        <div>
          <p className="adm-eyebrow">{props.eyebrow}</p>
          <h1 className="adm-title">{props.title(draft) || 'Без названия'}</h1>
        </div>
        {viewUrl && !dirty && (
          <a href={viewUrl} target="_blank" rel="noopener noreferrer" className="btn btn--sm">
            Открыть на сайте ↗
          </a>
        )}
      </header>

      <form
        className="adm-form"
        noValidate
        onSubmit={(e) => {
          e.preventDefault();
          void handleSave();
        }}
      >
        {props.children({ draft, set, errors })}

        <div className="adm-savebar">
          <p className={`adm-savebar__status${dirty ? ' is-dirty' : ''}`} aria-live="polite">
            {dirty ? 'Есть несохранённые изменения' : 'Все изменения сохранены'}
          </p>
          <div className="adm-savebar__actions">
            {onDelete && (
              <button type="button" className="btn btn--danger-outline" onClick={() => setConfirmDelete(true)}>
                {props.deleteLabel ?? 'Удалить'}
              </button>
            )}
            {dirty && (
              <button type="button" className="btn" onClick={revert}>
                Отменить изменения
              </button>
            )}
            <button type="submit" className="btn btn--ink" disabled={saving || !dirty}>
              {saving ? 'Сохранение…' : 'Сохранить'}
            </button>
          </div>
        </div>
      </form>

      <ConfirmDialog
        open={confirmDelete}
        title={`${props.deleteLabel ?? 'Удалить'}?`}
        message={<p>«{props.title(draft)}» будет удалено с сайта. Это действие нельзя отменить.</p>}
        confirmLabel="Удалить"
        danger
        busy={deleting}
        onConfirm={handleDelete}
        onCancel={() => setConfirmDelete(false)}
      />

      <ConfirmDialog
        open={blocker.state === 'blocked'}
        title="Уйти без сохранения?"
        message={<p>Изменения на этой странице не сохранены и будут потеряны.</p>}
        confirmLabel="Уйти"
        cancelLabel="Остаться"
        danger
        onConfirm={() => blocker.proceed?.()}
        onCancel={() => blocker.reset?.()}
      />
    </div>
  );
}
