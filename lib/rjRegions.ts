// lib/rjRegions.ts

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

// 👉 Região Metropolitana (capital + Niterói)
const METROPOLITANA_CITIES = ["Rio de Janeiro", "Niterói"]

// ➕ ALIASES DE BAIRROS/DISTRITOS DO MUNICÍPIO DO RIO
// Separamos os “seguros” dos “ambíguos”
const CAPITAL_ALIASES_SEGUROS = [
  // --- ZONA SUL ---
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
  "Arpoador",
  "Fonte da Saudade",
  "Horto",

  // --- CENTRO E ARREDORES ---
  "Centro",
  "Lapa",
  "Santa Teresa",
  "Bairro de Fátima",
  "Saúde",
  "Gamboa",
  "Santo Cristo",
  "Caju",
  "Cidade Nova",
  "Estácio",
  "Catumbi",
  "Rio Comprido",
  "Praça da Bandeira",
  "São Cristóvão",
  "Vasco da Gama",
  "Benfica",
  "Mangueira",

  // --- ZONA NORTE (GRANDE TIJUCA E SUBÚRBIO) ---
  "Alto da Boa Vista",
  "Tijuca",
  "Maracanã",
  "Vila Isabel",
  "Andaraí",
  "Grajaú",
  "Muda",
  "Usina",
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
  "Maria da Graça",
  "Del Castilho",
  "Inhaúma",
  "Tomás Coelho",
  "Higienópolis",
  "Pilares",
  "Engenho da Rainha",
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
  "Parque Colúmbia",
  "Costa Barros",
  "Barros Filho",
  "Guadalupe",
  "Anchieta",
  "Parque Anchieta",
  "Ricardo de Albuquerque",
  "Maré",
  "Complexo do Alemão",

  // --- MADUREIRA E ARREDORES ---
  "Deodoro",
  "Vila Militar",
  "Campo dos Afonsos",
  "Jardim Sulacap",
  "Magalhães Bastos",
  "Realengo",
  "Padre Miguel",
  "Bangu",
  "Senador Camará",
  "Gericinó",
  "Vila Kennedy",
  "Vila Valqueire",
  "Campinho",
  "Cascadura",
  "Quintino Bocaiuva",
  "Praça Seca",
  "Tanque",
  "Madureira",
  "Oswaldo Cruz",
  "Bento Ribeiro",
  "Marechal Hermes",
  "Turiaçu",
  "Vaz Lobo",
  "Cavalcanti",
  "Engenheiro Leal",
  "Honório Gurgel",
  "Rocha Miranda",

  // --- ZONA OESTE (BARRA/JACAREPAGUÁ) ---
  "Barra da Tijuca",
  "Barra Olímpica",
  "Joá",
  "Itanhangá",
  "Camorim",
  "Grumari",
  "Recreio dos Bandeirantes",
  "Vargem Grande",
  "Vargem Pequena",
  "Jacarepaguá",
  "Taquara",
  "Pechincha",
  "Freguesia (Jacarepaguá)",
  "Anil",
  "Curicica",
  "Cidade de Deus",
  "Gardênia Azul",
  "Rio das Pedras",

  // --- ZONA OESTE (CAMPO GRANDE/SANTA CRUZ) ---
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

  // --- ILHA DO GOVERNADOR ---
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
  "Ribeira",
  "Tubiacanga",
  "Ilha do Fundão",
  "Cidade Universitária",
  "Paquetá",

  // --- PONTOS DE REFERÊNCIA / OUTROS ---
  "Porto Maravilha",
  "Praça Mauá",
  "Pier Mauá",
  "Sambódromo",
  "Marina da Glória",
  "Aterro do Flamengo",
  "Quinta da Boa Vista",
  "Parque Olímpico do Rio de Janeiro",
  "Parque Olímpico",
  "Cidade do Rock",
]

// Ambíguos (só valem se também houver “RIO DE JANEIRO” no endereço)
const CAPITAL_ALIASES_AMBIGUOS = ["Centro"]

// Para autocomplete / raw
const CAPITAL_ALIASES = [
  ...CAPITAL_ALIASES_SEGUROS,
  ...CAPITAL_ALIASES_AMBIGUOS,
]

// 👉 monta raw da Região Metropolitana com aliases + versões sem acento
const METROPOLITANA_RAW: string[] = Array.from(
  new Set(
    [...METROPOLITANA_CITIES, ...CAPITAL_ALIASES].flatMap((s) => {
      const no = stripAccents(s)
      return no !== s ? [s, no] : [s]
    }),
  ),
)

// =======================
// Listas de municípios do RJ organizados por região TurisRio
// =======================

// Agulhas Negras
const AGULHAS_NEGRAS = ["Itatiaia", "Porto Real", "Quatis", "Resende"]

// Vale do Café
const VALE_DO_CAFE = [
  "Barra do Piraí",
  "Barra Mansa",
  "Engenheiro Paulo de Frontin",
  "Mendes",
  "Miguel Pereira",
  "Paracambi",
  "Paty do Alferes",
  "Pinheiral",
  "Piraí",
  "Rio das Flores",
  "Valença",
  "Vassouras",
  "Volta Redonda",
]

