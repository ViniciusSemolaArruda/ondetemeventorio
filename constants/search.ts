// constants/search.ts
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
  cat_sertanejo: "Sertanejo",
  cat_chorinho: "Chorinho",
  cat_charme: "Charme",
  cat_festivais: "Festivais",
  cat_festas: "Festas",
  cat_parques: "Parques",
  cat_bares: "Bares",
  cat_restaurantes: "Restaurantes",
  cat_religiao: "Religiões",
  cat_cultural: "Cinema",
  cat_esportes: "Esportes",
  cat_gastronomia: "Gastronomia",
  cat_hotel: "Hotel",
  cat_feiras: "Feiras",
  cat_nautica: "Náutica",
  cat_seminarios: "Seminários",
  cat_simposios: "Simpósios",
  cat_ambiente: "Meio Ambiente",
  cat_agro: "Agronegócio",
  cat_teatro: "Teatro",
  cat_standup: "Stand Up Comedy",
  cat_familia: "Família",
  cat_boate: "Boate",
  cat_kids: "Kids",
  cat_pets: "Pets",
} as const;

export type KeyI18n = keyof typeof KEY_TO_DB;

export interface QuickSearchOption {
  imageUrl: string;
  /** chave i18n (ex.: "cat_carnaval") */
  key: KeyI18n;
  /** rótulo local/fallback (mantido) */
  title: string;
  /** opcional: sobrescreve o valor enviado no ?service= */
  value?: string;
}

export const quickSearchOptions: QuickSearchOption[] = [
  { imageUrl: "/musica(1).png", key: "cat_carnaval", title: "Carnaval" },
  { imageUrl: "/musica(1).png", key: "cat_samba", title: "Rodas de Samba" },
  { imageUrl: "/musica(1).png", key: "cat_bossa", title: "Bossa Nova" },
  { imageUrl: "/musica(1).png", key: "cat_passinho", title: "Passinho" },
  { imageUrl: "/musica(1).png", key: "cat_funk", title: "Funk" },
  { imageUrl: "/musica(1).png", key: "cat_eletronica", title: "Eletrônica" },
  { imageUrl: "/musica(1).png", key: "cat_forro", title: "Forró" },
  { imageUrl: "/musica(1).png", key: "cat_mpb", title: "MPB" },
  { imageUrl: "/musica(1).png", key: "cat_rock", title: "Rock" },
  { imageUrl: "/musica(1).png", key: "cat_blues", title: "Blues" },
  { imageUrl: "/musica(1).png", key: "cat_jazz", title: "Jazz" },
  { imageUrl: "/musica(1).png", key: "cat_sertanejo", title: "Sertanejo" },
  { imageUrl: "/musica(1).png", key: "cat_chorinho", title: "Chorinho" },
  { imageUrl: "/musica(1).png", key: "cat_charme", title: "Charme" },
  { imageUrl: "/show.png", key: "cat_festivais", title: "Festivais" },
  { imageUrl: "/ano-novo.png", key: "cat_festas", title: "Festas" },
  { imageUrl: "/boate.png", key: "cat_boate", title: "Boates" },
  { imageUrl: "/parque-tematico.png", key: "cat_parques", title: "Parques" },
  { imageUrl: "/bar.png", key: "cat_bares", title: "Bares" },
  {
    imageUrl: "/chefe-de-cozinha.png",
    key: "cat_gastronomia",
    title: "Gastronomia",
  },
  {
    imageUrl: "/hotel.png",
    key: "cat_hotel",
    title: "Hotel",
  },
  {
    imageUrl: "/restaurante.png",
    key: "cat_restaurantes",
    title: "Restaurantes",
  },
  { imageUrl: "/religion.png", key: "cat_religiao", title: "Religiões" },
  { imageUrl: "/claquete.png", key: "cat_cultural", title: "Cinema" },
  { imageUrl: "/teatro.png", key: "cat_teatro", title: "Teatro" },
  {
    imageUrl: "/contorno-de-microfone-condensador-profissional.png",
    key: "cat_standup",
    title: "Stand Up Comedy",
  },
  { imageUrl: "/trabalho-em-equipe.png", key: "cat_familia", title: "Familia" },
  { imageUrl: "/alfabeto.png", key: "cat_kids", title: "Kids" },
  { imageUrl: "/pata.png", key: "cat_pets", title: "Pets" },


  { imageUrl: "/esporte.png", key: "cat_esportes", title: "Esportes" },

  { imageUrl: "/barraca-de-comida.png", key: "cat_feiras", title: "Feiras" },
  { imageUrl: "/ancora.png", key: "cat_nautica", title: "Náutica" },
  { imageUrl: "/seminario.png", key: "cat_seminarios", title: "Seminários" },
  { imageUrl: "/simposio.png", key: "cat_simposios", title: "Simpósios" },
  {
    imageUrl: "/planeta-terra.png",
    key: "cat_ambiente",
    title: "Meio Ambiente",
  },
  { imageUrl: "/agricultura.png", key: "cat_agro", title: "Agronegócio" },
];

/** Helper: resolve o valor que vai para ?service= (prioriza option.value) */
export const getServiceFromKey = (key: KeyI18n, override?: string) =>
  (override && override.trim()) || KEY_TO_DB[key];
