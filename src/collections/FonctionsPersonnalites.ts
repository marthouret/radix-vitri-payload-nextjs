import { CollectionConfig } from 'payload';

const FonctionsPersonnalites: CollectionConfig = {
  slug: 'fonctions-personnalites',
  admin: {
    useAsTitle: 'nom',
    defaultColumns: ['nom', 'updatedAt'],
    listSearchableFields: ['nom'],
    group: 'Personnes', // Optionnel: pour organiser dans l'admin
    description: 'Liste des rôles pour les personnalités (direction, cadres, etc.).',
  },
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'nom',
      type: 'text',
      label: 'Nom du rôle/fonction',
      required: true,
      unique: true,
      index: true,
      admin: {
        description: 'Exemple: Directeur, Associé, Maître de verrerie (cadre), etc.',
      },
    },
    // Vous pourriez ajouter un champ "description" ici si vous voulez détailler chaque rôle
  ],
};

export default FonctionsPersonnalites;