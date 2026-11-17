import { useNavigate, useParams } from 'react-router-dom';
import type { Experience, Text } from '../../api/types';
import { adminApi } from '../api/adminApi';
import { CollectionPage } from '../components/CollectionPage';
import { EditorPage } from '../components/EditorPage';
import { Checkbox, Grid, Input, Rows, Section, StringList, TextInput } from '../components/fields';
import { cleanLines, emptyExperience, validateExperience } from '../lib/entities';
import { preview } from '../lib/utils';

export function ExperienceListPage() {
  return (
    <CollectionPage
      title="Опыт"
      description="Строки таблицы «Опыт» и досье в модальном окне. Порядок в списке — порядок на сайте."
      api={adminApi.experience}
      idOf={(e) => e.id}
      nameOf={(e) => `${e.id} ${preview(e.role)} — ${preview(e.company)}`}
      basePath="/admin/experience"
      newLabel="Новая запись"
      emptyText="Записей пока нет."
      columns={[
        { label: 'ID', render: (e) => <span className="adm-mono">{e.id}</span> },
        { label: 'Период', render: (e) => preview(e.period) },
        { label: 'Роль / компания', render: (e) => <strong>{`${preview(e.role)} — ${preview(e.company)}`}</strong>, className: 'adm-table__grow' },
      ]}
    />
  );
}

export function ExperienceEditPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isNew = !id;

  return (
    <EditorPage<Experience>
      resourceKey={id ?? 'new'}
      eyebrow={isNew ? 'Новая запись опыта' : 'Опыт'}
      title={(e) => [e.id, preview(e.role)].filter(Boolean).join(' ')}
      backTo={{ to: '/admin/experience', label: 'Весь опыт' }}
      load={async () => (isNew ? emptyExperience((await adminApi.experience.list()).length + 1) : adminApi.experience.get(id))}
      save={(e) => {
        const clean: Experience = {
          ...e,
          id: e.id.trim(),
          stack: cleanLines(e.stack),
          recommendationUrl: e.recommendationUrl?.trim() || undefined,
        };
        return isNew ? adminApi.experience.create(clean) : adminApi.experience.update(id, clean);
      }}
      validate={validateExperience}
      onSaved={(e) => e.id !== id && navigate(`/admin/experience/${encodeURIComponent(e.id)}`, { replace: true })}
      onDelete={isNew ? undefined : async () => {
        await adminApi.experience.remove(id);
        navigate('/admin/experience');
      }}
      deleteLabel="Удалить запись"
      viewUrl={() => (isNew ? null : '/#experience')}
    >
      {({ draft, set, errors }) => (
        <>
          <Section title="Строка в таблице">
            <Grid>
              <Input label="ID" value={draft.id} onChange={(v) => set('id', v)} required error={errors.id} hint="E-003" />
              <TextInput label="Период" value={draft.period} onChange={(v) => set('period', v)} required error={errors.period} hint="03.2024 — сейчас" />
            </Grid>
            <Grid>
              <TextInput label="Роль" value={draft.role} onChange={(v) => set('role', v)} required error={errors.role} />
              <TextInput label="Компания" value={draft.company} onChange={(v) => set('company', v)} required error={errors.company} />
            </Grid>
            <TextInput label="Результат одной строкой" value={draft.summary} onChange={(v) => set('summary', v)} required error={errors.summary} />
          </Section>

          <Section title="Досье: левая колонка">
            <Rows
              label="Факты"
              items={draft.facts}
              onChange={(v) => set('facts', v)}
              create={() => ({ label: '', value: '' })}
              itemTitle={(f) => preview(f.label)}
              addLabel="Добавить факт"
              render={(f, patch) => (
                <Grid>
                  <TextInput label="Подпись" value={f.label} onChange={(v) => patch({ label: v })} hint="Компания, Сфера, Формат…" />
                  <TextInput label="Значение" value={f.value} onChange={(v) => patch({ value: v })} />
                </Grid>
              )}
            />
            <Grid>
              <StringList label="Стек" values={draft.stack} onChange={(v) => set('stack', v)} placeholder="Python" addLabel="Добавить технологию" />
              <Input label="Код проверки (под штрихкодом)" value={draft.verification} onChange={(v) => set('verification', v)} hint="E001-2024-DEV" />
            </Grid>
          </Section>

          <Section title="Досье: основной текст">
            <TextInput label="Одно предложение о роли" value={draft.pitch} onChange={(v) => set('pitch', v)} multiline />
            <Rows
              label="Метрики (до трёх)"
              items={draft.metrics}
              onChange={(v) => set('metrics', v)}
              create={() => ({ id: `M-${String(draft.metrics.length + 1).padStart(2, '0')}`, value: '', label: '' })}
              itemTitle={(m) => `${m.id} ${m.value}`}
              addLabel="Добавить метрику"
              render={(m, patch) => (
                <Grid cols={3}>
                  <Input label="Код" value={m.id} onChange={(v) => patch({ id: v })} />
                  <Input label="Значение" value={m.value} onChange={(v) => patch({ value: v })} hint="40%, 12, 3k" />
                  <TextInput label="Подпись" value={m.label} onChange={(v) => patch({ label: v })} />
                </Grid>
              )}
            />
            <TextInput label="01 Задача" value={draft.task} onChange={(v) => set('task', v)} multiline />
            <Rows<Text>
              label="02 Что сделал"
              items={draft.done}
              onChange={(v) => set('done', v)}
              create={() => ({ ru: '', en: '' })}
              itemTitle={(d) => preview(d)}
              addLabel="Добавить пункт"
              render={(d, _patch, i) => (
                <TextInput
                  label="Пункт"
                  value={d}
                  onChange={(v) => set('done', draft.done.map((x, j) => (j === i ? v : x)))}
                />
              )}
            />
            <TextInput label="03 Сложность" value={draft.challenge} onChange={(v) => set('challenge', v)} multiline />
            <TextInput label="04 Чему научился" value={draft.learned} onChange={(v) => set('learned', v)} multiline />
            <Rows
              label="Таймлайн"
              items={draft.timeline}
              onChange={(v) => set('timeline', v)}
              create={() => ({ date: '', label: '' })}
              itemTitle={(ev) => preview(ev.date)}
              addLabel="Добавить событие"
              render={(ev, patch) => (
                <Grid cols={3}>
                  <TextInput label="Дата" value={ev.date} onChange={(v) => patch({ date: v })} />
                  <TextInput label="Событие" value={ev.label} onChange={(v) => patch({ label: v })} />
                  <Checkbox label="Текущее (оранжевая отметка)" checked={Boolean(ev.current)} onChange={(v) => patch({ current: v || undefined })} />
                </Grid>
              )}
            />
            <Input
              label="Рекомендация / ссылка"
              value={draft.recommendationUrl ?? ''}
              onChange={(v) => set('recommendationUrl', v)}
              type="url"
              error={errors.recommendationUrl}
            />
          </Section>
        </>
      )}
    </EditorPage>
  );
}