// Caminhos Coloniais
const CAMINHOS_COLONIAIS = [
  "Areal",
  "Comendador Levy Gasparian",
  "Paraíba do Sul",
  "São José do Vale do Rio Preto",
  "Sapucaia",
  "Três Rios",
]

// Serra Verde Imperial
const SERRA_VERDE_IMPERIAL = [
  "Cachoeiras de Macacu",
  "Guapimirim",
  "Nova Friburgo",
  "Petrópolis",
  "Teresópolis",
]

// Caminhos da Serra
const CAMINHOS_DA_SERRA = [
  "Bom Jardim",
  "Cantagalo",
  "Carmo",
  "Cordeiro",
  "Duas Barras",
  "Macuco",
  "Santa Maria Madalena",
  "São Sebastião do Alto",
  "Sumidouro",
  "Trajano de Moraes",
]

// Costa do Sol
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

// Caminhos da Mata
const CAMINHOS_DA_MATA = [
  "Itaboraí",
  "Rio Bonito",
  "Silva Jardim",
  "Tanguá",
]

// Baixada Verde (Baixada Fluminense)
const BAIXADA_VERDE = [
  "Belford Roxo",
  "Duque de Caxias",
  "Japeri",
  "Magé",
  "Mesquita",
  "Nilópolis",
  "Nova Iguaçu",
  "Queimados",
  "São João de Meriti",
  "Seropédica",
]

// Costa Verde
const COSTA_VERDE = [
  "Angra dos Reis",
  "Itaguaí",
  "Mangaratiba",
  "Paraty",
  "Rio Claro",
]

// Águas do Noroeste
const AGUAS_DO_NOROESTE = [
  "Aperibé",
  "Bom Jesus do Itabapoana",
  "Cambuci",
  "Italva",
  "Itaocara",
  "Itaperuna",
  "Laje do Muriaé",
  "Miracema",
  "Natividade",
  "Porciúncula",
  "Santo Antônio de Pádua",
  "São José de Ubá",
  "Varre-Sai",
]

// Costa Doce
const COSTA_DOCE = [
  "Campos dos Goytacazes",
  "Cardoso Moreira",
  "São Fidélis",
  "São Francisco de Itabapoana",
  "São João da Barra",
]

// =======================
// Tipos
// =======================
export type RjRegion =
  | "Região Metropolitana"
  | "Agulhas Negras"
  | "Vale do Café"
  | "Caminhos Coloniais"
  | "Serra Verde Imperial"
  | "Caminhos da Serra"
  | "Costa do Sol"
  | "Caminhos da Mata"
  | "Baixada Verde"
  | "Costa Verde"
  | "Águas do Noroeste"
  | "Costa Doce"
  | "Outras"

// =======================
// Estrutura master p/ UI: grupos com label e cidades
// =======================
export const RJ_REGION_GROUPS: {
  key: RjRegion
  label: string
  cities: string[]
}[] = [
  {
    key: "Região Metropolitana",
    label: "Região Metropolitana",
    cities: METROPOLITANA_CITIES,
  },
  { key: "Agulhas Negras", label: "Agulhas Negras", cities: AGULHAS_NEGRAS },
  { key: "Vale do Café", label: "Vale do Café", cities: VALE_DO_CAFE },
  {
    key: "Caminhos Coloniais",
    label: "Caminhos Coloniais",
    cities: CAMINHOS_COLONIAIS,
  },
  {
    key: "Serra Verde Imperial",
    label: "Serra Verde Imperial",
    cities: SERRA_VERDE_IMPERIAL,
  },
  {
    key: "Caminhos da Serra",
    label: "Caminhos da Serra",
    cities: CAMINHOS_DA_SERRA,
  },
  { key: "Costa do Sol", label: "Costa do Sol", cities: COSTA_DO_SOL },
  {
    key: "Caminhos da Mata",
    label: "Caminhos da Mata",
    cities: CAMINHOS_DA_MATA,
  },
  { key: "Baixada Verde", label: "Baixada Verde", cities: BAIXADA_VERDE },
  { key: "Costa Verde", label: "Costa Verde", cities: COSTA_VERDE },
  {
    key: "Águas do Noroeste",
    label: "Águas do Noroeste",
    cities: AGUAS_DO_NOROESTE,
  },
  { key: "Costa Doce", label: "Costa Doce", cities: COSTA_DOCE },
]

// Lista de regiões para dropdown / filtro
export const RJ_REGIONS: RjRegion[] = RJ_REGION_GROUPS.map((g) => g.key)

// Mapa região → cidades (normalizadas e não-normalizadas)
export const RJ_REGION_TO_CITIES: Record<
  RjRegion,
  { raw: string[]; normalized: Set<string> }
