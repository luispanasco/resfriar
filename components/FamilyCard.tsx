"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState, useSyncExternalStore } from "react";
import type { Pair } from "@/lib/data";
import { ImagePlaceholder } from "./ImagePlaceholder";

export type FamilyCardData = {
  slug: string;
  title: string;
  series: string | null;
  images: string[];
  summary: string;
  highlights: Pair[];
  voltages: string[];
  compatibility: string[];
};

const INTERVAL_MS = 3500;

const REDUCED_MOTION = "(prefers-reduced-motion: reduce)";
function subscribeReducedMotion(onChange: () => void) {
  const mq = window.matchMedia(REDUCED_MOTION);
  mq.addEventListener("change", onChange);
  return () => mq.removeEventListener("change", onChange);
}
const getReducedMotion = () => window.matchMedia(REDUCED_MOTION).matches;

/**
 * Tarjeta de familia. Si tiene varias fotos, van pasando solas (cada tarjeta
 * arranca desfasada según `index` para que no cambien todas juntas); se frena
 * con el mouse encima o si el usuario pidió reducir el movimiento.
 */
export function FamilyCard({ f, priority = false, index = 0 }: { f: FamilyCardData; priority?: boolean; index?: number }) {
  const [current, setCurrent] = useState(0);
  const [hovered, setHovered] = useState(false);
  const reducedMotion = useSyncExternalStore(subscribeReducedMotion, getReducedMotion, () => true);
  const count = f.images.length;

  const running = count > 1 && !hovered && !reducedMotion;
  useEffect(() => {
    if (!running) return;
    const delay = current === 0 ? INTERVAL_MS + (index % 4) * 700 : INTERVAL_MS;
    const t = setTimeout(() => setCurrent((c) => (c + 1) % count), delay);
    return () => clearTimeout(t);
  }, [running, current, count, index]);

  return (
    <Link
      href={`/producto/${f.slug}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="group flex h-full flex-col overflow-hidden rounded-xl border border-black/10 bg-white transition hover:border-blue hover:shadow-lg"
    >
      <div className="relative aspect-[4/3] bg-mist">
        {count ? (
          f.images.map((src, i) => (
            <Image
              key={src}
              src={src}
              alt={i === current ? f.title : ""}
              fill
              priority={priority && i === 0}
              loading={priority && i === 0 ? undefined : "lazy"}
              sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
              className={`object-contain p-4 transition-opacity duration-700 ${i === current ? "opacity-100" : "opacity-0"}`}
            />
          ))
        ) : (
          <ImagePlaceholder />
        )}
        {count > 1 && (
          <span className="absolute bottom-2 left-1/2 flex -translate-x-1/2 gap-1" aria-hidden="true">
            {f.images.map((src, i) => (
              <span key={src} className={`h-1.5 rounded-full transition-all ${i === current ? "w-4 bg-deep" : "w-1.5 bg-black/20"}`} />
            ))}
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-2 p-4">
        {f.series && <p className="text-xs font-semibold uppercase tracking-wide text-deep">{f.series}</p>}
        <h3 className="heading text-lg text-night">{f.title}</h3>
        {f.summary && <p className="line-clamp-2 text-sm text-slate/90">{f.summary}</p>}
        {f.highlights.length > 0 && (
          <dl className="grid grid-cols-2 gap-2 pt-1">
            {f.highlights.map((h) => (
              <div key={h.label} className="min-w-0 rounded-md bg-mist px-2 py-1.5">
                <dt className="truncate text-[0.65rem] uppercase tracking-wide text-slate/70">{h.label}</dt>
                <dd className="heading truncate text-sm text-night">{h.value}</dd>
              </div>
            ))}
          </dl>
        )}
        {f.voltages.length > 0 && (
          <p className="text-sm font-semibold text-deep">
            <span className="sr-only">Voltajes: </span>
            {f.voltages.join(" · ")}
          </p>
        )}
        {f.compatibility.length > 0 && (
          <ul className="mt-auto flex flex-wrap gap-1.5 pt-2" aria-label="Compatibilidad">
            {f.compatibility.map((c) => (
              <li key={c} className="chip">
                {c}
              </li>
            ))}
          </ul>
        )}
      </div>
    </Link>
  );
}
