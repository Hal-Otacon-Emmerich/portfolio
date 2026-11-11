import type { StackGroup } from '../api/types';
import type { ResourceState } from '../hooks/useResource';
import { useI18n } from '../i18n/I18nProvider';
import { ResourceStatus } from './ResourceStatus';
import { SectionHead } from './SectionHead';

export function Stack({ state }: { state: ResourceState<StackGroup[]> }) {
  const { t } = useI18n();

  return (
    <section id="stack" className="section container" aria-labelledby="stack-title">
      <SectionHead id="stack-title" number="02" title={t('stack.title')} meta={t('stack.sheet')} />
      <ResourceStatus state={state} />
      <ul className="stack">
        {state.data?.map((group) => (
          <li key={group.id} className="stack__cell">
            <p className="stack__label">
              {group.id} — {group.category}
            </p>
            {group.lines.map((line) => (
              <p key={line} className="stack__line">
                {line}
              </p>
            ))}
          </li>
        ))}
      </ul>
    </section>
  );
}
