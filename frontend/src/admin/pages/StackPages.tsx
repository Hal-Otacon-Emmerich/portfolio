import { useNavigate, useParams } from 'react-router-dom';
import type { StackGroup } from '../../api/types';
import { adminApi } from '../api/adminApi';
import { CollectionPage } from '../components/CollectionPage';
import { EditorPage } from '../components/EditorPage';
import { Grid, Input, Section, StringList } from '../components/fields';
import { cleanLines, emptyStack, validateStack } from '../lib/entities';

export function StackListPage() {
  return (
    <CollectionPage
      title="Стек"
      description="Ячейки раздела «Стек». Порядок в списке — порядок на сайте."
      api={adminApi.stack}
      idOf={(s) => s.id}
      nameOf={(s) => `${s.id} — ${s.category}`}
      basePath="/admin/stack"
      newLabel="Новая группа"
      emptyText="Групп пока нет."
      columns={[
        { label: 'Код', render: (s) => <span className="adm-mono">{s.id}</span> },
        { label: 'Категория', render: (s) => <strong>{s.category}</strong> },
        { label: 'Технологии', render: (s) => s.lines.join(' / '), className: 'adm-table__grow' },
      ]}
    />
  );
}

export function StackEditPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isNew = !id;

  return (
    <EditorPage<StackGroup>
      resourceKey={id ?? 'new'}
      eyebrow={isNew ? 'Новая группа' : 'Группа стека'}
      title={(s) => (s.category ? `${s.id} — ${s.category}` : s.id)}
      backTo={{ to: '/admin/stack', label: 'Весь стек' }}
      load={async () => (isNew ? emptyStack((await adminApi.stack.list()).length + 1) : adminApi.stack.get(id))}
      save={(s) => {
        const clean = { ...s, id: s.id.trim(), lines: cleanLines(s.lines) };
        return isNew ? adminApi.stack.create(clean) : adminApi.stack.update(id, clean);
      }}
      validate={validateStack}
      onSaved={(s) => s.id !== id && navigate(`/admin/stack/${encodeURIComponent(s.id)}`, { replace: true })}
      onDelete={isNew ? undefined : async () => {
        await adminApi.stack.remove(id);
        navigate('/admin/stack');
      }}
      deleteLabel="Удалить группу"
      viewUrl={() => (isNew ? null : '/#stack')}
    >
      {({ draft, set, errors }) => (
        <Section title="Группа">
          <Grid>
            <Input label="Код" value={draft.id} onChange={(v) => set('id', v)} required error={errors.id} hint="A1, A2…" />
            <Input label="Категория" value={draft.category} onChange={(v) => set('category', v)} required error={errors.category} hint="Frontend, Backend…" />
          </Grid>
          <StringList
            label="Строки"
            values={draft.lines}
            onChange={(v) => set('lines', v)}
            placeholder="Python · FastAPI"
            hint="Каждая строка — отдельная строка в ячейке. Несколько технологий в строке разделяйте « · »."
          />
          {errors.lines && <p className="af-error">{errors.lines}</p>}
        </Section>
      )}
    </EditorPage>
  );
}
