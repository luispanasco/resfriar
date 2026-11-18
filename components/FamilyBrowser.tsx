"use client";

import { useMemo, useState } from "react";
import { FamilyCard, type FamilyCardData } from "./FamilyCard";

const isUniversal = (c: string) => c.toLowerCase() === "universal";
const byVoltage = (a: string, b: string) => parseFloat(a) - parseFloat(b) || a.localeCompare(b);

/**
 * Grilla de familias con filtros por compatibilidad y voltaje.
 * Cada filtro aparece solo si hay más de un valor para elegir.
 * Una familia "Universal" aparece en cualquier filtro de compatibilidad, y
 * "Universal" también es un filtro propio (va primero) que muestra solo esas.
 * Con `seriesFilter`, además se filtra por serie (ej. climatizadores: Serie 5, 6, 7, 8).
 */
export function FamilyBrowser({ families, seriesFilter = false }: { families: FamilyCardData[]; seriesFilter?: boolean }) {
  const [series, setSeries] = useState<string | null>(null);
  const [compat, setCompat] = useState<string | null>(null);
  const [volt, setVolt] = useState<string | null>(null);

  const seriesOptions = useMemo(
    () =>
      seriesFilter
        ? [...new Set(families.map((f) => f.series).filter((s): s is string => !!s))].sort((a, b) =>
            a.localeCompare(b, "es", { numeric: true }),
          )
        : [],
    [families, seriesFilter],
  );

  const compatOptions = useMemo(
    () => {
      const all = families.flatMap((f) => f.compatibility);
      const universal = all.find(isUniversal);
      const rest = [...new Set(all.filter((c) => !isUniversal(c)))].sort((a, b) => a.localeCompare(b, "es"));
      return universal ? [universal, ...rest] : rest;
    },
    [families],
  );
  const voltOptions = useMemo(() => [...new Set(families.flatMap((f) => f.voltages))].sort(byVoltage), [families]);

  // Con un vehículo elegido, primero los de ese vehículo y después los universales.
  const exact = (f: FamilyCardData) => !compat || f.compatibility.includes(compat);
  const visible = families
    .filter(
      (f) =>
        (!series || f.series === series) &&
        (exact(f) || (!isUniversal(compat!) && f.compatibility.some(isUniversal))) &&
        (!volt || f.voltages.includes(volt)),
    )
    .sort((a, b) => Number(exact(b)) - Number(exact(a)));

  return (
    <div>
      {(seriesOptions.length > 1 || compatOptions.length > 1 || voltOptions.length > 1) && (
        <div className="mb-6 space-y-3 rounded-xl bg-mist p-4">
          {seriesOptions.length > 1 && (
            <FilterGroup label="Serie" options={seriesOptions} value={series} onChange={setSeries} />
          )}
          {compatOptions.length > 1 && (
            <FilterGroup label="Compatibilidad" options={compatOptions} value={compat} onChange={setCompat} />
          )}
          {voltOptions.length > 1 && <FilterGroup label="Voltaje" options={voltOptions} value={volt} onChange={setVolt} />}
        </div>
      )}

      <p className="sr-only" aria-live="polite">
        {visible.length} {visible.length === 1 ? "producto" : "productos"}
      </p>

      {visible.length > 0 ? (
        <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {visible.map((f, i) => (
            <li key={f.slug}>
              <FamilyCard f={f} priority={i < 3} index={i} />
            </li>
          ))}
        </ul>
      ) : (
        <p className="rounded-xl border border-dashed border-black/15 p-8 text-center">
          No hay productos con esos filtros.{" "}
          <button
            type="button"
            className="font-semibold text-deep underline"
            onClick={() => {
              setSeries(null);
              setCompat(null);
              setVolt(null);
            }}
          >
            Ver todos
          </button>
        </p>
      )}
    </div>
  );
}

function FilterGroup({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: string[];
  value: string | null;
  onChange: (v: string | null) => void;
}) {
  const btn = (active: boolean) =>
    `rounded-full border px-3 py-1 text-sm transition ${
      active ? "border-deep bg-deep text-white" : "border-black/15 bg-white hover:border-deep"
    }`;
  return (
    <div role="group" aria-labelledby={`f-${label}`} className="flex flex-wrap items-center gap-2">
      <span id={`f-${label}`} className="heading mr-1 w-full text-xs text-night sm:w-auto">
        {label}
      </span>
      <button type="button" aria-pressed={value === null} className={btn(value === null)} onClick={() => onChange(null)}>
        Todos
      </button>
      {options.map((o) => (
        <button key={o} type="button" aria-pressed={value === o} className={btn(value === o)} onClick={() => onChange(o)}>
          {o}
        </button>
      ))}
    </div>
  );
}
