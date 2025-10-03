// _lib/rjRegions.ts

// Normaliza cidade para evitar erros de acento, maiúscula/minúscula etc.
export function normalizeCity(input: string): string {
  return (input || "")
    .normalize("NFD") // separa acentos
    .replace(/[\u0300-\u036f]/g, "") // remove acentos
    .replace(/[^\w\s-]/g, "") // remove caracteres estranhos
    .trim()
    .replace(/\s+/g, " ") // normaliza espaços
    .toUpperCase()
}

// util: versão sem acento (para montar raw com e sem acento)
function stripAccents(s: string): string {
  return s.normalize("NFD").replace(/[\u0300-\u036f]/g, "")
}

// =======================
// Grupos de regiões (com cidades)
// =======================

// Capital (Cidade do Rio)
const CAPITAL = ["Rio de Janeiro"]

// ➕ ALIASES DE BAIRROS/DISTRITOS DO MUNICÍPIO DO RIO (extenso)
const CAPITAL_ALIASES = [
  // Zona Sul
  "Botafogo",
  "Urca",
  "Humaitá",
  "Laranjeiras",
  "Flamengo",
  "Catete",
  "Glória",
  "Cosme Velho",
  "Copacabana",
  "Leme",
  "Ipanema",
  "Leblon",
  "Lagoa",
  "Jardim Botânico",
  "Gávea",
  "Vidigal",
  "São Conrado",
  "Rocinha",

  // Centro / Entorno
  "Centro",
  "Lapa",
  "Santa Teresa",
  "Saúde",
  "Gamboa",
  "Santo Cristo",
  "Caju",
  "Cidade Nova",
  "Estácio",
  "Catumbi",
  "Rio Comprido",
  "Praça da Bandeira",

  // Grande Tijuca
  "Tijuca",
  "Maracanã",
  "Vila Isabel",
  "Andaraí",
  "Grajaú",

  // Méier e adjacências
  "Méier",
  "Engenho Novo",
  "Sampaio",
  "Riachuelo",
  "Rocha",
  "Cachambi",
  "Todos os Santos",
  "Abolição",
  "Piedade",
  "Encantado",
  "Água Santa",
  "Engenho de Dentro",
  "Lins de Vasconcelos",
  "Jacaré",
  "Jacarezinho",
  "Del Castilho",
  "Maria da Graça",
  "Inhaúma",
  "Tomás Coelho",
  "Higienópolis",
  "Pilares",
  "Engenho da Rainha",

  // Subúrbios (Zona Norte – Leopoldina/Penha/Irajá/Pavuna)
  "Benfica",
  "Manguinhos",
  "Bonsucesso",
  "Ramos",
  "Olaria",
  "Penha",
  "Penha Circular",
  "Brás de Pina",
  "Cordovil",
  "Parada de Lucas",
  "Vigário Geral",
  "Jardim América",
  "Irajá",
  "Vicente de Carvalho",
  "Vila da Penha",
  "Vista Alegre",
  "Coelho Neto",
  "Colégio",
  "Acari",
  "Pavuna",
  "Guadalupe",
  "Anchieta",
  "Ricardo de Albuquerque",

  // Região Deodoro/Realengo/Bangu/Valqueire
  "Deodoro",
  "Vila Militar",
  "Campo dos Afonsos",
  "Jardim Sulacap",
  "Magalhães Bastos",
  "Realengo",
  "Padre Miguel",
  "Bangu",
  "Senador Camará",
  "Vila Valqueire",
  "Campinho",
  "Cascadura",
  "Quintino Bocaiuva",
  "Praça Seca",

  // Madureira e entorno
  "Madureira",
  "Oswaldo Cruz",
  "Turiaçu",
  "Vaz Lobo",
  "Cavalcanti",
  "Engenheiro Leal",
  "Honório Gurgel",
  "Rocha Miranda",
  "Colégio",

  // Zona Oeste – Barra/Jacarepaguá/Recreio/Vargens
  "Barra da Tijuca",
  "Barra Olímpica",
  "Joá",
  "Itanhangá",
  "Camorim",
  "Grumari",
  "Recreio dos Bandeirantes",
  "Vargem Grande",
  "Vargem Pequena",
  // Jacarepaguá (sub-bairros)
  "Jacarepaguá",
  "Taquara",
  "Pechincha",
  "Freguesia (Jacarepaguá)",
  "Anil",
  "Curicica",
  "Cidade de Deus",
  "Gardênia Azul",
  "Rio das Pedras",

  // Zona Oeste – Campo Grande/Santa Cruz/Guaratiba
  "Campo Grande",
  "Cosmos",
  "Inhoaíba",
  "Santíssimo",
  "Paciência",
  "Santa Cruz",
  "Sepetiba",
  "Guaratiba",
  "Pedra de Guaratiba",
  "Barra de Guaratiba",
  "Jardim Maravilha",

  // Ilha do Governador e adjacências
  "Ilha do Governador",
  "Cacuia",
  "Moneró",
  "Tauá",
  "Cocotá",
  "Praia da Bandeira",
  "Zumbi",
  "Pitangueiras",
  "Bancários",
  "Jardim Guanabara",
  "Freguesia (Ilha do Governador)",
  "Portuguesa",
  "Galeão",
  "Ilha do Fundão",
  "Cidade Universitária",
  "Paquetá",

  // Outros logradouros/áreas consagradas
  "Porto Maravilha",
  "Sambódromo",
  "Marina da Glória",

  // Pontos muito citados em eventos (para facilitar match em endereços completos)
  "Parque Olímpico do Rio de Janeiro",
  "Parque Olímpico",
  "Cidade do Rock",
]

