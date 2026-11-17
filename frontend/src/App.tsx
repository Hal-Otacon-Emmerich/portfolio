import { lazy, Suspense } from 'react';
import { Link, Route, Routes } from 'react-router-dom';
import { useI18n } from './i18n/I18nProvider';
import { HomePage } from './pages/HomePage';
import { ProjectPage } from './pages/ProjectPage';

// Админка загружается только при переходе на /admin
const AdminApp = lazy(() => import('./admin/AdminApp'));

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/projects/:slug" element={<ProjectPage />} />
      <Route
        path="/admin/*"
        element={
          <Suspense fallback={<p className="resource-status container">Загрузка…</p>}>
            <AdminApp />
          </Suspense>
        }
      />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

function NotFound() {
  const { t } = useI18n();
  return (
    <div className="not-found container">
      <p className="not-found__code">404</p>
      <Link to="/" className="btn btn--ink">
        {t('project.home')} →
      </Link>
    </div>
  );
}
