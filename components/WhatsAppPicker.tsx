"use client";

import { useId, useRef, type ReactNode } from "react";
import { DEFAULT_MESSAGE, LOCATIONS, formatPhone, whatsappUrl } from "@/lib/contacts";
import { WhatsAppIcon } from "./WhatsAppIcon";

/**
 * Botón de WhatsApp que abre un diálogo para elegir con qué vendedor hablar
 * (agrupados por local). El mensaje sale ya escrito (`message`).
 */
export function WhatsAppPicker({
  children,
  className = "",
  message = DEFAULT_MESSAGE,
  label,
}: {
  children: ReactNode;
  className?: string;
  message?: string;
  label?: string;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();

  return (
    <>
      <button type="button" onClick={() => ref.current?.showModal()} className={className} aria-haspopup="dialog" aria-label={label}>
        {children}
      </button>

      <dialog
        ref={ref}
        aria-labelledby={titleId}
        onClick={(e) => e.target === ref.current && ref.current?.close()}
        className="m-0 mt-auto w-full max-w-none rounded-t-2xl bg-white p-0 text-slate shadow-2xl backdrop:bg-night/60 backdrop:backdrop-blur-sm sm:m-auto sm:max-w-md sm:rounded-2xl"
      >
        <div className="flex items-center justify-between gap-4 border-b border-black/10 px-5 py-4">
          <h2 id={titleId} className="heading text-lg text-night">
            ¿Con quién querés hablar?
          </h2>
          <button
            type="button"
            onClick={() => ref.current?.close()}
            aria-label="Cerrar"
            className="grid size-8 place-items-center rounded-full text-xl text-slate/70 hover:bg-mist"
          >
            <span aria-hidden="true">×</span>
          </button>
        </div>
        <div className="max-h-[70vh] overflow-y-auto px-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-3">
          {LOCATIONS.map((loc) => (
            <section key={loc.slug} aria-label={loc.name} className="py-2">
              <h3 className="text-xs font-semibold uppercase tracking-wide text-slate/70">
                {loc.name} · <span className="normal-case tracking-normal">{loc.address}</span>
              </h3>
              <ul className="mt-2 space-y-1.5">
                {loc.sellers.map((s) => (
                  <li key={s.phone}>
                    <a
                      href={whatsappUrl(s.phone, message)}
                      target="_blank"
                      rel="noopener"
                      onClick={() => ref.current?.close()}
                      className="flex items-center justify-between gap-3 rounded-xl border border-black/10 px-4 py-3 transition hover:border-[#25D366] hover:bg-[#25D366]/10"
                    >
                      <span>
                        <span className="block font-semibold text-night">{s.name}</span>
                        <span className="text-sm tabular-nums text-slate/70">{formatPhone(s.phone)}</span>
                      </span>
                      <WhatsAppIcon className="h-6 w-6 shrink-0 text-[#25D366]" />
                    </a>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      </dialog>
    </>
  );
}