// 👉 monta raw da Capital com aliases + versões sem acento
const CAPITAL_RAW: string[] = Array.from(
  new Set(
    [...CAPITAL, ...CAPITAL_ALIASES].flatMap((s) => {
      const no = stripAccents(s)
      return no !== s ? [s, no] : [s]
    }),
  ),
)

// Listas de municípios do RJ organizados por região
const REGIAO_SERRANA = [
  "Petrópolis",
  "Teresópolis",
  "Nova Friburgo",
  "Bom Jardim",
  "Cantagalo",
  "Carmo",
  "Cordeiro",
  "Duas Barras",
  "Macuco",
  "São José do Vale do Rio Preto",
  "São Sebastião do Alto",
  "Santa Maria Madalena",
  "Sumidouro",
  "Trajano de Moraes",
]

const COSTA_DO_SOL = [
  "Araruama",
  "Armação dos Búzios",
  "Arraial do Cabo",
  "Cabo Frio",
  "Carapebus",
  "Casimiro de Abreu",
  "Iguaba Grande",
  "Macaé",
  "Maricá",
  "Quissamã",
  "Rio das Ostras",
  "São Pedro da Aldeia",
  "Saquarema",
]

const AGULHAS_NEGRAS = ["Itatiaia", "Resende", "Quatis", "Porto Real"]

// ✅ Nova região: Costa Verde
const COSTA_VERDE = ["Angra dos Reis", "Paraty", "Mangaratiba", "Itaguaí"]

// =======================
// Tipos
// =======================
export type RjRegion =
  | "Capital"
  | "Região Serrana"
  | "Costa do Sol"
  | "Costa Verde"
  | "Região das Agulhas Negras"
  | "Outras"

// =======================
// Estrutura master p/ UI: grupos com label e cidades
// =======================
export const RJ_REGION_GROUPS: {
  key: RjRegion
  label: string
  cities: string[]
}[] = [
  { key: "Capital", label: "Capital (Rio de Janeiro)", cities: CAPITAL },
  { key: "Região Serrana", label: "Região Serrana", cities: REGIAO_SERRANA },
  { key: "Costa do Sol", label: "Costa do Sol", cities: COSTA_DO_SOL },
  { key: "Costa Verde", label: "Costa Verde", cities: COSTA_VERDE },
  {
    key: "Região das Agulhas Negras",
    label: "Região das Agulhas Negras",
    cities: AGULHAS_NEGRAS,
  },
  { key: "Outras", label: "Outras", cities: [] },
]

