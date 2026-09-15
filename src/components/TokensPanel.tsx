import { tokens } from '../data/studioData';

export function TokensPanel() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {tokens.map((t) => (
        <div className="studio-token-row" key={t.name}>
          <span className="studio-token-swatch" style={{ background: t.color }} />
          <span className="studio-token-name">{t.name}</span>
          <span className="studio-token-value">{t.value}</span>
        </div>
      ))}
    </div>
  );
}
