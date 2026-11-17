import { useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import type { ExternalLinkKind, ProjectDetailFields, ProjectRecord, ProjectVariant } from '../../api/types';
import { adminApi } from '../api/adminApi';
import { CollectionPage } from '../components/CollectionPage';
import { EditorPage, type Setter } from '../components/EditorPage';
import { Checkbox, Grid, Input, Rows, Section, Select, StringList, TextInput } from '../components/fields';
import { cleanLines, emptyDetail, emptyProject, validateProject } from '../lib/entities';
import { preview, type Errors } from '../lib/utils';

const VARIANTS: { value: ProjectVariant; label: string }[] = [
  { value: 'light', label: 'Светлая' },
  { value: 'dark', label: 'Тёмная' },
  { value: 'draft', label: 'Черновик (пунктир)' },
];

const LINK_KINDS: { value: ExternalLinkKind; label: string }[] = [
  { value: 'github', label: 'GitHub' },
  { value: 'demo', label: 'Демо' },
];

export function ProjectListPage() {
  return (
    <CollectionPage
      title="Проекты"
      description="Порядок в списке — порядок карточек на сайте."
      api={adminApi.projects}
      idOf={(p) => p.slug}
      nameOf={(p) => preview(p.title)}
      basePath="/admin/projects"
      newLabel="Новый проект"
      emptyText="Проектов пока нет."
      columns={[
        { label: 'Код', render: (p) => <span className="adm-mono">{p.code}</span> },
        { label: 'Название', render: (p) => <strong>{preview(p.title)}</strong>, className: 'adm-table__grow' },
        { label: 'Схема', render: (p) => (p.detail ? 'есть' : '—') },
      ]}
    />
  );
}

const normalize = (p: ProjectRecord): ProjectRecord => ({
  ...p,
  slug: p.slug.trim(),
  detail: p.detail && {
    ...p.detail,
    manualTitle: cleanLines(p.detail.manualTitle),
    alias: cleanLines(p.detail.alias),
    specTitle: cleanLines(p.detail.specTitle),
    repoUrl: p.detail.repoUrl?.trim() || undefined,
  },
});

export function ProjectEditPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const isNew = !slug;

  return (
    <EditorPage<ProjectRecord>
      resourceKey={slug ?? 'new'}
      eyebrow={isNew ? 'Новый проект' : 'Проект'}
      title={(p) => preview(p.title)}
      backTo={{ to: '/admin/projects', label: 'Все проекты' }}
      load={async () => (isNew ? emptyProject((await adminApi.projects.list()).length + 1) : adminApi.projects.get(slug))}
      save={(p) => (isNew ? adminApi.projects.create(normalize(p)) : adminApi.projects.update(slug, normalize(p)))}
      validate={validateProject}
      onSaved={(p) => p.slug !== slug && navigate(`/admin/projects/${p.slug}`, { replace: true })}
      onDelete={isNew ? undefined : async () => {
        await adminApi.projects.remove(slug);
        navigate('/admin/projects');
      }}
      deleteLabel="Удалить проект"
      viewUrl={(p) => (isNew ? null : p.detail ? `/projects/${p.slug}` : '/#projects')}
    >
      {(ctx) => <ProjectForm {...ctx} />}
    </EditorPage>
  );
}

function ProjectForm({ draft, set, errors }: { draft: ProjectRecord; set: Setter<ProjectRecord>; errors: Errors }) {
  // Если выключить схему и включить снова, введённые данные вернутся.
  const stashedDetail = useRef<ProjectDetailFields | null>(null);

  const toggleDetail = (on: boolean) => {
    if (on) {
      set('detail', stashedDetail.current ?? emptyDetail());
    } else {
      stashedDetail.current = draft.detail;
      set('detail', null);
    }
  };

  return (
    <>
      <Section title="Карточка" description="Как проект выглядит в разделе «Проекты» на главной.">
        <Grid cols={3}>
          <Input
            label="Slug (адрес)"
            value={draft.slug}
            onChange={(v) => set('slug', v.toLowerCase())}
            required
            error={errors.slug}
            hint={`/projects/${draft.slug || 'slug'}`}
          />
          <Input label="Код" value={draft.code} onChange={(v) => set('code', v)} required error={errors.code} hint="PRJ-04" />
          <Input label="Номер" value={draft.number} onChange={(v) => set('number', v)} required error={errors.number} hint="04" />
        </Grid>
        <TextInput label="Название" value={draft.title} onChange={(v) => set('title', v)} required error={errors.title} />
        <TextInput label="Краткое описание" value={draft.summary} onChange={(v) => set('summary', v)} multiline required error={errors.summary} />
        <Grid>
          <TextInput label="Статус" value={draft.status} onChange={(v) => set('status', v)} hint="Active, В разработке…" />
          <Select label="Вид карточки" value={draft.variant} options={VARIANTS} onChange={(v) => set('variant', v)} />
        </Grid>
        <Rows
          label="Характеристики"
          items={draft.specs}
          onChange={(v) => set('specs', v)}
          create={() => ({ label: '', value: '' })}
          itemTitle={(s) => preview(s.label)}
          addLabel="Добавить строку"
          render={(s, patch) => (
            <Grid>
              <TextInput label="Подпись" value={s.label} onChange={(v) => patch({ label: v })} hint="Front, Host…" />
              <TextInput label="Значение" value={s.value} onChange={(v) => patch({ value: v })} />
            </Grid>
          )}
        />
        <Rows
          label="Ссылки (откроются в новом окне)"
          items={draft.links}
          onChange={(v) => set('links', v)}
          create={() => ({ kind: 'github' as ExternalLinkKind, href: '' })}
          itemTitle={(l) => LINK_KINDS.find((k) => k.value === l.kind)?.label ?? l.kind}
          addLabel="Добавить ссылку"
          render={(l, patch, i) => (
            <Grid>
              <Select label="Тип" value={l.kind} options={LINK_KINDS} onChange={(v) => patch({ kind: v })} />
              <Input label="Адрес" value={l.href} onChange={(v) => patch({ href: v })} type="url" required error={errors[`links.${i}.href`]} />
            </Grid>
          )}
        />
      </Section>

      <Section title="Страница-схема" description="Отдельная страница проекта. Если включена, на карточке появляется кнопка «Схема».">
        <Checkbox label="У проекта есть страница-схема" checked={draft.detail !== null} onChange={toggleDetail} />
        {draft.detail && <DetailForm detail={draft.detail} onChange={(d) => set('detail', d)} errors={errors} />}
      </Section>
    </>
  );
}

