export interface HistoirePourCarte {
  id: string;
  slug?: string | null;
  title: string;
  resume?: string | null;
  imageMiseEnAvant?: {
    url?: string | null;
    alt?: string | null;
  } | null;
}