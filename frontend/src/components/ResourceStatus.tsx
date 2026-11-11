import type { ResourceState } from '../hooks/useResource';
import { useI18n } from '../i18n/I18nProvider';

/** Показывает загрузку/ошибку. Пока работают моки, почти никогда не виден. */
export function ResourceStatus({ state }: { state: ResourceState<unknown> }) {
  const { t } = useI18n();
  if (state.error) return <p className="resource-status resource-status--error">{t('state.error')}</p>;
  if (state.loading && !state.data) return <p className="resource-status">{t('state.loading')}</p>;
  return null;
}
