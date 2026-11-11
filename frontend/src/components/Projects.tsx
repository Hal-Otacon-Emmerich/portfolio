import { Link } from 'react-router-dom';
import type { ProjectSummary } from '../api/types';
import type { ResourceState } from '../hooks/useResource';
import { useI18n } from '../i18n/I18nProvider';
import { pad2 } from '../lib/sections';
import { Barcode } from './Barcode';
import { ResourceStatus } from './ResourceStatus';
import { SectionHead } from './SectionHead';

export function Projects({ state }: { state: ResourceState<ProjectSummary[]> }) {
  const { t, plural } = useI18n();
  const items = state.data ?? [];

  return (
    <section id="projects" className="section container" aria-labelledby="projects-title">
      <SectionHead
        id="projects-title"
        number="01"
        title={t('projects.title')}
        meta={t('projects.index', { n: pad2(items.length), records: plural('projects.records', items.length) })}
      />
      <ResourceStatus state={state} />
      <div className="projects">
        {items.map((project) => (
          <ProjectCard key={project.slug} project={project} />
        ))}
      </div>
    </section>
  );
}

function ProjectCard({ project }: { project: ProjectSummary }) {
  const { t, tr } = useI18n();

  return (
    <article className={`pcard pcard--${project.variant}`}>
      <div className="pcard__band">
        <span>{project.code}</span>
        <span>Status — {tr(project.status)}</span>
      </div>
      <div className="pcard__body">
        <p className="pcard__num" aria-hidden="true">
          {project.number}
        </p>
        <h3 className="pcard__title">{tr(project.title)}</h3>
        <p className="pcard__summary">{tr(project.summary)}</p>

        <dl className="specs">
          {project.specs.map((row) => (
            <div key={tr(row.label)} className="specs__row">
              <dt>{tr(row.label)}</dt>
              <dd>{tr(row.value)}</dd>
            </div>
          ))}
        </dl>

        <Barcode value={project.code + project.slug} className="pcard__barcode" />

        <div className="pcard__actions">
          {project.hasDetail && (
            <Link to={`/projects/${project.slug}`} className="btn btn--sm btn--solid">
              {t('projects.scheme')} →
            </Link>
          )}
          {project.links.map((link) => (
            <a
              key={link.kind}
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn--sm"
            >
              {t(`projects.link.${link.kind}`)} ↗
            </a>
          ))}
        </div>
      </div>
    </article>
  );
}
