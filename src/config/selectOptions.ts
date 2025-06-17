// src/config/selectOptions.ts

// Définition du type pour une option, pour plus de robustesse
export interface SelectOption {
  label: string;
  value: string;
}

export const rolePrincipalOptions: SelectOption[] = [ 
  { label: 'Fondateur', value: 'fondateur' },
  { label: 'Directeur', value: 'directeur' },
  { label: 'Maître de Verrerie', value: 'maitre_verrerie' }, 
  { label: 'Propriétaire', value: 'proprietaire' },
  { label: 'Associé', value: 'associe' },
  { label: 'Ingénieur', value: 'ingenieur' },
  { label: 'Autre', value: 'autre' },
];

export const statutVerrerieOptions = [
  { label: "En activité", value: "enActivite" },
  { label: "Fermée, vestiges visibles", value: "fermeeVestigesVisibles" },
  { label: 'En ruines', value: 'enRuines' },
  { label: 'Disparue (sans vestiges visibles)', value: 'disparueSansVestiges' },
  { label: 'Site converti (autre usage)', value: 'convertie' },
  { label: "Inconnu", value: "inconnu" },
];

// Vous pourriez ajouter d'autres listes d'options ici à l'avenir
// export const autreListeOptions: SelectOption[] = [ ... ];
