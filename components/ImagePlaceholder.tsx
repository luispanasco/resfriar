/** Placeholder de marca para familias sin fotos todavía. */
export function ImagePlaceholder({ label, className = "" }: { label?: string; className?: string }) {
  return (
    <div
      className={`flex h-full w-full flex-col items-center justify-center gap-2 bg-gradient-to-br from-mist to-[#dfe9f1] text-slate/50 ${className}`}
      role="img"
      aria-label={label ? `${label}: imagen no disponible` : "Imagen no disponible"}
    >
      <svg viewBox="0 0 48 48" className="h-10 w-10" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
        <path d="M24 6v36M8.4 15l31.2 18M8.4 33l31.2-18M24 6l-4 4m4-4 4 4M24 42l-4-4m4 4 4-4" strokeLinecap="round" />
      </svg>
      <span className="heading text-xs tracking-widest">Resfriar</span>
    </div>
  );
}
