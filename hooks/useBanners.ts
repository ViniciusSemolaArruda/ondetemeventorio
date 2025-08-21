// hooks/useBanners.ts
import { useEffect, useState } from "react";
import { api } from "../lib/api";

export interface Banner {
  id: string;
  title: string;
  imageUrl: string;
  order: number;
  displaySeconds: number;
}

export function useBanners() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBanners = async () => {
      try {
        const res = await api.get("/api/banners");
        setBanners(res.data);
      } catch (err) {
        console.error("Erro ao buscar banners", err);
      } finally {
        setLoading(false);
      }
    };

    fetchBanners();
  }, []);

  return { banners, loading };
}
