// app/_constants/search2.ts

/** Mapa i18n -> valor exatamente como salvo no BD (categories: string[]) */
export const KEY_TO_DB = {
  cat_carnaval: "Carnaval",
  cat_samba: "Rodas de Samba",
  cat_bossa: "Bossa Nova",
  cat_passinho: "Passinho",
  cat_funk: "Funk",
  cat_eletronica: "Eletrônica",
  cat_forro: "Forró",
  cat_mpb: "MPB",
  cat_rock: "Rock",
  cat_blues: "Blues",
  cat_jazz: "Jazz",
  cat_chorinho: "Chorinho",
  cat_festivais: "Festivais",
  cat_festas: "Festas",
  cat_parques: "Parques",
  cat_bares: "Bares",
  cat_restaurantes: "Restaurantes",
  cat_religiao: "Religiões",
  cat_cultural: "Cinema",
  cat_esportes: "Esportes",
  cat_gastronomia: "Gastronomia",
  cat_feiras: "Feiras",
  cat_seminarios: "Seminários",
  cat_simposios: "Simpósios",
  cat_ambiente: "Meio Ambiente",
  cat_agro: "Agronegócio",
  cat_teatro: "Teatro",
  cat_standup: "Stand Up Comedy",
  cat_cinema: "Cinema",
  cat_familia: "Familia",
  cat_boate: "Boate",
} as const;

export type KeyI18n = keyof typeof KEY_TO_DB;

export interface QuickSearchOption {
  imageUrl: string;
  /** chave i18n usada pelo tradutor (ex.: t("cat_carnaval")) */
  key: KeyI18n;
  /** rótulo local/fallback (PT) — usado se não houver tradutor */
  title: string;
  /** opcional: sobrescreve o valor enviado no ?service= */
  value?: string;
}

/** Lista de coleções (com key para i18n + título fallback) */
export const quickSearchOptions: QuickSearchOption[] = [
  { imageUrl: "/SAPUCAI1.png", key: "cat_carnaval", title: "Carnaval" },
  { imageUrl: "/roda-gpt.png", key: "cat_samba", title: "Rodas de Samba" },
  { imageUrl: "/bossa-gpt.png", key: "cat_bossa", title: "Bossa Nova" },
  { imageUrl: "/passinho-gpt.png", key: "cat_passinho", title: "Passinho" },
  { imageUrl: "/funk-gpt.png", key: "cat_funk", title: "Funk" },
  { imageUrl: "/eletronica-gpt.png", key: "cat_eletronica", title: "Eletrônica" },
  { imageUrl: "/forro-gpt.png", key: "cat_forro", title: "Forró" },
  { imageUrl: "/mpb-gpt.png", key: "cat_mpb", title: "MPB" },
  { imageUrl: "/rock-gpt.png", key: "cat_rock", title: "Rock" },
  { imageUrl: "/blues-gpt.png", key: "cat_blues", title: "Blues" },
  { imageUrl: "/jazz-gpt.png", key: "cat_jazz", title: "Jazz" },
  { imageUrl: "/chorinho-gpt.png", key: "cat_chorinho", title: "Chorinho" },
  { imageUrl: "/festivais-gpt.png", key: "cat_festivais", title: "Festivais" },
  { imageUrl: "/festas-gpt.png", key: "cat_festas", title: "Festas" },
  { imageUrl: "/boate-gpt.png", key: "cat_boate", title: "Boate" },
  { imageUrl: "/parques-gpt.png", key: "cat_parques", title: "Parques" },
  { imageUrl: "/bar-gpt.png", key: "cat_bares", title: "Bares" },
  { imageUrl: "/restaurantes-gpt.png", key: "cat_restaurantes", title: "Restaurantes" },
  { imageUrl: "/cristo_redentor_card_size.png", key: "cat_religiao", title: "Religiões" },
  { imageUrl: "/cinema-gpt.png", key: "cat_cultural", title: "Cinema" },
  { imageUrl: "/teatro-gpt.png", key: "cat_teatro", title: "Teatro" },
  { imageUrl: "/standup-gpt.png", key: "cat_standup", title: "Stand Up Comedy" },
  { imageUrl: "/familia-gpt.png", key: "cat_familia", title: "Familia" },
  { imageUrl: "/esporte3-gpt.png", key: "cat_esportes", title: "Esportes" },
  { imageUrl: "/gastronomia-gpt.png", key: "cat_gastronomia", title: "Gastronomia" },
  { imageUrl: "/feiras-gpt.png", key: "cat_feiras", title: "Feiras" },
  { imageUrl: "/seminario-gpt.png", key: "cat_seminarios", title: "Seminários" },
  { imageUrl: "/simposio-gpt.png", key: "cat_simposios", title: "Simpósios" },
  { imageUrl: "/ambiente-gpt.png", key: "cat_ambiente", title: "Meio Ambiente" },
  { imageUrl: "/agro-gpt.png", key: "cat_agro", title: "Agronegócio" },
];

/** Helper p/ pegar o label traduzido; se não houver `t`, usa o `title` */
export const labelFor = (option: QuickSearchOption, t?: (k: string) => string) =>
  (t ? t(option.key) : option.title);

/** Helper p/ valor que vai no ?service= (prioriza option.value; senão KEY_TO_DB) */
export const serviceFor = (option: QuickSearchOption) =>
  (option.value && option.value.trim()) || KEY_TO_DB[option.key];

/** Helper p/ construir o href da coleção já com encode correto (útil no web) */
export const hrefFor = (option: QuickSearchOption) =>
  `/barbershops?service=${encodeURIComponent(serviceFor(option))}`;
