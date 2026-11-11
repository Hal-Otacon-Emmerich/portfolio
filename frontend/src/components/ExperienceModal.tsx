import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import type { Experience } from '../api/types';
import { useI18n } from '../i18n/I18nProvider';
import { pad2 } from '../lib/sections';
import { Barcode } from './Barcode';

interface Props {
  items: Experience[];
  index: number;
  onIndexChange: (index: number) => void;
  onClose: () => void;
}

export function ExperienceModal({ items, index, onIndexChange, onClose }: Props) {
  const { t, tr } = useI18n();
  const closeRef = useRef<HTMLButtonElement>(null);
  const item = items[index];
  const prev = index > 0 ? items[index - 1] : null;
  const next = index < items.length - 1 ? items[index + 1] : null;
  const num = pad2(index + 1);

  // Блокируем прокрутку страницы, ставим фокус в модалку и возвращаем его при закрытии.
  useEffect(() => {
    const lastFocused = document.activeElement as HTMLElement | null;
    const { overflow } = document.body.style;
    document.body.style.overflow = 'hidden';
    closeRef.current?.focus();
    return () => {
      document.body.style.overflow = overflow;
      lastFocused?.focus();
    };
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft' && prev) onIndexChange(index - 1);
      if (e.key === 'ArrowRight' && next) onIndexChange(index + 1);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [index, prev, next, onClose, onIndexChange]);

  const blocks = [
    { n: '01', title: t('modal.task'), body: <p>{tr(item.task)}</p> },
    {
      n: '02',
      title: t('modal.done'),
      body: (
        <ul className="case__list">
          {item.done.map((d, i) => (
            <li key={i}>{tr(d)}</li>
          ))}
        </ul>
      ),
    },
    { n: '03', title: t('modal.challenge'), body: <p>{tr(item.challenge)}</p> },
    { n: '04', title: t('modal.learned'), body: <p>{tr(item.learned)}</p> },
  ];

  return createPortal(
    <div
      className="modal-backdrop"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="modal" role="dialog" aria-modal="true" aria-labelledby="case-title">
        <div className="modal__bar">
          <span>
            {item.id} / {t('modal.caseFile')}
          </span>
          <span className="modal__counter">{t('modal.record', { i: num, n: pad2(items.length) })}</span>
          <button ref={closeRef} type="button" className="modal__close" onClick={onClose}>
            {t('modal.close')} ×
          </button>
        </div>

        <div className="modal__body" key={item.id}>
          <aside className="case__side">
            <div className="case__side-head">
              <span>{t('modal.companyFile')}</span>
              <span>v.{num}</span>
            </div>
            <p className="case__num" aria-hidden="true">
              {num}
            </p>
            <span className="case__rule" aria-hidden="true" />
            <dl className="case__facts">
              {item.facts.map((f) => (
                <div key={tr(f.label)}>
                  <dt>{tr(f.label)}</dt>
                  <dd>{tr(f.value)}</dd>
                </div>
              ))}
            </dl>
            <p className="case__side-label">{t('modal.stack')}</p>
            <ul className="chips">
              {item.stack.map((s) => (
                <li key={s}>{s}</li>
              ))}
            </ul>
            <div className="case__verify">
              <Barcode value={item.verification} />
              <p>
                {item.verification} · {t('modal.verified')}
              </p>
            </div>
          </aside>

          <div className="case__main">
            <p className="case__eyebrow">{t('modal.role')}</p>
            <h2 id="case-title" className="case__title">
              {tr(item.role)}
              <br />
              {t('modal.at')} {tr(item.company)}
            </h2>
            <p className="case__pitch">{tr(item.pitch)}</p>

            <div className="metrics">
              {item.metrics.map((m) => (
                <div key={m.id} className="metrics__cell">
                  <p className="metrics__id">{m.id}</p>
                  <p className="metrics__value">{m.value}</p>
                  <p className="metrics__label">{tr(m.label)}</p>
                </div>
              ))}
            </div>

            <div className="case__blocks">
              {blocks.map((b) => (
                <div key={b.n} className="case__block">
                  <h3 className="case__block-title">
                    <span className="tag">{b.n}</span>
                    {b.title}
                  </h3>
                  {b.body}
                </div>
              ))}
            </div>

            <p className="case__eyebrow case__eyebrow--ink">{t('modal.timeline')}</p>
            <ol className="timeline">
              {item.timeline.map((ev, i) => (
                <li
                  key={i}
                  className={`timeline__item${ev.current ? ' is-current' : ''}${i === 0 && !ev.current ? ' is-start' : ''}`}
                >
                  <span className="timeline__mark" aria-hidden="true" />
                  <span className="timeline__date">{tr(ev.date)}</span>
                  <span className="timeline__label">{tr(ev.label)}</span>
                </li>
              ))}
            </ol>

            <div className="case__foot">
              {item.recommendationUrl ? (
                <a href={item.recommendationUrl} target="_blank" rel="noopener noreferrer" className="case__ref">
                  {t('modal.recommendation')} ↗
                </a>
              ) : (
                <span className="case__ref">{t('modal.recommendation')} ↗</span>
              )}
              <div className="case__nav">
                <button
                  type="button"
                  className="btn btn--lg"
                  disabled={!prev}
                  onClick={() => onIndexChange(index - 1)}
                >
                  ← {t('modal.prev')}
                </button>
                <button
                  type="button"
                  className="btn btn--lg btn--ink"
                  disabled={!next}
                  onClick={() => onIndexChange(index + 1)}
                >
                  {t('modal.next')}
                  {next ? `: ${next.id}` : ''} →
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}
