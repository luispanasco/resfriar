// Contactos de Nami para la web de Resfriar: locales y vendedores.
// Las consultas técnicas también van a los vendedores (no hay línea de soporte aparte).

export type Seller = { name: string; phone: string };
export type Location = {
  slug: string;
  name: string;
  address: string;
  mapsUrl: string;
  sellers: Seller[];
};

export const EMAIL = "ventas@nami.com.uy";

/** WhatsApp principal: Carlos Romero (primero en la lista del selector). */
export const MAIN_WHATSAPP = "59899617694";

export const LOCATIONS: Location[] = [
  {
    slug: "centro",
    name: "Local Centro",
    address: "Cerro Largo 1518, Montevideo",
    mapsUrl: "https://www.google.com/maps/search/?api=1&query=Nami+Cerro+Largo+1518+Montevideo",
    sellers: [
      { name: "Carlos Romero", phone: "099617694" },
      { name: "Facundo Génova", phone: "092748865" },
      { name: "Luis Panasco", phone: "098155763" },
      { name: "Tadeo Morales", phone: "091033282" },
      { name: "Sebastián Corajoría", phone: "091074329" },
    ],
  },
  {
    slug: "bulevar",
    name: "Local Bulevar",
    address: "Bv. Gral. Artigas 3397, Montevideo",
    mapsUrl: "https://www.google.com/maps/search/?api=1&query=Nami+Bulevar+Bv.+Gral.+Artigas+3397+Montevideo",
    sellers: [
      { name: "Luis Rodríguez", phone: "098829026" },
      { name: "Bruno", phone: "098000600" },
    ],
  },
];

export const SOCIAL = [
  { label: "Instagram", url: "https://www.instagram.com/namiuruguay/" },
  { label: "Facebook", url: "https://www.facebook.com/nami.ltda" },
  { label: "YouTube", url: "https://www.youtube.com/@namiuruguay277" },
];

/** "092748865" → "59892748865" (formato internacional de Uruguay para wa.me). */
const intl = (phone: string) => `598${phone.replace(/\D/g, "").replace(/^0/, "")}`;

/** "092748865" → "092 748 865". */
export const formatPhone = (phone: string) => phone.replace(/^(\d{3})(\d{3})(\d{3})$/, "$1 $2 $3");

export function whatsappUrl(phoneOrIntl: string, message?: string): string {
  const n = phoneOrIntl.startsWith("598") ? phoneOrIntl : intl(phoneOrIntl);
  return `https://wa.me/${n}${message ? `?text=${encodeURIComponent(message)}` : ""}`;
}

export const DEFAULT_MESSAGE = "Hola, vengo desde la web de Resfriar Uruguay. Quería hacer una consulta.";
export const productMessage = (title: string) =>
  `Hola, vengo desde la web de Resfriar Uruguay. Quería consultar por: ${title}.`;
