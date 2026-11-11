import { Fragment, useEffect } from 'react';
import { Link, NavLink, useNavigate, useParams } from 'react-router-dom';
import { ApiError } from '../api/client';
import { portfolioApi } from '../api/portfolio';
import type { ProjectDetail } from '../api/types';
import { useResource } from '../hooks/useResource';
import { useI18n } from '../i18n/I18nProvider';

const BACK_TO_PROJECTS = '/#projects';

export function ProjectPage() {
  const { slug = '' } = useParams();
  const navigate = useNavigate();
  const { t } = useI18n();
  const detail = useResource((s) => portfolioApi.getProjectDetail(slug, s), [slug]);
  const list = useResource((s) => portfolioApi.getProjects(s), []);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [slug]);

  const project = detail.data?.slug === slug ? detail.data : null;
  const notFound = detail.error instanceof ApiError && detail.error.status === 404;

  return (
    <div className="pp">
      <aside className="pp__rail">
        <Link to="/" className="pp__rail-item pp__rail-home" aria-label={t('project.home')}>
          DV
          <br />
          01
        </Link>
        <nav className="pp__rail-nav" aria-label={t('project.nav')}>
          {list.data?.map((item) =>
            item.hasDetail ? (
              <NavLink
                key={item.slug}
                to={`/projects/${item.slug}`}
                className={({ isActive }) => `pp__rail-item${isActive ? ' is-active' : ''}`}
                title={item.code}
              >
                PR
                <br />
                {item.number}
              </NavLink>
            ) : (
              <span
                key={item.slug}
                className="pp__rail-item is-disabled"
                aria-disabled="true"
                title={t('project.unavailable')}
              >
                PR
                <br />
                {item.number}
              </span>
            ),
          )}
        </nav>
        <button
          type="button"
          className="pp__rail-back"
          onClick={() => navigate(BACK_TO_PROJECTS)}
          aria-label={t('project.back')}
        >
          ←
        </button>
      </aside>

      {project ? (
        <ProjectBody project={project} />
      ) : (
        <div className="pp__state">
          <p>{notFound ? t('project.notFound') : detail.error ? t('state.error') : t('state.loading')}</p>
          {(notFound || detail.error) && (
            <Link to={BACK_TO_PROJECTS} className="btn">
              {t('project.back')} →
            </Link>
          )}
        </div>
      )}
    </div>
  );
}

function ProjectBody({ project: p }: { project: ProjectDetail }) {
  const { t, tr } = useI18n();

  return (
    <>
      <section className="pp__panel" aria-labelledby="pp-title">
        <div className="pp__panel-head">
          <span className="pp__tag">{t('project.file')}</span>
          <h1 id="pp-title" className="pp__manual">
            <span>{p.code}</span>
            {p.manualTitle.map((line) => (
              <span key={line}>{line}</span>
            ))}
          </h1>
        </div>
        <span className="pp__bar" aria-hidden="true" />
        <p className="pp__bignum" aria-hidden="true">
          {p.number}
        </p>
        <div className="pp__panel-foot">
          <div className="pp__panel-head">
            <span className="pp__tag">{t('project.alias')}</span>
            <p className="pp__alias">
              {p.alias.map((line) => (
                <span key={line}>{line}</span>
              ))}
            </p>
          </div>
          <span className="pp__bar" aria-hidden="true" />
        </div>
      </section>

      <main className="pp__content">
        <div className="pp__head">
          <span>{t('project.drawing')}</span>
          <span>{tr(p.drawingTitle)}</span>
          <span className="pp__muted">NTS</span>
        </div>

        <div className="pp__grid">
          <div className="diagram">
            {p.chain.map((node, i) => (
              <Fragment key={node.id}>
                {i > 0 && <span className="diagram__wire" aria-hidden="true" />}
                <div className={`diagram__node${node.emphasis ? ' is-emphasis' : ''}`}>
                  <span>{tr(node.label)}</span>
                  <span className="diagram__code">{node.id}</span>
                </div>
              </Fragment>
            ))}
            {p.modules.length > 0 && (
              <>
                <span className="diagram__wire" aria-hidden="true" />
                <ul className="diagram__modules">
                  {p.modules.map((m) => (
                    <li key={m.id} className="diagram__module">
                      <span className="diagram__module-cat">
                        {m.id} / {tr(m.category)}
                      </span>
                      <span className="diagram__module-name">{m.name}</span>
                    </li>
                  ))}
                </ul>
              </>
            )}
          </div>

          <aside className="spec">
            <div className="spec__top">
              <p className="spec__code">
                {t('project.moduleSpec')} — {p.specCode}
              </p>
              <h2 className="spec__title">
                {p.specTitle.map((line) => (
                  <span key={line}>{line}</span>
                ))}
              </h2>
              <dl className="spec__rows">
                {p.spec.map((row) => (
                  <div key={tr(row.label)}>
                    <dt>{tr(row.label)}</dt>
                    <dd>{tr(row.value)}</dd>
                  </div>
                ))}
              </dl>
            </div>
            <div className="spec__bottom">
              <p>{tr(p.challenge)}</p>
              {p.repoUrl && (
                <a href={p.repoUrl} target="_blank" rel="noopener noreferrer" className="spec__link">
                  {tr(p.repoLabel)} ↗
                </a>
              )}
            </div>
          </aside>
        </div>

        <footer className="pp__foot">
          <span>{t('project.scale')}</span>
          <Link to={BACK_TO_PROJECTS} className="pp__back">
            {t('project.back')} ⟶
          </Link>
        </footer>
      </main>
    </>
  );
}
