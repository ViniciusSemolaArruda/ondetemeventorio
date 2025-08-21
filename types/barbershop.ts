export type Barbershop = {
  id: string;
  name: string;
  address: string;
  imageUrl: string;
  description: string;
  startDate: string; // Se estiver em ISO format (ex: "2025-08-01T14:00:00Z")
  endDate: string;
  categories: string[];
  ticketsUrl: string;
  websiteUrl: string;
  producer: string;
  producerDescription: string;
   aprovado: boolean;
};
