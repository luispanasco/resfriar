"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { buyUrl } from "@/lib/links";
import { ImagePlaceholder } from "./ImagePlaceholder";

export type FinderVariant = { code: string; label: string; voltage: string | null };
export type FinderFamily = {
  slug: string;
  categorySlug: string;
  title: string;
  series: string | null;
  image: string | null;
  compatibility: string[];
  variants: FinderVariant[];
};
export type FinderCategory = { slug: string; title: string };
export type FinderAnswers = { que?: string; vehiculo?: string; voltaje?: string };

// Compatibilidades que sirven para cualquier vehículo.
const GENERIC = ["universal", "portátil"];
const isGeneric = (c: string) => GENERIC.includes(c.toLowerCase());
const OTHER_VEHICLE = "otro";
const ANY_VOLTAGE = "no-se";

// Cómo se nombra cada categoría dentro de la frase ("Busco una heladera…").
const SINGULAR: Record<string, string> = {
  climatizadores: "un climatizador",
  "aire-acondicionado": "un aire acondicionado",
  heladeras: "una heladera",
};
const singular = (c: FinderCategory) => SINGULAR[c.slug] ?? c.title.toLowerCase();

const VOLTAGE_HINT: Record<string, string> = {
  "24 V": "La mayoría de los camiones",
  "12 V": "Camionetas, utilitarios y algunos camiones",
};

/**
 * Buscador guiado: qué buscás → para qué vehículo → voltaje. Arma la frase con
 * las respuestas y muestra primero lo hecho para ese vehículo y después lo
 * universal. Las respuestas viajan en la URL para poder compartir el resultado.
 */
