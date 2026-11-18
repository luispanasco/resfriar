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
      className="group flex h-full flex-row overflow-hidden rounded-xl border border-black/10 bg-white transition hover:border-blue hover:shadow-lg sm:flex-col"
    >
      <div className="relative aspect-square w-32 shrink-0 self-start bg-mist sm:aspect-[4/3] sm:w-auto sm:self-auto">
        {count ? (
          f.images.map((src, i) => (
            <Image
              key={src}
              src={src}
              alt={i === current ? f.title : ""}
              fill
              priority={priority && i === 0}
              loading={priority && i === 0 ? undefined : "lazy"}
              sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 128px"
              className={`object-contain p-2 transition-opacity sm:p-4 duration-700 ${i === current ? "opacity-100" : "opacity-0"}`}
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
      <div className="flex min-w-0 flex-1 flex-col gap-1.5 p-3 sm:gap-2 sm:p-4">
        {f.series && <p className="text-xs font-semibold uppercase tracking-wide text-deep">{f.series}</p>}
        <h3 className="heading text-base text-night sm:text-lg">{f.title}</h3>
        {f.summary && <p className="hidden text-sm text-slate/90 sm:line-clamp-2">{f.summary}</p>}
        {f.highlights.length > 0 && (
          <dl className="hidden grid-cols-2 gap-2 pt-1 sm:grid">
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
          <ul className="mt-auto flex flex-wrap gap-1.5 pt-1 sm:pt-2" aria-label="Compatibilidad">
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
