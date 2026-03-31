/**
 * @contract UX-002, 12-departments-spec §8, BR-017
 * Color picker: hex input + swatch palette + preview circle + badge preview.
 */

import { DEFAULT_SWATCHES, isValidHexColor } from '../types/departments.types.js';

interface ColorPickerProps {
  value: string | null;
  onChange: (cor: string | null) => void;
  error?: string;
}

export function ColorPicker({ value, onChange, error }: ColorPickerProps) {
  const isInvalid = value !== null && value !== '' && !isValidHexColor(value);

  return (
    <div>
      <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-wider text-[#888]">
        COR
      </label>
      <div className="flex items-center gap-3">
        <input
          type="text"
          value={value ?? ''}
          onChange={(e) => {
            const v = e.target.value;
            onChange(v === '' ? null : v);
          }}
          placeholder="#000000"
          maxLength={7}
          className={`h-[42px] w-[120px] rounded-lg border px-3.5 text-sm font-medium text-[#111] placeholder:text-[#CCC] ${
            isInvalid || error
              ? 'border-[#E74C3C] focus:ring-[#E74C3C]'
              : 'border-[#E8E8E6] focus:ring-[#2E86C1]'
          } focus:outline-none focus:ring-1`}
        />
        <span
          className="h-6 w-6 rounded-full border border-[#E8E8E6]"
          style={{
            backgroundColor: value && isValidHexColor(value) ? value : '#E8E8E6',
          }}
        />
        <div className="flex gap-1.5">
          {DEFAULT_SWATCHES.map((swatch) => (
            <button
              key={swatch}
              type="button"
              onClick={() => onChange(swatch)}
              className={`h-6 w-6 rounded cursor-pointer ${
                value === swatch ? 'ring-2 ring-[#111] ring-offset-1' : ''
              }`}
              style={{ backgroundColor: swatch }}
              aria-label={`Selecionar cor ${swatch}`}
            />
          ))}
        </div>
      </div>
      {(isInvalid || error) && (
        <p className="mt-1 text-[11px] font-medium text-[#E74C3C]">
          {error ?? 'Formato de cor inválido. Use #RRGGBB.'}
        </p>
      )}
    </div>
  );
}
