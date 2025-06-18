import { MapPoint } from '@/types/map';

export interface NomHistoriqueItem {
  nom: string;
  [key: string]: any;
}

export interface VerrerieMapPoint extends MapPoint {
  id: string;
  slug: string;
  nomPrincipal: string;
  coordonnees: [number, number];
  villeOuCommune?: string;
  region?: string;
  pays: string;
  nomsHistoriquesEtRaisonsSociales?: NomHistoriqueItem[];
}

export interface FeaturedVerrerieType {
  id: string;
  slug: string;
  nomPrincipal: string;
  resumeOuExtrait?: string;
  imageEnAvant?: {
    url?: string;
    alt?: string;
  };
}

export interface VerreriePourCarte {
  id: string;
  slug?: string | null;
  nomPrincipal: string;
  resumeOuExtrait?: string | null;
  imageEnAvant?: {
    url?: string | null;
    alt?: string | null;
  } | null;
}