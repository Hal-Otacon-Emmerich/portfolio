import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { adminApi } from '../api/adminApi';
import { useAuth } from '../auth/AuthProvider';
import { ConfirmDialog, LoadState, useToast } from '../components/feedback';
import { errorMessage } from '../lib/utils';

interface Counts {
  projects: number;
  stack: number;
  experience: number;
}

export function DashboardPage() {
  const { user } = useAuth();
  const toast = useToast();
  const [counts, setCounts] = useState<Counts | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [confirmReset, setConfirmReset] = useState(false);
  const [resetting, setResetting] = useState(false);

  const load = useCallback(() => {
    setError(null);
    Promise.all([adminApi.projects.list(), adminApi.stack.list(), adminApi.experience.list()]).then(
      ([projects, stack, experience]) => setCounts({ projects: projects.length, stack: stack.length, experience: experience.length }),
      (err) => setError(errorMessage(err)),
    );
  }, []);

  useEffect(load, [load]);

  const reset = async () => {
    setResetting(true);
    try {
      await adminApi.resetMockData();
      toast('success', 'Демо-данные восстановлены');
      load();
    } catch (err) {
      toast('error', errorMessage(err));
    } finally {
      setResetting(false);
      setConfirmReset(false);
    }
  };

  const cards = [
    { to: '/admin/profile', title: 'Профиль', meta: 'Шапка, о себе, контакты' },
    { to: '/admin/projects', title: 'Проекты', meta: counts ? `${counts.projects} шт.` : '…' },
    { to: '/admin/stack', title: 'Стек', meta: counts ? `${counts.stack} групп` : '…' },
    { to: '/admin/experience', title: 'Опыт', meta: counts ? `${counts.experience} записей` : '…' },
  ];

  return (
    <div className="adm-page">
      <header className="adm-head">
        <div>
          <p className="adm-eyebrow">Добро пожаловать, {user?.username}</p>
          <h1 className="adm-title">Обзор</h1>
        </div>
        <a href="/" target="_blank" rel="noopener noreferrer" className="btn btn--sm">
          Открыть сайт ↗
        </a>
      </header>

      <LoadState loading={false} error={error} onRetry={load} />

      <div className="adm-cards">
        {cards.map((c, i) => (
          <Link key={c.to} to={c.to} className="adm-card">
            <span className="adm-card__num">{String(i + 1).padStart(2, '0')}</span>
            <span className="adm-card__title">{c.title}</span>
            <span className="adm-card__meta">{c.meta}</span>
          </Link>
        ))}
      </div>

      {adminApi.isMock && (
        <section className="adm-section">
          <header className="adm-section__head">
            <h2 className="adm-section__title">Демо-данные</h2>
            <p className="adm-section__desc">Вернуть содержимое из src/api/mocks.ts и стереть все правки, сделанные в этом браузере.</p>
          </header>
          <div className="adm-section__body">
            <div>
              <button type="button" className="btn btn--danger-outline" onClick={() => setConfirmReset(true)}>
                Сбросить данные
              </button>
            </div>
          </div>
        </section>
      )}

      <ConfirmDialog
        open={confirmReset}
        title="Сбросить все правки?"
        message={<p>Все изменения, сделанные в админке в этом браузере, будут потеряны.</p>}
        confirmLabel="Сбросить"
        danger
        busy={resetting}
        onConfirm={reset}
        onCancel={() => setConfirmReset(false)}
      />
    </div>
  );
}
