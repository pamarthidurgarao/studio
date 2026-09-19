import { tokens } from '../data/studioData';
import { sectionLabel, tokenName, tokenRow, tokenValue } from '../styles/cn';

const ACCENT_RAMP = [100, 300, 500, 700, 900];

export function TokensPanel() {
  return (
    <div className="flex flex-col gap-3.5">
      <div className="flex flex-col gap-1.5">
        <div className={sectionLabel}>Accent ramp</div>
        <div className="flex gap-1">
          {ACCENT_RAMP.map((step) => (
            <div
              key={step}
              title={`accent-${step}`}
              className="flex-1 h-[26px] rounded-[5px] shadow-[var(--shadow-sm)]"
              style={{ background: `var(--color-accent-${step})` }}
            />
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-2.5">
        {tokens.map((t) => (
          <div className={tokenRow} key={t.name}>
            <span className="w-4 h-4 rounded flex-none" style={{ background: t.color }} />
            <span className={tokenName}>{t.name}</span>
            <span className={tokenValue}>{t.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
