// app/_components/BarbershopsFilterRN.tsx
import { useLocalSearchParams, useRouter } from "expo-router";
import React from "react";

import FilterBarRN from "@/components/FilterBarRN";

type QueryParams = Record<string, string>;

type Props = {
  selectedRegion?: string;
};

export default function BarbershopsFilter({ selectedRegion }: Props) {
  const router = useRouter();

  // Expo Router retorna um RECORD DE STRINGS, então fazemos cast manual
  const params = useLocalSearchParams() as Record<string, string | undefined>;

  const onApply = (newParams: QueryParams) => {
    // clona os params atuais
    const next: Record<string, string> = {};

    // mantém todos os params atuais como string (se existirem)
    for (const [k, v] of Object.entries(params)) {
      if (typeof v === "string") {
        next[k] = v;
      }
    }

    // sobrescreve com filtros (inclusive strings vazias!)
    for (const [k, v] of Object.entries(newParams)) {
      next[k] = v; // ← não apagamos mais chave nenhuma
    }

    // atualiza a URL da tela atual
    router.setParams(next);
  };

  return (
    <FilterBarRN
      selectedRegion={selectedRegion ?? ""}
      onApply={onApply}
    />
  );
}
