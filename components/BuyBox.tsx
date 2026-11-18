"use client";

import { useEffect, useRef, useState } from "react";
import type { Variant } from "@/lib/data";
import { buyUrl } from "@/lib/links";
import { WhatsAppIcon } from "./WhatsAppIcon";
import { WhatsAppPicker } from "./WhatsAppPicker";

type Props = { title: string; variants: Variant[]; message: string };

// Por defecto, la versión de 24 V (la de la mayoría de los camiones).
const defaultIndex = (vs: Variant[]) => Math.max(0, vs.findIndex((v) => v.voltage === "24 V"));

/**
 * Recuadro de compra: elegir la versión (12 V / 24 V / con filtro…) y un solo
 * botón Comprar. En el celular, cuando el recuadro sale de la pantalla, aparece
 * una barra fija abajo con la misma compra.
 */
export function BuyBox({ title, variants, message }: Props) {
  const [sel, setSel] = useState(() => defaultIndex(variants));
  const [boxVisible, setBoxVisible] = useState(true);
  const ref = useRef<HTMLDivElement>(null);
  const v = variants[sel];

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setBoxVisible(e.isIntersecting), { rootMargin: "-80px 0px 0px 0px" });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  if (!v) {
    return (
      <p className="rounded-2xl bg-white/10 p-5 text-sm text-white/80">
        Pronto vas a poder comprar este modelo en clima.nami.com.uy.
      </p>
    );
  }

  const buy = (
    <a
      href={buyUrl(v.code)}
      target="_blank"
      rel="noopener"
      className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-blue px-5 py-3 text-base font-semibold text-white transition hover:bg-deep"
      aria-label={`Comprar ${title} ${v.label} en clima.nami.com.uy (abre en una pestaña nueva)`}
    >
      Comprar
      <svg viewBox="0 0 16 16" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
        <path d="M6 3h7v7M13 3 4 12" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </a>
  );

  return (
    <>
      <div ref={ref} className="rounded-2xl bg-white p-5 text-slate shadow-xl shadow-black/30">
        {variants.length > 1 && (
          <fieldset>
            <legend className="text-xs font-semibold uppercase tracking-wide text-slate/70">Elegí la versión</legend>
            <div className="mt-2 flex flex-wrap gap-2">
              {variants.map((x, n) => (
                <button
                  key={x.code}
                  type="button"
                  onClick={() => setSel(n)}
                  aria-pressed={n === sel}
                  className={`heading rounded-lg border-2 px-4 py-2 text-base transition ${
                    n === sel ? "border-blue bg-blue/10 text-night" : "border-black/10 text-slate hover:border-blue/50"
                  }`}
                >
                  {x.label}
                </button>
              ))}
            </div>
          </fieldset>
        )}
        <p className={`text-sm ${variants.length > 1 ? "mt-4" : ""}`}>
          Código <span className="select-all font-mono font-semibold text-night">{v.code}</span>
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          {buy}
          <WhatsAppPicker
            message={message}
            className="inline-flex items-center justify-center gap-2 rounded-xl border-2 border-[#25D366] px-4 py-3 text-sm font-semibold text-night transition hover:bg-[#25D366]/10"
          >
            <WhatsAppIcon className="h-5 w-5 text-[#25D366]" />
            Consultar
          </WhatsAppPicker>
        </div>
        <p className="mt-3 text-xs text-slate/70">La compra se hace en clima.nami.com.uy, la tienda de Nami.</p>
      </div>

      {/* Barra fija en el celular cuando el recuadro no se ve */}
      <div
        className={`fixed inset-x-0 bottom-0 z-40 border-t border-black/10 bg-white/95 px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3 backdrop-blur transition-transform lg:hidden ${
          boxVisible ? "translate-y-full" : "translate-y-0"
        }`}
        aria-hidden={boxVisible}
      >
        <div className="flex items-center gap-3">
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-night">{title}</p>
            <p className="truncate text-xs text-slate/70">
              {v.label !== "Único" ? `${v.label} · ` : ""}
              {v.code}
            </p>
          </div>
          <a
            href={buyUrl(v.code)}
            target="_blank"
            rel="noopener"
            tabIndex={boxVisible ? -1 : 0}
            className="rounded-xl bg-blue px-5 py-2.5 text-sm font-semibold text-white"
          >
            Comprar
          </a>
        </div>
      </div>
    </>
  );
}