// Lista de regiões (labels) para dropdown principal
export const RJ_REGIONS: RjRegion[] = RJ_REGION_GROUPS.map((g) => g.key)

// Mapa região → cidades (normalizadas e não-normalizadas)
export const RJ_REGION_TO_CITIES: Record<
  RjRegion,
  { raw: string[]; normalized: Set<string> }
> = {
  Capital: {
    // ⬇️ o raw inclui aliases + sem acento (melhora o "contains" do Prisma)
    raw: CAPITAL_RAW,
    normalized: new Set([...CAPITAL, ...CAPITAL_ALIASES].map(normalizeCity)),
  },
  "Região Serrana": {
    raw: REGIAO_SERRANA,
    normalized: new Set(REGIAO_SERRANA.map(normalizeCity)),
  },
  "Costa do Sol": {
    raw: COSTA_DO_SOL,
    normalized: new Set(COSTA_DO_SOL.map(normalizeCity)),
  },
  "Costa Verde": {
    raw: COSTA_VERDE,
    normalized: new Set(COSTA_VERDE.map(normalizeCity)),
  },
  "Região das Agulhas Negras": {
    raw: AGULHAS_NEGRAS,
    normalized: new Set(AGULHAS_NEGRAS.map(normalizeCity)),
  },
  Outras: { raw: [], normalized: new Set<string>() },
}

// Utilitário: retorna as cidades exibíveis para uma região (para popular o 2º dropdown)
export function citiesForRegion(region: RjRegion): string[] {
  return RJ_REGION_TO_CITIES[region]?.raw ?? []
}

// =======================
// city/address → region (para filtros de endereço)
// =======================
/**
 * Aceita cidade **ou endereço completo**.
 * Tenta match exato (normalized) e depois faz fallback por **substring**.
 */
export function mapCityToRegion(
  cityOrAddress: string | null | undefined,
): RjRegion {
  const raw = cityOrAddress || ""
  const norm = normalizeCity(raw)
  if (!norm) return "Outras"

  const hasExact = (region: RjRegion) =>
    RJ_REGION_TO_CITIES[region].normalized.has(norm)

  if (hasExact("Capital")) return "Capital"
  if (hasExact("Região Serrana")) return "Região Serrana"
  if (hasExact("Costa do Sol")) return "Costa do Sol"
  if (hasExact("Costa Verde")) return "Costa Verde"
  if (hasExact("Região das Agulhas Negras")) return "Região das Agulhas Negras"

  // 🔎 Fallback: detecta por SUBSTRING em endereço completo
  const containsAny = (tokens: Set<string>) => {
    for (const token of tokens) {
      if (norm.includes(token)) return true
    }
    return false
  }

  if (containsAny(RJ_REGION_TO_CITIES["Capital"].normalized)) return "Capital"
  if (containsAny(RJ_REGION_TO_CITIES["Região Serrana"].normalized))
    return "Região Serrana"
  if (containsAny(RJ_REGION_TO_CITIES["Costa do Sol"].normalized))
    return "Costa do Sol"
  if (containsAny(RJ_REGION_TO_CITIES["Costa Verde"].normalized))
    return "Costa Verde"
  if (containsAny(RJ_REGION_TO_CITIES["Região das Agulhas Negras"].normalized))
    return "Região das Agulhas Negras"

  return "Outras"
}

// (Opcional) Conjunto de todas as cidades mapeadas (útil para validação/autocomplete)
export const RJ_ALL_CITIES_SET = new Set<string>([
  ...RJ_REGION_TO_CITIES["Capital"].normalized,
  ...RJ_REGION_TO_CITIES["Região Serrana"].normalized,
  ...RJ_REGION_TO_CITIES["Costa do Sol"].normalized,
  ...RJ_REGION_TO_CITIES["Costa Verde"].normalized,
  ...RJ_REGION_TO_CITIES["Região das Agulhas Negras"].normalized,
])

// Exporte os aliases caso queira reutilizar (ex.: autocomplete)
export const CAPITAL_NEIGHBOR_ALIASES = CAPITAL_ALIASES
