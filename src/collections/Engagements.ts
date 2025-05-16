// src/collections/Engagements.ts
import { CollectionConfig } from 'payload'; // Ou 'payload' si c'est votre import standard

const metiersVerriersOptions = [
  { label: 'Tamiseur', value: 'tamiseur' },
  { label: 'Souffleur de verre', value: 'souffleur_de_verre' },
  { label: 'Composeur', value: 'composeur' },
  { label: 'Tiseur', value: 'tiseur' },
  { label: 'Grand Garçon', value: 'grand_garcon' },
  { label: 'Gamin', value: 'gamin' },
  { label: 'Manœuvre', value: 'manoeuvre' },
  { label: 'Ouvrier verrier (non spécifié)', value: 'ouvrier_verrier_ns' },
  { label: 'Autre métier verrier', value: 'autre_metier_verrier' },
];

const rolesPersonnaliteOptions = [
  { label: 'Fondateur', value: 'fondateur' }, // Peut aussi être géré par un champ direct sur Verrerie
  { label: 'Directeur', value: 'directeur' },
  { label: 'Propriétaire', value: 'proprietaire' },
  { label: 'Associé', value: 'associe' },
  { label: 'Maître Verrier (en tant que rôle de direction/expertise)', value: 'maitre_verrier_role' },
  { label: 'Ingénieur', value: 'ingenieur' },
  { label: 'Investisseur', value: 'investisseur' },
  { label: 'Autre rôle de personnalité', value: 'autre_role_personnalite' },
];

const Engagements: CollectionConfig = {
  slug: 'engagements',
  admin: {
    useAsTitle: 'fonctionOuMetier', // Ou une combinaison pour un meilleur titre dans l'admin
    defaultColumns: ['verrerie', 'personneConcernee', 'typeEngagement', 'fonctionOuMetier', 'periodeActiviteTexte'],
    description: 'Définit le rôle ou le métier d\'une personne dans une verrerie sur une période donnée.',
  },
  access: { // <<<< AJOUT IMPORTANT
    read: () => true,
    // create: ({ req: { user } }) => !!user, // Sécurisez les autres opérations
    // update: ({ req: { user } }) => !!user,
    // delete: ({ req: { user } }) => !!user,
  },
  fields: [
    {
      name: 'verrerie',
      type: 'relationship',
      relationTo: 'verreries', // Slug de votre collection Verrerie
      hasMany: false,
      required: true,
      index: true,
      label: 'Verrerie Concernée',
    },
    {
      name: 'personneConcernee',
      type: 'relationship',
      relationTo: ['personnalites', 'verriers'], // Relation polymorphe
      hasMany: false,
      required: true,
      index: true,
      label: 'Personne Concernée',
      admin: {
        description: 'Sélectionnez une personnalité ou un verrier.',
      }
    },
    {
      name: 'typeEngagement',
      type: 'select',
      required: true,
      label: 'Type d\'Engagement',
      options: [
        { label: 'Rôle (Personnalité)', value: 'role_personnalite' },
        { label: 'Métier (Verrier)', value: 'metier_verrier' },
      ],
      admin: {
        description: 'Précise si l\'engagement est un rôle de direction/propriété ou un métier d\'artisan/ouvrier.'
      }
    },
    {
      name: 'fonctionOuMetier', // Ce champ sera conditionnellement un select ou un text
      type: 'text', // Commençons par text pour la simplicité
      // Si vous voulez des selects conditionnels, cela demande une UI admin plus complexe (non géré nativement simplement)
      // Une alternative est d'avoir deux champs (un select pour métier, un text pour rôle) et de n'en remplir qu'un
      // basé sur typeEngagement, mais cela peut être géré par des hooks ou des composants admin personnalisés.
      // Pour l'instant, un champ texte est le plus flexible.
      label: 'Fonction / Métier Spécifique',
      required: true,
      admin: {
        description: 'Ex: "Directeur Technique", "Souffleur de verre à bouteilles", "Maître Verrier".',
      }
    },
    // Pour une approche avec des selects conditionnels (plus complexe à mettre en place dans l'admin):
    // {
    //   name: 'rolePersonnalite',
    //   type: 'select',
    //   options: rolesPersonnaliteOptions,
    //   label: 'Rôle de la Personnalité',
    //   admin: {
    //     condition: ({ typeEngagement }) => typeEngagement === 'role_personnalite',
    //   }
    // },
    // {
    //   name: 'metierVerrier',
    //   type: 'select',
    //   options: metiersVerriersOptions,
    //   label: 'Métier du Verrier',
    //   admin: {
    //     condition: ({ typeEngagement }) => typeEngagement === 'metier_verrier',
    //   }
    // },
    {
      name: 'periodeActiviteTexte',
      type: 'text',
      label: 'Période d\'Activité (format texte)',
      required: true,
      admin: {
        description: 'Ex: "1880-1890", "vers 1905", "actif en 1870"',
      }
    },
    {
      name: 'dateDebutEngagement', // Optionnel
      type: 'date',
      label: 'Date de Début d\'Engagement (précise)',
      admin: {
        date: {
          pickerAppearance: 'dayOnly',
          displayFormat: 'dd/MM/yyyy',
        },
        condition: data => data.periodeActiviteTexte, // Afficher si période texte est remplie, par exemple
      }
    },
    {
      name: 'dateFinEngagement', // Optionnel
      type: 'date',
      label: 'Date de Fin d\'Engagement (précise)',
      admin: {
        date: {
          pickerAppearance: 'dayOnly',
          displayFormat: 'dd/MM/yyyy',
        },
        condition: data => data.periodeActiviteTexte, 
      }
    },
    {
      name: 'descriptionEngagement',
      type: 'textarea',
      label: 'Détails / Notes sur l\'Engagement',
      localized: true,
    }
  ],
};

export default Engagements;
