import { useEffect } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider, RequireAuth } from './auth/AuthProvider';
import { AdminLayout } from './components/AdminLayout';
import { ToastProvider } from './components/feedback';
import { DashboardPage } from './pages/DashboardPage';
import { ExperienceEditPage, ExperienceListPage } from './pages/ExperiencePages';
import { LoginPage } from './pages/LoginPage';
import { ProfilePage } from './pages/ProfilePage';
import { ProjectEditPage, ProjectListPage } from './pages/ProjectPages';
import { StackEditPage, StackListPage } from './pages/StackPages';
import './admin.css';

/** Админка грузится отдельным чанком: её код не попадает в сборку публичного сайта. */
export default function AdminApp() {
  // Поисковикам админку не показываем
  useEffect(() => {
    const meta = document.createElement('meta');
    meta.name = 'robots';
    meta.content = 'noindex, nofollow';
    document.head.appendChild(meta);
    const prevTitle = document.title;
    document.title = 'Админ-панель — портфолио';
    return () => {
      meta.remove();
      document.title = prevTitle;
    };
  }, []);

  return (
    <AuthProvider>
      <ToastProvider>
        <Routes>
          <Route path="login" element={<LoginPage />} />
          <Route element={<RequireAuth />}>
            <Route element={<AdminLayout />}>
              <Route index element={<DashboardPage />} />
              <Route path="profile" element={<ProfilePage />} />
              <Route path="projects" element={<ProjectListPage />} />
              <Route path="projects/new" element={<ProjectEditPage />} />
              <Route path="projects/:slug" element={<ProjectEditPage />} />
              <Route path="stack" element={<StackListPage />} />
              <Route path="stack/new" element={<StackEditPage />} />
              <Route path="stack/:id" element={<StackEditPage />} />
              <Route path="experience" element={<ExperienceListPage />} />
              <Route path="experience/new" element={<ExperienceEditPage />} />
              <Route path="experience/:id" element={<ExperienceEditPage />} />
              <Route path="*" element={<Navigate to="/admin" replace />} />
            </Route>
          </Route>
        </Routes>
      </ToastProvider>
    </AuthProvider>
  );
}
