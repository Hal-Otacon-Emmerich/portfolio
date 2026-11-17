import { adminApi } from '../api/adminApi';
import { EditorPage } from '../components/EditorPage';
import { Grid, Input, Rows, Section, TextInput } from '../components/fields';
import { validateProfile } from '../lib/entities';

export function ProfilePage() {
  return (
    <EditorPage
      resourceKey="profile"
      eyebrow="Шапка, первый экран и контакты"
      title={() => 'Профиль'}
      load={adminApi.getProfile}
      save={adminApi.updateProfile}
      validate={validateProfile}
      viewUrl={() => '/'}
    >
      {({ draft, set, errors }) => (
        <>
          <Section title="Кто вы" description="Отображается в шапке и на первом экране.">
            <TextInput label="Имя и фамилия" value={draft.name} onChange={(v) => set('name', v)} required error={errors.name} />
            <TextInput label="Заголовок (оранжевая плашка)" value={draft.headline} onChange={(v) => set('headline', v)} required error={errors.headline} />
            <Grid>
              <TextInput label="Статус" value={draft.status} onChange={(v) => set('status', v)} hint="Например: Open to work" />
              <TextInput label="Локация" value={draft.location} onChange={(v) => set('location', v)} />
            </Grid>
            <Grid>
              <Input label="Основной стек" value={draft.primaryStack} onChange={(v) => set('primaryStack', v)} hint="Python · React" />
              <Input label="Дополнительно" value={draft.secondaryStack} onChange={(v) => set('secondaryStack', v)} hint="FastAPI / Django / Self-hosted" />
            </Grid>
            <TextInput label="О себе" value={draft.about} onChange={(v) => set('about', v)} multiline required error={errors.about} />
            <Input
              label="Ссылка на резюме"
              value={draft.resumeUrl}
              onChange={(v) => set('resumeUrl', v)}
              error={errors.resumeUrl}
              hint="Файл в frontend/public (например /resume.pdf) или внешняя ссылка"
            />
          </Section>

          <Section title="Контакты" description="Блок «Напишите мне» внизу страницы.">
            {errors.contacts && <p className="af-error">{errors.contacts}</p>}
            <Rows
              label="Контакты"
              items={draft.contacts}
              onChange={(v) => set('contacts', v)}
              create={() => ({ id: '', label: '', value: '', href: '' })}
              itemTitle={(c) => c.label}
              addLabel="Добавить контакт"
              render={(c, patch, i) => (
                <Grid>
                  <Input label="id" value={c.id} onChange={(v) => patch({ id: v })} required error={errors[`contacts.${i}.id`]} hint="email, github…" />
                  <Input label="Название" value={c.label} onChange={(v) => patch({ label: v })} required error={errors[`contacts.${i}.label`]} />
                  <TextInput label="Текст ссылки" value={c.value} onChange={(v) => patch({ value: v })} />
                  <Input label="Ссылка" value={c.href} onChange={(v) => patch({ href: v })} error={errors[`contacts.${i}.href`]} hint="mailto:…, https://…" />
                </Grid>
              )}
            />
          </Section>
        </>
      )}
    </EditorPage>
  );
}
