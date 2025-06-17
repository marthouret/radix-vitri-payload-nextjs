// src/types/map.ts
export interface EngagementDetailForPopup { // Nouvelle interface pour un engagement dans la popup
  fonction?: string;
  periode?: string | undefined;
  typeEvenement?: string;
  // Ajoutez ici d'autres champs de l'engagement que vous voudriez afficher,
  // par exemple, l'ID de l'engagement lui-même si utile pour des liens futurs.
  // idEngagement?: string; 
}

export interface MapPointPopupDetails {
  // Fonction, periode, typeEvenement ne sont plus ici directement
  // Ils sont maintenant dans une liste d'engagements
  allEngagementsAtThisLocation?: EngagementDetailForPopup[];
}

export interface MapPoint {
  id: string; // Ce sera l'ID de la Verrerie pour assurer l'unicité du point sur la carte
  slug: string; // Slug de la Verrerie
  nomPrincipal: string; // Nom de la Verrerie
  coordonnees: [number, number];
  villeOuCommune?: string;
  nomDuLieu?: string; // Nom spécifique du Lieu de la Verrerie
  popupDetails?: MapPointPopupDetails;
}