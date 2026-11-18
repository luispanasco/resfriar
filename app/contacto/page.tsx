import type { Metadata } from "next";
import { WhatsAppIcon } from "@/components/WhatsAppIcon";
import { WhatsAppPicker } from "@/components/WhatsAppPicker";
import {
  DEFAULT_MESSAGE,
  EMAIL,
  LOCATIONS,
  formatPhone,
  whatsappUrl,
} from "@/lib/contacts";

export const metadata: Metadata = {
  title: "Contacto",
  description:
    "Locales y vendedores de Nami, distribuidor oficial y exclusivo de Resfriar en Uruguay. Consultas de venta y técnicas por WhatsApp.",
  alternates: { canonical: "/contacto" },
};

export default function ContactPage() {
  return (
    <div className="container-rf py-12 md:py-16">
      <p className="heading text-sm text-deep">Contacto</p>
      <h1 className="heading mt-2 text-3xl text-night sm:text-4xl">Hablá con un vendedor</h1>
      <p className="mt-3 max-w-prose">
        Te asesoramos para elegir el equipo, con la instalación y con cualquier consulta técnica. Escribile por WhatsApp
        a cualquiera de los vendedores o vení a uno de nuestros locales.
      </p>

      <div className="mt-6 flex flex-wrap gap-3">
        <WhatsAppPicker className="btn-buy gap-2">
          <WhatsAppIcon className="h-5 w-5" />
          Escribinos por WhatsApp
        </WhatsAppPicker>
        <a
          href={`mailto:${EMAIL}`}
          className="inline-flex items-center rounded-lg border border-black/15 px-4 py-2 text-sm font-semibold hover:border-deep hover:text-deep"
        >
          {EMAIL}
        </a>
      </div>

      <div className="mt-12 grid gap-6 lg:grid-cols-2">
        {LOCATIONS.map((loc) => (
          <section key={loc.slug} aria-labelledby={`loc-${loc.slug}`} className="rounded-xl border border-black/10 bg-white">
            <div className="rounded-t-xl border-t-4 border-blue bg-mist p-5">
              <h2 id={`loc-${loc.slug}`} className="heading text-xl text-night">
                {loc.name}
              </h2>
              <p className="mt-1">{loc.address}</p>
              <a
                href={loc.mapsUrl}
                target="_blank"
                rel="noopener"
                className="mt-2 inline-block text-sm font-semibold text-deep hover:underline"
              >
                Cómo llegar →
              </a>
            </div>
            <ul className="divide-y divide-black/10">
              {loc.sellers.map((s) => (
                <li key={s.phone} className="flex flex-wrap items-center justify-between gap-3 px-5 py-3">
                  <div>
                    <p className="font-semibold text-night">{s.name}</p>
                    <p className="text-sm text-slate/80">
                      Ventas · <span className="select-all tabular-nums">{formatPhone(s.phone)}</span>
                    </p>
                  </div>
                  <a
                    href={whatsappUrl(s.phone, DEFAULT_MESSAGE)}
                    target="_blank"
                    rel="noopener"
                    className="inline-flex items-center gap-1.5 rounded-lg bg-[#25D366] px-3 py-1.5 text-sm font-semibold text-night hover:brightness-95"
                    aria-label={`WhatsApp a ${s.name} (abre en una pestaña nueva)`}
                  >
                    <WhatsAppIcon />
                    WhatsApp
                  </a>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </div>
  );
}
