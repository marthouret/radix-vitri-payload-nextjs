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

// Vous pourriez ajouter d'autres listes d'options ici à l'avenir
// export const autreListeOptions: SelectOption[] = [ ... ];
