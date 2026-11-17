import { NavLink, Outlet } from 'react-router-dom';
import { adminApi } from '../api/adminApi';
import { useAuth } from '../auth/AuthProvider';

const NAV = [
  { to: '/admin', label: 'Обзор', end: true },
  { to: '/admin/profile', label: 'Профиль' },
  { to: '/admin/projects', label: 'Проекты' },
  { to: '/admin/stack', label: 'Стек' },
  { to: '/admin/experience', label: 'Опыт' },
];

export function AdminLayout() {
  const { user, logout } = useAuth();

  return (
    <div className="adm">
      <aside className="adm-side">
        <p className="adm-side__brand">
          Admin
          <br />
          <span>DEV-01</span>
        </p>
        <nav className="adm-side__nav" aria-label="Разделы админки">
          {NAV.map((item) => (
            <NavLink key={item.to} to={item.to} end={item.end} className={({ isActive }) => `adm-side__link${isActive ? ' is-active' : ''}`}>
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="adm-side__foot">
          <a href="/" target="_blank" rel="noopener noreferrer" className="adm-side__link">
            Сайт ↗
          </a>
          <p className="adm-side__user" title={user?.username}>
            {user?.username}
          </p>
          <button type="button" className="adm-side__logout" onClick={logout}>
            Выйти
          </button>
        </div>
      </aside>

      <main className="adm-main">
        {adminApi.isMock && (
          <p className="adm-banner">
            Режим без бэкенда: изменения сохраняются только в этом браузере (localStorage) и видны на сайте здесь же.
            После подключения FastAPI (<code>VITE_USE_MOCKS=false</code>) данные пойдут на сервер.
          </p>
        )}
        <Outlet />
      </main>
    </div>
  );
}