function DetailForm({ detail, onChange, errors }: { detail: ProjectDetailFields; onChange: (d: ProjectDetailFields) => void; errors: Errors }) {
  const set = <K extends keyof ProjectDetailFields>(key: K, value: ProjectDetailFields[K]) => onChange({ ...detail, [key]: value });

  return (
    <>
      <h3 className="adm-subhead">Оранжевая панель</h3>
      <Grid>
        <StringList label="Заголовок (по строкам)" values={detail.manualTitle} onChange={(v) => set('manualTitle', v)} placeholder="HOMELAB" />
        <StringList label="Псевдоним (по строкам)" values={detail.alias} onChange={(v) => set('alias', v)} placeholder="SELF-HOSTED" />
      </Grid>
      {errors['detail.manualTitle'] && <p className="af-error">{errors['detail.manualTitle']}</p>}

      <h3 className="adm-subhead">Чертёж</h3>
      <TextInput label="Подпись чертежа" value={detail.drawingTitle} onChange={(v) => set('drawingTitle', v)} hint="Network view 1" />
      {errors['detail.chain'] && <p className="af-error">{errors['detail.chain']}</p>}
      <Rows
        label="Узлы схемы (сверху вниз)"
        items={detail.chain}
        onChange={(v) => set('chain', v)}
        create={() => ({ id: `N-${String(detail.chain.length).padStart(2, '0')}`, label: '' })}
        itemTitle={(n) => `${n.id} ${preview(n.label)}`}
        addLabel="Добавить узел"
        render={(n, patch) => (
          <Grid cols={3}>
            <Input label="Код" value={n.id} onChange={(v) => patch({ id: v })} />
            <TextInput label="Подпись" value={n.label} onChange={(v) => patch({ label: v })} />
            <Checkbox label="Выделить (тёмный блок)" checked={Boolean(n.emphasis)} onChange={(v) => patch({ emphasis: v || undefined })} />
          </Grid>
        )}
      />
      {errors['detail.modules'] && <p className="af-error">{errors['detail.modules']}</p>}
      <Rows
        label="Модули под последним узлом"
        items={detail.modules}
        onChange={(v) => set('modules', v)}
        create={() => ({ id: `S-${String(detail.modules.length + 1).padStart(2, '0')}`, category: '', name: '' })}
        itemTitle={(m) => `${m.id} ${m.name}`}
        addLabel="Добавить модуль"
        render={(m, patch) => (
          <Grid cols={3}>
            <Input label="Код" value={m.id} onChange={(v) => patch({ id: v })} />
            <TextInput label="Категория" value={m.category} onChange={(v) => patch({ category: v })} />
            <Input label="Название" value={m.name} onChange={(v) => patch({ name: v })} />
          </Grid>
        )}
      />

      <h3 className="adm-subhead">Spec sheet</h3>
      <Grid>
        <Input label="Код модуля" value={detail.specCode} onChange={(v) => set('specCode', v)} hint="PX-02.1" />
        <StringList label="Заголовок (по строкам)" values={detail.specTitle} onChange={(v) => set('specTitle', v)} placeholder="SPEC SHEET" />
      </Grid>
      <Rows
        label="Строки таблицы"
        items={detail.spec}
        onChange={(v) => set('spec', v)}
        create={() => ({ label: '', value: '' })}
        itemTitle={(s) => preview(s.label)}
        addLabel="Добавить строку"
        render={(s, patch) => (
          <Grid>
            <TextInput label="Подпись" value={s.label} onChange={(v) => patch({ label: v })} />
            <TextInput label="Значение" value={s.value} onChange={(v) => patch({ value: v })} />
          </Grid>
        )}
      />
      <TextInput label="Что было сложнее всего" value={detail.challenge} onChange={(v) => set('challenge', v)} multiline />
      <Grid>
        <Input label="Ссылка на код" value={detail.repoUrl ?? ''} onChange={(v) => set('repoUrl', v)} type="url" error={errors['detail.repoUrl']} />
        <TextInput label="Текст ссылки" value={detail.repoLabel} onChange={(v) => set('repoLabel', v)} />
      </Grid>
    </>
  );
}
