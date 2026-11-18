import { NamiLogo } from "./NamiLogo";
import { ResfriarLogo } from "./ResfriarLogo";

// Logo de Resfriar + "Uruguay", y al lado el de Nami (el distribuidor).
// Va sobre fondo oscuro (header y footer).
export function Wordmark({ className = "" }: { className?: string }) {
  return (
    <span className={`flex items-center gap-2 sm:gap-3 ${className}`}>
      <ResfriarLogo className="h-5 w-auto min-[420px]:h-6 sm:h-7" />
      <span className="heading pt-1 text-xs tracking-wider text-mint sm:text-sm">Uruguay</span>
      <span aria-hidden="true" className="h-6 w-px bg-white/20 sm:h-7" />
      <NamiLogo className="h-4 min-[420px]:h-5 sm:h-6" />
    </span>
  );
}
