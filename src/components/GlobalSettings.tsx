import { CITIES } from '../constants/cities';
import type { GlobalSettings } from '../types';
import { QUALITY_LABELS } from '../utils/calculations';

interface Props {
  settings: GlobalSettings;
  onChange: (s: GlobalSettings) => void;
}

const QUALITY_LEVELS = [1, 2, 3, 4, 5] as const;

export default function GlobalSettingsBar({ settings, onChange }: Props) {
  const set = <K extends keyof GlobalSettings>(key: K, value: GlobalSettings[K]) =>
    onChange({ ...settings, [key]: value });

  return (
    <div className="flex flex-wrap items-center gap-4 bg-albion-card border border-albion-border rounded-lg px-4 py-3">
      {/* Server */}
      <div className="flex items-center gap-2">
        <label className="text-xs text-gray-400 uppercase tracking-wide">Serveur</label>
        <select
          value={settings.server}
          onChange={(e) => set('server', e.target.value as 'west' | 'east')}
          className="bg-albion-dark border border-albion-border text-gray-100 text-sm rounded px-2 py-1 focus:outline-none focus:border-albion-gold"
        >
          <option value="west">Europe / Amérique</option>
          <option value="east">Asie / Océanie</option>
        </select>
      </div>

      {/* TODO: language selector (hidden until translations are complete) */}

      {/* City */}
      <div className="flex items-center gap-2">
        <label className="text-xs text-gray-400 uppercase tracking-wide">Ville</label>
        <select
          value={settings.city}
          onChange={(e) => set('city', e.target.value)}
          className="bg-albion-dark border border-albion-border text-gray-100 text-sm rounded px-2 py-1 focus:outline-none focus:border-albion-gold"
        >
          {CITIES.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>

      {/* Quality */}
      <div className="flex items-center gap-2">
        <label className="text-xs text-gray-400 uppercase tracking-wide">Qualité</label>
        <select
          value={settings.quality}
          onChange={(e) => set('quality', Number(e.target.value) as GlobalSettings['quality'])}
          className="bg-albion-dark border border-albion-border text-gray-100 text-sm rounded px-2 py-1 focus:outline-none focus:border-albion-gold"
        >
          {QUALITY_LEVELS.map((q) => (
            <option key={q} value={q}>{QUALITY_LABELS[q]}</option>
          ))}
        </select>
      </div>

      {/* Mastery */}
      <div className="flex items-center gap-2">
        <label className="text-xs text-gray-400 uppercase tracking-wide" title="Niveau du nœud Maîtrise (0-100). La Maîtrise s'applique globalement à toutes les pièces (+0.2 IP/niveau).">
          Maîtrise
        </label>
        <input
          type="number"
          min={0}
          max={100}
          value={settings.mastery}
          onChange={(e) => set('mastery', Math.min(100, Math.max(0, Number(e.target.value))))}
          className="w-16 bg-albion-dark border border-albion-border text-gray-100 text-sm rounded px-2 py-1 text-center focus:outline-none focus:border-albion-gold"
        />
      </div>

      {/* Other spec bonus */}
      <div className="flex items-center gap-2">
        <label
          className="text-xs text-gray-400 uppercase tracking-wide"
          title="Bonus des autres nœuds de la branche. Calcul manuel : Σ(spec non-artifact × 0.2) + Σ(spec artifact × 0.1)"
        >
          Bonus autres specs
        </label>
        <input
          type="number"
          min={0}
          step={0.1}
          value={settings.otherSpecBonus}
          onChange={(e) => set('otherSpecBonus', Math.max(0, Number(e.target.value)))}
          className="w-20 bg-albion-dark border border-albion-border text-gray-100 text-sm rounded px-2 py-1 text-center focus:outline-none focus:border-albion-gold"
        />
      </div>

    </div>
  );
}
