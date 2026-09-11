import type { Meta, StoryObj } from '@storybook/react';

const PRIMARY = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900] as const;

function Swatch({ name }: { name: string }) {
  return (
    <div style={{ textAlign: 'center' }}>
      <div
        style={{
          width: 64,
          height: 48,
          borderRadius: 8,
          border: '1px solid var(--color-border)',
          background: `var(${name})`,
        }}
      />
      <div style={{ fontSize: 11, marginTop: 4 }}>{name}</div>
    </div>
  );
}

function TokenShowcase() {
  return (
    <div style={{ display: 'grid', gap: 24, padding: 16 }}>
      <section>
        <h3>Primary</h3>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {PRIMARY.map((step) => (
            <Swatch key={step} name={`--color-primary-${step}`} />
          ))}
        </div>
      </section>
      <section>
        <h3>Accent (선라이즈 코럴)</h3>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {PRIMARY.map((step) => (
            <Swatch key={step} name={`--color-accent-${step}`} />
          ))}
        </div>
      </section>
      <section>
        <h3>Semantic</h3>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {[
            '--color-bg',
            '--color-surface',
            '--color-border',
            '--color-text-strong',
            '--color-text-muted',
            '--color-success',
            '--color-warning',
            '--color-danger',
          ].map((name) => (
            <Swatch key={name} name={name} />
          ))}
        </div>
      </section>
      <section>
        <h3>Typography</h3>
        <p className="text-display">Display 28 — 오늘도 좋은 하루</p>
        <p className="text-title">Title 22 — 오늘도 좋은 하루</p>
        <p className="text-heading">Heading 18 — 오늘도 좋은 하루</p>
        <p className="text-body">Body 16 — 오늘도 좋은 하루</p>
        <p className="text-caption">Caption 14 — 오늘도 좋은 하루</p>
        <p className="text-label">Label 12 — 오늘도 좋은 하루</p>
      </section>
      <section>
        <h3>Radius & Shadow</h3>
        <div style={{ display: 'flex', gap: 16 }}>
          <div className="rounded-card shadow-card" style={{ width: 120, height: 80, background: 'var(--color-surface)' }} />
          <div className="rounded-field shadow-floating" style={{ width: 120, height: 80, background: 'var(--color-surface)' }} />
        </div>
      </section>
    </div>
  );
}

const meta: Meta<typeof TokenShowcase> = {
  title: 'Design/Tokens',
  component: TokenShowcase,
};
export default meta;

export const All: StoryObj<typeof TokenShowcase> = {};
