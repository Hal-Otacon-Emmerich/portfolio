import type { ReactNode } from 'react';

export function SectionHead({ id, number, title, meta }: { id: string; number: string; title: string; meta: ReactNode }) {
  return (
    <div className="section-head">
      <h2 id={id} className="section-head__title">
        {number} / {title}
      </h2>
      <span className="label">{meta}</span>
    </div>
  );
}
