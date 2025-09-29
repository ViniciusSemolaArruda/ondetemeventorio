// app/_contexts/I18nContext.tsx
import AsyncStorage from "@react-native-async-storage/async-storage"
import * as Localization from "expo-localization"
import React, {
    createContext,
    useContext,
    useEffect,
    useMemo,
    useState,
} from "react"
import { Platform } from "react-native"
import { dictionaries, Lang } from "../lib/i18n"

type I18nContextType = {
  lang: Lang
  setLang: (l: Lang) => void
  t: (key: string) => string
}

const I18nContext = createContext<I18nContextType | null>(null)

const KEY = "ot_er_lang" // Onde Tem Evento Rio - lang

// Helpers seguros p/ persistência
async function readPersistedLang(): Promise<Lang | null> {
  try {
    // Web (PWA com Expo): permitir localStorage como fallback
    if (Platform.OS === "web" && typeof window !== "undefined") {
      const ls = window.localStorage.getItem(KEY) as Lang | null
      if (ls) return ls
    }
    const v = await AsyncStorage.getItem(KEY)
    return (v as Lang | null) ?? null
  } catch {
    return null
  }
}

async function writePersistedLang(lang: Lang) {
  try {
    if (Platform.OS === "web" && typeof window !== "undefined") {
      window.localStorage.setItem(KEY, lang)
    }
    await AsyncStorage.setItem(KEY, lang)
  } catch {
    // silencia erros de persistência
  }
}

// Fallback pelo idioma do dispositivo → "pt", "en", etc.
function deviceLangFallback(): Lang {
  // Ex.: "pt-BR" -> "pt"
  const tag = Localization.getLocales?.()[0]?.languageCode ?? "pt"
  // Garanta que existe no seu dicionário; senão, volte para pt
  return (["pt", "en", "es"].includes(tag) ? tag : "pt") as Lang
}

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>("pt") // padrão BR

  useEffect(() => {
    (async () => {
      // ordem de preferência: persisted -> device -> "pt"
      const persisted = await readPersistedLang()
      const chosen: Lang = (persisted ?? deviceLangFallback() ?? "pt") as Lang
      setLangState(chosen)
    })()
  }, [])

  const setLang = (l: Lang) => {
    setLangState(l)
    writePersistedLang(l)
  }

  const t = (key: string) => dictionaries[lang]?.[key] ?? key

  const value = useMemo(() => ({ lang, setLang, t }), [lang])

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
}

export const useI18n = () => {
  const ctx = useContext(I18nContext)
  if (!ctx) throw new Error("useI18n must be used within I18nProvider")
  return ctx
}
