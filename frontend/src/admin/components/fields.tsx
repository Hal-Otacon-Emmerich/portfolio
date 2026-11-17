import { useId, type ReactNode } from 'react';
import type { Localized, Text } from '../../api/types';
import { moveItem } from '../lib/utils';

/* ---------- Обёртка поля ---------- */

interface FieldProps {
  label: string;
  htmlFor?: string;
  hint?: ReactNode;
  error?: string;
  required?: boolean;
  aside?: ReactNode;
  children: ReactNode;
}

export function Field({ label, htmlFor, hint, error, required, aside, children }: FieldProps) {
  return (
    <div className={`af-field${error ? ' has-error' : ''}`}>
      <div className="af-field__head">
        <label className="af-label" htmlFor={htmlFor}>
          {label}
          {required && <span className="af-required" aria-hidden="true"> *</span>}
        </label>
        {aside}
      </div>
      {children}
      {hint && !error && <p className="af-hint">{hint}</p>}
      {error && (
        <p className="af-error" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

/* ---------- Простые поля ---------- */

interface InputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  hint?: ReactNode;
  error?: string;
  required?: boolean;
  placeholder?: string;
  type?: 'text' | 'url' | 'password';
  autoComplete?: string;
  multiline?: boolean;
}

export function Input({ label, value, onChange, hint, error, required, placeholder, type = 'text', autoComplete, multiline }: InputProps) {
  const id = useId();
  const common = {
    id,
    className: 'af-input',
    value,
    placeholder,
    required,
    'aria-invalid': Boolean(error) || undefined,
  };
  return (
    <Field label={label} htmlFor={id} hint={hint} error={error} required={required}>
      {multiline ? (
        <textarea {...common} rows={4} onChange={(e) => onChange(e.target.value)} />
      ) : (
        <input {...common} type={type} autoComplete={autoComplete} onChange={(e) => onChange(e.target.value)} />
      )}
    </Field>
  );
}

interface SelectProps<T extends string> {
  label: string;
  value: T;
  options: { value: T; label: string }[];
  onChange: (value: T) => void;
}

export function Select<T extends string>({ label, value, options, onChange }: SelectProps<T>) {
  const id = useId();
  return (
    <Field label={label} htmlFor={id}>
      <select id={id} className="af-input" value={value} onChange={(e) => onChange(e.target.value as T)}>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </Field>
  );
}

export function Checkbox({ label, checked, onChange, hint }: { label: string; checked: boolean; onChange: (v: boolean) => void; hint?: string }) {
  return (
    <div className="af-field">
      <label className="af-check">
        <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} />
        <span>{label}</span>
      </label>
      {hint && <p className="af-hint">{hint}</p>}
    </div>
  );
}

/* ---------- Текст с переводом ---------- */

const isLocalized = (t: Text): t is Localized => typeof t !== 'string';

interface TextInputProps {
  label: string;
  value: Text;
  onChange: (value: Text) => void;
  multiline?: boolean;
  required?: boolean;
  hint?: ReactNode;
  error?: string;
}

/**
 * Поле для значения типа Text: одна строка для всех языков или пара RU/EN.
 * Кнопка «RU / EN» переключает режим.
 */
export function TextInput({ label, value, onChange, multiline, required, hint, error }: TextInputProps) {
  const id = useId();
  const localized = isLocalized(value);

  const toggle = () => onChange(localized ? value.ru : { ru: value, en: value });

  const control = (lang: 'ru' | 'en' | null) => {
    const current = lang && localized ? value[lang] : (value as string);
    const set = (v: string) => onChange(lang && localized ? { ...value, [lang]: v } : v);
    const props = {
      id: lang ? `${id}-${lang}` : id,
      className: 'af-input',
      value: current,
      'aria-invalid': Boolean(error) || undefined,
      'aria-label': lang ? `${label} (${lang.toUpperCase()})` : undefined,
    };
    return multiline ? (
      <textarea {...props} rows={4} onChange={(e) => set(e.target.value)} />
    ) : (
      <input {...props} type="text" onChange={(e) => set(e.target.value)} />
    );
  };

  return (
    <Field
      label={label}
      htmlFor={localized ? `${id}-ru` : id}
      hint={hint}
      error={error}
      required={required}
      aside={
        <button
          type="button"
          className={`af-lang-toggle${localized ? ' is-on' : ''}`}
          aria-pressed={localized}
          onClick={toggle}
          title={localized ? 'Сделать одинаковым для всех языков' : 'Задать отдельно для RU и EN'}
        >
          RU / EN
        </button>
      }
    >
      {localized ? (
        <div className="af-pair">
          <div className="af-pair__item">
            <span className="af-pair__tag">RU</span>
            {control('ru')}
          </div>
          <div className="af-pair__item">
            <span className="af-pair__tag">EN</span>
            {control('en')}
          </div>
        </div>
      ) : (
        control(null)
      )}
    </Field>
  );
}

/* ---------- Списки ---------- */

interface ItemControlsProps {
  index: number;
  count: number;
  onMove: (to: number) => void;
  onRemove: () => void;
  label: string;
}

export function ItemControls({ index, count, onMove, onRemove, label }: ItemControlsProps) {
  return (
    <div className="af-item-controls">
      <button type="button" className="af-icon-btn" disabled={index === 0} onClick={() => onMove(index - 1)} aria-label={`${label}: выше`}>
        ↑
      </button>
      <button type="button" className="af-icon-btn" disabled={index === count - 1} onClick={() => onMove(index + 1)} aria-label={`${label}: ниже`}>
        ↓
      </button>
      <button type="button" className="af-icon-btn af-icon-btn--danger" onClick={onRemove} aria-label={`${label}: удалить`}>
        ✕
      </button>
    </div>
  );
}

interface StringListProps {
  label: string;
  values: string[];
  onChange: (values: string[]) => void;
  placeholder?: string;
  hint?: ReactNode;
  addLabel?: string;
}

/** Список строк: строки заголовка, технологии и т.п. */
export function StringList({ label, values, onChange, placeholder, hint, addLabel = 'Добавить строку' }: StringListProps) {
  const id = useId();
  return (
    <Field label={label} htmlFor={`${id}-0`} hint={hint}>
      <div className="af-strings">
        {values.map((v, i) => (
          <div key={i} className="af-strings__row">
            <input
              id={`${id}-${i}`}
              className="af-input"
              value={v}
              placeholder={placeholder}
              aria-label={`${label} — ${i + 1}`}
              onChange={(e) => onChange(values.map((x, j) => (j === i ? e.target.value : x)))}
            />
            <ItemControls
              index={i}
              count={values.length}
              label={`${label} ${i + 1}`}
              onMove={(to) => onChange(moveItem(values, i, to))}
              onRemove={() => onChange(values.filter((_, j) => j !== i))}
            />
          </div>
        ))}
        <button type="button" className="btn btn--sm af-add" onClick={() => onChange([...values, ''])}>
          + {addLabel}
        </button>
      </div>
    </Field>
  );
}

interface RowsProps<T> {
  label: string;
  items: T[];
  onChange: (items: T[]) => void;
  create: () => T;
  render: (item: T, patch: (changes: Partial<T>) => void, index: number) => ReactNode;
  itemTitle?: (item: T, index: number) => string;
  addLabel?: string;
  hint?: ReactNode;
}

/** Список объектов со своей формой для каждого элемента. */
export function Rows<T>({ label, items, onChange, create, render, itemTitle, addLabel = 'Добавить', hint }: RowsProps<T>) {
  return (
    <fieldset className="af-rows">
      <legend className="af-label">{label}</legend>
      {hint && <p className="af-hint">{hint}</p>}
      {items.map((item, i) => {
        const title = itemTitle?.(item, i) || `#${i + 1}`;
        return (
          <div key={i} className="af-rows__item">
            <div className="af-rows__head">
              <span className="af-rows__title">{title}</span>
              <ItemControls
                index={i}
                count={items.length}
                label={title}
                onMove={(to) => onChange(moveItem(items, i, to))}
                onRemove={() => onChange(items.filter((_, j) => j !== i))}
              />
            </div>
            <div className="af-rows__body">
              {render(item, (changes) => onChange(items.map((x, j) => (j === i ? { ...x, ...changes } : x))), i)}
            </div>
          </div>
        );
      })}
      <button type="button" className="btn btn--sm af-add" onClick={() => onChange([...items, create()])}>
        + {addLabel}
      </button>
    </fieldset>
  );
}

export function Section({ title, description, children }: { title: string; description?: ReactNode; children: ReactNode }) {
  return (
    <section className="adm-section">
      <header className="adm-section__head">
        <h2 className="adm-section__title">{title}</h2>
        {description && <p className="adm-section__desc">{description}</p>}
      </header>
      <div className="adm-section__body">{children}</div>
    </section>
  );
}

/** Два-три поля в строку на широком экране. */
export function Grid({ children, cols = 2 }: { children: ReactNode; cols?: 2 | 3 }) {
  return <div className={`af-grid af-grid--${cols}`}>{children}</div>;
}
