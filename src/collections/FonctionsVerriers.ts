import { CollectionConfig } from 'payload';

const FonctionsVerriers: CollectionConfig = {
  slug: 'fonctions-verriers',
  admin: {
    useAsTitle: 'nom',
    defaultColumns: ['nom', 'updatedAt'],
    listSearchableFields: ['nom'],
    group: 'Personnes', // Optionnel: pour organiser dans l'admin
    description: 'Liste des métiers spécifiques aux verriers (ouvriers, artisans).',
  },
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'nom',
      type: 'text',
      label: 'Nom du métier',
      required: true,
      unique: true,
      index: true,
      admin: {
        description: 'Exemple: Souffleur de verre, Gamin, Tiseur, etc.',
      },
    },
    // Vous pourriez ajouter un champ "description" ici si vous voulez détailler chaque métier
  ],
};

export default FonctionsVerriers;