export function ProductFinder({
  categories,
  families,
  initial,
}: {
  categories: FinderCategory[];
  families: FinderFamily[];
  initial: FinderAnswers;
}) {
  const [a, setA] = useState<FinderAnswers>(initial);

  useEffect(() => {
    const qs = new URLSearchParams(Object.entries(a).filter(([, v]) => v) as [string, string][]).toString();
    window.history.replaceState(null, "", qs ? `?${qs}` : window.location.pathname);
  }, [a]);

  const category = categories.find((c) => c.slug === a.que);
  const inCategory = useMemo(() => families.filter((f) => f.categorySlug === a.que), [families, a.que]);

  const vehicles = useMemo(() => {
    const all = inCategory.flatMap((f) => f.compatibility);
    return [...new Set(all.filter((c) => !isGeneric(c)))].sort((x, y) => x.localeCompare(y, "es"));
  }, [inCategory]);
  const hasGeneric = inCategory.some((f) => f.compatibility.some(isGeneric));

  // Familias para el vehículo elegido: exactas primero, después las universales.
  const byVehicle = useMemo(() => {
    if (!a.vehiculo) return { exact: [], generic: [] };
    const generic = inCategory.filter((f) => f.compatibility.some(isGeneric));
    if (a.vehiculo === OTHER_VEHICLE) return { exact: [], generic };
    const exact = inCategory.filter((f) => f.compatibility.includes(a.vehiculo!));
    return { exact, generic: generic.filter((f) => !exact.includes(f)) };
  }, [inCategory, a.vehiculo]);

  const voltages = useMemo(() => {
    const set = new Set(
      [...byVehicle.exact, ...byVehicle.generic].flatMap((f) => f.variants.map((v) => v.voltage)).filter(Boolean) as string[],
    );
    return [...set].sort((x, y) => parseFloat(y) - parseFloat(x)); // 24 V primero
  }, [byVehicle]);
  const askVoltage = voltages.length > 1;

  const step = !category ? 1 : !a.vehiculo ? 2 : askVoltage && !a.voltaje ? 3 : 4;

  const pickVoltage = (f: FinderFamily) => {
    const v = a.voltaje && a.voltaje !== ANY_VOLTAGE ? a.voltaje : null;
    const variants = v ? f.variants.filter((x) => !x.voltage || x.voltage === v) : f.variants;
    return variants.length ? { ...f, variants } : null;
  };
  const exact = byVehicle.exact.map(pickVoltage).filter((f): f is FinderFamily => !!f);
  const generic = byVehicle.generic.map(pickVoltage).filter((f): f is FinderFamily => !!f);

  const vehicleLabel = a.vehiculo === OTHER_VEHICLE ? "otro vehículo" : a.vehiculo;
  const voltageLabel = a.voltaje && a.voltaje !== ANY_VOLTAGE ? a.voltaje : null;

  return (
    <div>
      {/* La frase */}
      <p className="heading text-2xl leading-snug text-night sm:text-3xl" aria-live="polite">
        Busco{" "}
        <Slot active={step === 1} onClick={() => setA({})} filled={category ? singular(category) : null} placeholder="…" />
        {category && (
          <>
            {" "}para{" "}
            <Slot
              active={step === 2}
              onClick={() => setA({ que: a.que })}
              filled={vehicleLabel ?? null}
              placeholder="…"
            />
          </>
        )}
        {category && a.vehiculo && askVoltage && (
          <>
            {" "}de{" "}
            <Slot
              active={step === 3}
              onClick={() => setA({ que: a.que, vehiculo: a.vehiculo })}
              filled={a.voltaje ? (voltageLabel ?? "cualquier voltaje") : null}
              placeholder="…"
            />
          </>
        )}
      </p>

      {/* Pasos */}
      <div className="mt-8">
        {step === 1 && (
          <Question title="¿Qué buscás?">
            {categories.map((c) => (
              <Option key={c.slug} onClick={() => setA({ que: c.slug })} title={c.title} />
            ))}
          </Question>
        )}

        {step === 2 && (
          <Question title="¿Para qué vehículo?">
            {vehicles.map((v) => (
              <Option key={v} onClick={() => setA({ que: a.que, vehiculo: v })} title={v} />
            ))}
            {hasGeneric && (
              <Option
                onClick={() => setA({ que: a.que, vehiculo: OTHER_VEHICLE })}
                title="Otro / no está en la lista"
                hint={a.que === "heladeras" ? "Te mostramos las portátiles y las universales" : "Te mostramos los modelos universales"}
              />
            )}
          </Question>
        )}

        {step === 3 && (
          <Question title="¿De qué voltaje?">
            {voltages.map((v) => (
              <Option
                key={v}
                onClick={() => setA({ ...a, voltaje: v })}
                title={v}
                hint={VOLTAGE_HINT[v]}
                recommended={v === "24 V"}
              />
            ))}
            <Option onClick={() => setA({ ...a, voltaje: ANY_VOLTAGE })} title="No sé" hint="Te mostramos todos" />
          </Question>
        )}

        {step === 4 && (
          <div className="space-y-10">
            {exact.length + generic.length === 0 ? (
              <p className="rounded-xl border border-dashed border-black/15 p-6">
                No encontramos un equipo para esa combinación.{" "}
                <button type="button" className="font-semibold text-deep underline" onClick={() => setA({ que: a.que })}>
                  Probá con otro vehículo
                </button>
                .
              </p>
            ) : (
              <>
                {exact.length > 0 && (
                  <Results title={`Para ${vehicleLabel}`} families={exact} voltage={voltageLabel} />
                )}
                {generic.length > 0 && (
                  <Results
                    title={exact.length ? "También te sirven" : "Modelos que se adaptan a cualquier vehículo"}
                    families={generic}
                    voltage={voltageLabel}
                  />
                )}
              </>
            )}
            <button
              type="button"
              onClick={() => setA({})}
              className="text-sm font-semibold text-deep underline-offset-2 hover:underline"
            >
              Empezar de nuevo
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function Slot({
  active,
  filled,
  placeholder,
  onClick,
}: {
  active: boolean;
  filled: string | null;
  placeholder: string;
  onClick: () => void;
}) {
  if (!filled) {
    return (
      <span className={`inline-block min-w-16 border-b-4 ${active ? "border-blue" : "border-black/15"} text-black/30`}>
        {placeholder}
      </span>
    );
  }
  return (
    <button
      type="button"
      onClick={onClick}
      className="heading border-b-4 border-blue text-blue hover:border-deep hover:text-deep"
      aria-label={`Cambiar: ${filled}`}
    >
      {filled}
    </button>
  );
}

function Question({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <fieldset>
      <legend className="heading text-lg text-night">{title}</legend>
      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{children}</div>
    </fieldset>
  );
}

function Option({
  title,
  hint,
  recommended = false,
  onClick,
}: {
  title: string;
  hint?: string;
  recommended?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex flex-col items-start gap-1 rounded-xl border-2 bg-white p-4 text-left transition hover:border-blue hover:bg-mist ${
        recommended ? "border-blue/60" : "border-black/10"
      }`}
    >
      <span className="flex w-full items-center justify-between gap-2">
        <span className="heading text-lg text-night">{title}</span>
        {recommended && <span className="chip">Recomendado</span>}
      </span>
      {hint && <span className="text-sm text-slate/80">{hint}</span>}
    </button>
  );
}

function Results({ title, families, voltage }: { title: string; families: FinderFamily[]; voltage: string | null }) {
  return (
    <section aria-label={title}>
      <h2 className="heading text-xl text-night">
        {title} <span className="text-base font-normal text-slate/70">({families.length})</span>
      </h2>
      <ul className="mt-4 grid gap-4 lg:grid-cols-2">
        {families.map((f) => (
          <li key={f.slug} className="flex gap-4 rounded-xl border border-black/10 bg-white p-4">
            <Link href={`/producto/${f.slug}`} className="relative aspect-square w-24 shrink-0 overflow-hidden rounded-lg bg-mist sm:w-32">
              {f.image ? (
                <Image src={f.image} alt={f.title} fill sizes="128px" className="object-contain p-2" />
              ) : (
                <ImagePlaceholder />
              )}
            </Link>
            <div className="flex min-w-0 flex-1 flex-col gap-2">
              {f.series && <p className="text-xs font-semibold uppercase tracking-wide text-deep">{f.series}</p>}
              <Link href={`/producto/${f.slug}`} className="heading text-base text-night hover:text-deep">
                {f.title}
              </Link>
              <ul className="space-y-1.5">
                {f.variants.map((v) => (
                  <li key={v.code} className="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-mist px-3 py-1.5 text-sm">
                    <span className="min-w-0">
                      <code className="break-all font-semibold">{v.code}</code>
                      {!voltage && v.label !== "Único" && <span className="text-slate/80"> · {v.label}</span>}
                    </span>
                    <a href={buyUrl(v.code)} target="_blank" rel="noopener" className="btn-buy !px-3 !py-1 text-xs">
                      Comprar
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
