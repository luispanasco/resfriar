"use client";

import Image from "next/image";
import { useState, type KeyboardEvent } from "react";
import { ImagePlaceholder } from "./ImagePlaceholder";

/**
 * Galería de la ficha, pensada para fondo oscuro: imagen principal con flechas
 * y contador, y miniaturas abajo. Las miniaturas son botones; ← → cambian de imagen.
 */
export function Gallery({ images, title }: { images: string[]; title: string }) {
  const [i, setI] = useState(0);
  const current = images[i];
  const count = images.length;

  if (!current) {
    return (
      <div className="aspect-[16/11] overflow-hidden rounded-2xl lg:aspect-square">
        <ImagePlaceholder label={title} />
      </div>
    );
  }

  const go = (n: number) => setI((n + count) % count);
  const onKey = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
    e.preventDefault();
    const next = (i + (e.key === "ArrowRight" ? 1 : -1) + count) % count;
    setI(next);
    document.getElementById(`thumb-${next}`)?.focus();
  };

  const arrow = "absolute top-1/2 grid size-10 -translate-y-1/2 place-items-center rounded-full bg-white/10 text-xl text-white backdrop-blur transition hover:bg-white/25";

  return (
    <div>
      <div className="relative aspect-[16/11] overflow-hidden rounded-2xl bg-[radial-gradient(circle_at_50%_45%,rgba(0,148,230,0.35),transparent_65%)] lg:aspect-square">
        <Image
          key={current}
          src={current}
          alt={count > 1 ? `${title}, imagen ${i + 1} de ${count}` : title}
          fill
          priority
          sizes="(min-width: 1024px) 50vw, 100vw"
          className="hero-slide object-contain p-6 drop-shadow-[0_24px_40px_rgba(0,0,0,0.5)]"
        />
        {count > 1 && (
          <>
            <button type="button" onClick={() => go(i - 1)} aria-label="Imagen anterior" className={`${arrow} left-3`}>
              <span aria-hidden="true">‹</span>
            </button>
            <button type="button" onClick={() => go(i + 1)} aria-label="Imagen siguiente" className={`${arrow} right-3`}>
              <span aria-hidden="true">›</span>
            </button>
            <span className="absolute bottom-3 right-3 rounded-full bg-black/40 px-2.5 py-0.5 text-xs tabular-nums text-white">
              {i + 1} / {count}
            </span>
          </>
        )}
      </div>
      {count > 1 && (
        <div
          role="group"
          aria-label="Imágenes del producto (flechas para navegar)"
          className="mt-3 hidden gap-2 overflow-x-auto p-1 sm:flex"
          onKeyDown={onKey}
        >
          {images.map((src, n) => (
            <button
              key={src}
              id={`thumb-${n}`}
              type="button"
              onClick={() => setI(n)}
              aria-label={`Ver imagen ${n + 1}`}
              aria-current={n === i}
              className={`relative size-16 shrink-0 overflow-hidden rounded-lg border-2 bg-white/5 transition ${
                n === i ? "border-mint" : "border-white/10 hover:border-white/40"
              }`}
            >
              <Image src={src} alt="" fill sizes="64px" className="object-contain p-1" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
