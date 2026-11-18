"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useState, useSyncExternalStore } from "react";
import type { Pair } from "@/lib/data";

export type HeroSlide = {
  slug: string;
  categoryTitle: string;
  title: string;
  series: string | null;
  shortDescription: string;
  highlights: Pair[];
  image: string | null;
};

const INTERVAL_MS = 7000;

const REDUCED_MOTION = "(prefers-reduced-motion: reduce)";
function subscribeReducedMotion(onChange: () => void) {
  const mq = window.matchMedia(REDUCED_MOTION);
  mq.addEventListener("change", onChange);
  return () => mq.removeEventListener("change", onChange);
}
const getReducedMotion = () => window.matchMedia(REDUCED_MOTION).matches;

/**
 * Hero rotativo con las familias destacadas. Avanza solo cada 7 s; se frena
 * con el mouse encima, con el foco adentro, con el botón de pausa o si el
 * usuario pidió reducir el movimiento.
 */
export function HeroCarousel({ slides }: { slides: HeroSlide[] }) {
  const [index, setIndex] = useState(0);
  const [hovered, setHovered] = useState(false);
  const [paused, setPaused] = useState(false);
  const reducedMotion = useSyncExternalStore(subscribeReducedMotion, getReducedMotion, () => false);

  const count = slides.length;
  const go = useCallback((i: number) => setIndex(((i % count) + count) % count), [count]);

  const running = count > 1 && !hovered && !paused && !reducedMotion;
  useEffect(() => {
    if (!running) return;
    const t = setTimeout(() => go(index + 1), INTERVAL_MS);
    return () => clearTimeout(t);
  }, [running, index, go]);

  if (!count) return null;
  const s = slides[index];

  return (
    <div
      role="region"
      aria-roledescription="carrusel"
      aria-label="Productos destacados"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocus={() => setHovered(true)}
      onBlur={(e) => !e.currentTarget.contains(e.relatedTarget as Node) && setHovered(false)}
      onKeyDown={(e) => {
        if (e.key === "ArrowRight") go(index + 1);
        if (e.key === "ArrowLeft") go(index - 1);
      }}
    >
      <div
        key={s.slug}
        role="group"
        aria-roledescription="diapositiva"
        aria-label={`${index + 1} de ${count}: ${s.title}`}
        className="hero-slide grid items-center gap-4 md:grid-cols-2 md:gap-8"
      >
        <div className="min-w-0">
          <p className="heading text-sm text-mint">{s.categoryTitle}</p>
          <h2 className="heading mt-2 text-2xl text-balance sm:mt-3 sm:text-4xl lg:text-5xl">{s.title}</h2>
          {s.series && <p className="mt-2 text-sm text-white/60">{s.series}</p>}
          {s.shortDescription && <p className="mt-3 line-clamp-2 max-w-prose text-sm text-white/80 sm:mt-4 sm:line-clamp-none sm:text-base">{s.shortDescription}</p>}
          {s.highlights.length > 0 && (
            <dl className="mt-4 grid grid-cols-2 gap-x-6 gap-y-3 sm:mt-6 sm:grid-cols-3">
              {s.highlights.map((h, i) => (
                <div key={h.label} className={`min-w-0 border-l-2 border-blue pl-3 ${i > 1 ? "hidden sm:block" : ""}`}>
                  <dt className="text-xs uppercase tracking-wide text-white/60">{h.label}</dt>
                  <dd className="heading mt-0.5 whitespace-pre-line break-words text-sm sm:text-base">{h.value}</dd>
                </div>
              ))}
            </dl>
          )}
          <Link href={`/producto/${s.slug}`} className="btn-buy mt-5 bg-blue hover:bg-deep sm:mt-8">
            Ver más
          </Link>
        </div>
        <div className="relative order-first mx-auto aspect-[16/10] w-full max-w-sm md:order-none md:aspect-[4/3] md:max-w-lg">
          {s.image && (
            <Image
              src={s.image}
              alt={s.title}
              fill
              priority={index === 0}
              sizes="(min-width: 768px) 45vw, 90vw"
              className="object-contain drop-shadow-[0_20px_40px_rgba(0,0,0,0.45)]"
            />
          )}
        </div>
      </div>

      {count > 1 && (
        <div className="mt-6 flex items-center gap-3 sm:mt-8">
          <button
            type="button"
            onClick={() => go(index - 1)}
            aria-label="Anterior"
            className="grid size-9 place-items-center rounded-full border border-white/25 hover:border-mint hover:text-mint"
          >
            <span aria-hidden="true">‹</span>
          </button>
          <ol className="flex flex-wrap gap-2">
            {slides.map((sl, i) => (
              <li key={sl.slug}>
                <button
                  type="button"
                  onClick={() => go(i)}
                  aria-label={`Ver ${sl.title}`}
                  aria-current={i === index}
                  className={`h-2 rounded-full transition-all ${i === index ? "w-7 bg-mint" : "w-2 bg-white/35 hover:bg-white/70"}`}
                />
              </li>
            ))}
          </ol>
          <button
            type="button"
            onClick={() => go(index + 1)}
            aria-label="Siguiente"
            className="grid size-9 place-items-center rounded-full border border-white/25 hover:border-mint hover:text-mint"
          >
            <span aria-hidden="true">›</span>
          </button>
          {!reducedMotion && (
            <button
              type="button"
              onClick={() => setPaused((p) => !p)}
              aria-pressed={paused}
              className="ml-auto text-xs text-white/60 hover:text-white"
            >
              {paused ? "Reanudar" : "Pausar"}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
