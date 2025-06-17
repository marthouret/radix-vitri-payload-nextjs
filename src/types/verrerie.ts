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