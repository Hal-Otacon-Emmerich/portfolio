import React from 'react';
import ReactDOM from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import App from './App';
import { I18nProvider } from './i18n/I18nProvider';
import './styles/main.scss';

// Data-router нужен для useBlocker (предупреждение о несохранённых изменениях в админке).
const router = createBrowserRouter([
  {
    path: '*',
    element: (
      <I18nProvider>
        <App />
      </I18nProvider>
    ),
  },
]);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>,
);