> = {
  "Região Metropolitana": {
    raw: METROPOLITANA_RAW,
    normalized: new Set(
      [...METROPOLITANA_CITIES, ...CAPITAL_ALIASES_SEGUROS].map(normalizeCity),
    ),
  },
  "Agulhas Negras": {
    raw: AGULHAS_NEGRAS,
    normalized: new Set(AGULHAS_NEGRAS.map(normalizeCity)),
  },
  "Vale do Café": {
    raw: VALE_DO_CAFE,
    normalized: new Set(VALE_DO_CAFE.map(normalizeCity)),
  },
  "Caminhos Coloniais": {
    raw: CAMINHOS_COLONIAIS,
    normalized: new Set(CAMINHOS_COLONIAIS.map(normalizeCity)),
  },
  "Serra Verde Imperial": {
    raw: SERRA_VERDE_IMPERIAL,
    normalized: new Set(SERRA_VERDE_IMPERIAL.map(normalizeCity)),
  },
  "Caminhos da Serra": {
    raw: CAMINHOS_DA_SERRA,
    normalized: new Set(CAMINHOS_DA_SERRA.map(normalizeCity)),
  },
  "Costa do Sol": {
    raw: COSTA_DO_SOL,
    normalized: new Set(COSTA_DO_SOL.map(normalizeCity)),
  },
  "Caminhos da Mata": {
    raw: CAMINHOS_DA_MATA,
    normalized: new Set(CAMINHOS_DA_MATA.map(normalizeCity)),
  },
  "Baixada Verde": {
    raw: BAIXADA_VERDE,
    normalized: new Set(BAIXADA_VERDE.map(normalizeCity)),
  },
  "Costa Verde": {
    raw: COSTA_VERDE,
    normalized: new Set(COSTA_VERDE.map(normalizeCity)),
  },
  "Águas do Noroeste": {
    raw: AGUAS_DO_NOROESTE,
    normalized: new Set(AGUAS_DO_NOROESTE.map(normalizeCity)),
  },
  "Costa Doce": {
    raw: COSTA_DOCE,
    normalized: new Set(COSTA_DOCE.map(normalizeCity)),
  },
  Outras: { raw: [], normalized: new Set<string>() },
}

// Utilitário: retorna as cidades exibíveis para uma região
export function citiesForRegion(region: RjRegion): string[] {
  return RJ_REGION_TO_CITIES[region]?.raw ?? []
}

// =======================
// city/address → region
// =======================
function containsAny(norm: string, tokens: Set<string>): boolean {
  for (const token of tokens) {
    if (norm.includes(token)) return true
  }
  return false
}

const METRO_SAFE = new Set(CAPITAL_ALIASES_SEGUROS.map(normalizeCity))
const METRO_AMBIG = new Set(CAPITAL_ALIASES_AMBIGUOS.map(normalizeCity))

const ORDERED_REGIONS_FOR_MATCH: RjRegion[] = [
  "Região Metropolitana",
  "Serra Verde Imperial",
  "Costa do Sol",
  "Costa Verde",
  "Agulhas Negras",
  "Vale do Café",
  "Caminhos Coloniais",
  "Caminhos da Serra",
  "Caminhos da Mata",
  "Baixada Verde",
  "Águas do Noroeste",
  "Costa Doce",
]

export function mapCityToRegion(
  cityOrAddress: string | null | undefined,
): RjRegion {
  const raw = cityOrAddress || ""
  const norm = normalizeCity(raw)
  if (!norm) return "Outras"

  const hasExact = (region: RjRegion) =>
    RJ_REGION_TO_CITIES[region].normalized.has(norm)

  // 1) Match EXATO pela cidade (mais importante)
  for (const r of ORDERED_REGIONS_FOR_MATCH) {
    if (hasExact(r)) return r
  }

  // 2) Se o texto menciona claramente alguma cidade da Baixada Verde,
  //    damos prioridade para ela ANTES de pensar em Metropolitana.
  const baixadaTokens = RJ_REGION_TO_CITIES["Baixada Verde"].normalized
  if (containsAny(norm, baixadaTokens)) {
    return "Baixada Verde"
  }

  // 3) Fallback especial p/ bairros do Rio (capital)
  const hasRJCity = norm.includes("RIO DE JANEIRO")
  if (containsAny(norm, METRO_SAFE)) return "Região Metropolitana"
  if (containsAny(norm, METRO_AMBIG) && hasRJCity) return "Região Metropolitana"

  // 4) Match por "contém token" nas demais regiões (inclusive Metropolitana),
  //    mas agora Baixada Verde já foi tratada antes.
  for (const r of ORDERED_REGIONS_FOR_MATCH) {
    if (containsAny(norm, RJ_REGION_TO_CITIES[r].normalized)) return r
  }

  return "Outras"
}

// Conjunto de todas as cidades mapeadas
export const RJ_ALL_CITIES_SET = new Set<string>(
  Object.values(RJ_REGION_TO_CITIES).flatMap((g) => Array.from(g.normalized)),
)

// Exporte os aliases caso queira reutilizar (ex.: autocomplete de bairros do Rio)
export const CAPITAL_NEIGHBOR_ALIASES = CAPITAL_ALIASES
