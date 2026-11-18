import Link from "next/link";

export default function NotFound() {
  return (
    <div className="container-rf py-20 text-center">
      <p className="heading text-6xl text-blue">404</p>
      <h1 className="heading mt-4 text-2xl text-night">Página no encontrada</h1>
      <p className="mt-3">El producto o la página que buscás no existe o ya no está disponible.</p>
      <Link href="/" className="btn-buy mt-8">
        Volver al inicio
      </Link>
    </div>
  );
}
