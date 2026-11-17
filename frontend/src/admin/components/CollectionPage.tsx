import { useCallback, useEffect, useState, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import type { CollectionApi } from '../api/adminApi';
import { errorMessage, moveItem } from '../lib/utils';
import { ConfirmDialog, LoadState, useToast } from './feedback';

export interface Column<T> {
  label: string;
  render: (item: T) => ReactNode;
  className?: string;
}

interface CollectionPageProps<T> {
  title: string;
  description?: ReactNode;
  api: CollectionApi<T>;
  idOf: (item: T) => string;
  nameOf: (item: T) => string;
  basePath: string;
  columns: Column<T>[];
  newLabel: string;
  emptyText: string;
}

/** Список записей: порядок (он же порядок на сайте), переход к редактированию, удаление. */
export function CollectionPage<T>({ title, description, api, idOf, nameOf, basePath, columns, newLabel, emptyText }: CollectionPageProps<T>) {
  const toast = useToast();
  const [items, setItems] = useState<T[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [toDelete, setToDelete] = useState<T | null>(null);
  const [busy, setBusy] = useState(false);

  const load = useCallback(() => {
    setError(null);
    api.list().then(setItems, (err) => setError(errorMessage(err)));
  }, [api]);

  useEffect(load, [load]);

  const move = async (from: number, to: number) => {
    if (!items) return;
    const previous = items;
    const next = moveItem(items, from, to);
    setItems(next); // сразу показываем новый порядок, при ошибке откатываем
    try {
      await api.reorder(next.map(idOf));
    } catch (err) {
      setItems(previous);
      toast('error', errorMessage(err));
    }
  };

  const remove = async () => {
    if (!toDelete) return;
    setBusy(true);
    try {
      await api.remove(idOf(toDelete));
      setItems((list) => list?.filter((i) => idOf(i) !== idOf(toDelete)) ?? null);
      toast('success', `«${nameOf(toDelete)}» удалено`);
      setToDelete(null);
    } catch (err) {
      toast('error', errorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="adm-page">
      <header className="adm-head">
        <div>
          <p className="adm-eyebrow">Раздел сайта</p>
          <h1 className="adm-title">{title}</h1>
          {description && <p className="adm-lead">{description}</p>}
        </div>
        <Link to={`${basePath}/new`} className="btn btn--ink">
          + {newLabel}
        </Link>
      </header>

      <LoadState loading={!items && !error} error={error} onRetry={load} />

      {items && items.length === 0 && <p className="adm-state">{emptyText}</p>}

      {items && items.length > 0 && (
        <div className="adm-table" role="table" aria-label={title}>
          <div className="adm-table__row adm-table__row--head" role="row">
            <span role="columnheader">Порядок</span>
            {columns.map((c) => (
              <span key={c.label} role="columnheader" className={c.className}>
                {c.label}
              </span>
            ))}
            <span role="columnheader" className="adm-table__actions">
              Действия
            </span>
          </div>
          {items.map((item, i) => (
            <div key={idOf(item)} className="adm-table__row" role="row">
              <span role="cell" className="adm-table__order">
                <button type="button" className="af-icon-btn" disabled={i === 0} onClick={() => move(i, i - 1)} aria-label={`${nameOf(item)}: выше`}>
                  ↑
                </button>
                <button
                  type="button"
                  className="af-icon-btn"
                  disabled={i === items.length - 1}
                  onClick={() => move(i, i + 1)}
                  aria-label={`${nameOf(item)}: ниже`}
                >
                  ↓
                </button>
              </span>
              {columns.map((c) => (
                <span key={c.label} role="cell" className={c.className}>
                  {c.render(item)}
                </span>
              ))}
              <span role="cell" className="adm-table__actions">
                <Link to={`${basePath}/${encodeURIComponent(idOf(item))}`} className="btn btn--sm">
                  Изменить
                </Link>
                <button type="button" className="btn btn--sm btn--danger-outline" onClick={() => setToDelete(item)}>
                  Удалить
                </button>
              </span>
            </div>
          ))}
        </div>
      )}

      <ConfirmDialog
        open={toDelete !== null}
        title="Удалить запись?"
        message={toDelete && <p>«{nameOf(toDelete)}» пропадёт с сайта. Это действие нельзя отменить.</p>}
        confirmLabel="Удалить"
        danger
        busy={busy}
        onConfirm={remove}
        onCancel={() => setToDelete(null)}
      />
    </div>
  );
}
