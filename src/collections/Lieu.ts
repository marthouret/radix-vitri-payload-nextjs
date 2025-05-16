import { CollectionConfig } from 'payload';

const Lieu: CollectionConfig = {
  slug: 'lieux',
  labels: {
    singular: 'Lieu',
    plural: 'Lieux',
  },
  admin: {
    useAsTitle: 'nomCompletAffichage', // Champ virtuel pour un meilleur affichage dans l'admin
    defaultColumns: ['nomCompletAffichage', 'villeOuCommune', 'departement', 'region', 'pays'],
    group: 'Géographie', // Pour organiser vos collections dans l'admin
  },
  access: {
    read: () => true, // Ouvert en lecture par défaut
  },
  fields: [
    {
      name: 'nomDuLieu',
      label: 'Nom spécifique du lieu (hameau, quartier, lieu-dit)',
      type: 'text',
      localized: true, // Si vous prévoyez une traduction
    },
    {
      name: 'adresse',
      label: 'Adresse (numéro et rue)',
      type: 'text',
      localized: true,
    },
    {
      name: 'villeOuCommune',
      label: 'Ville ou Commune',
      type: 'text',
      required: true,
      localized: true,
      admin: {
        description: 'Ex: Rive-de-Gier, Givors, Saint-Étienne',
      }
    },
    {
      name: 'codePostal',
      label: 'Code Postal',
      type: 'text',
    },
    {
      name: 'departement',
      label: 'Département',
      type: 'text',
      admin: {
        description: 'Ex: Loire, Rhône',
      }
    },
    {
      name: 'region',
      label: 'Région Administrative',
      type: 'text',
      admin: {
        description: 'Ex: Auvergne-Rhône-Alpes',
      }
    },
    {
      name: 'pays',
      label: 'Pays',
      type: 'text',
      defaultValue: 'France',
      required: true,
    },
    {
      name: 'coordonnees',
      label: 'Coordonnées Géographiques',
      type: 'point', // Format [longitude, latitude]
      required: true,
      admin: {
        description: 'Cliquez sur la carte pour définir le point, ou entrez manuellement longitude puis latitude.',
      }
    },
    {
      name: 'notesHistoriquesSurLeLieu',
      label: 'Notes historiques ou complémentaires sur le lieu',
      type: 'richText',
      localized: true,
    },
    // Champ virtuel pour l'affichage dans l'admin et les relations
    {
      name: 'nomCompletAffichage',
      label: 'Nom complet pour affichage',
      type: 'text',
      admin: {
        hidden: true, // Caché dans le formulaire de modification direct du champ
        // Mais sera utilisé pour useAsTitle et dans les listes/relations
      },
      access: {
        create: () => false, // Ce champ n'est pas créé directement
        update: () => false, // Ni mis à jour directement
      },
      hooks: {
        afterRead: [
          // Modification ici: utilisation de originalDoc
          ({ originalDoc }) => {
            // originalDoc contient toutes les données du document Lieu en cours de lecture
            if (originalDoc) {
              const parts = [
                originalDoc.nomDuLieu,
                originalDoc.adresse,
                originalDoc.villeOuCommune,
                originalDoc.codePostal,
                originalDoc.departement,
                originalDoc.region,
                originalDoc.pays,
              ].filter(Boolean); // Filtre les valeurs nulles, undefined ou vides

              if (parts.length > 0) {
                return parts.join(', ');
              }
              // Si toutes les parties sont vides, on essaie un fallback plus simple
              // originalDoc.id est toujours présent sur un document lu
              return originalDoc.villeOuCommune || String(originalDoc.id) || '';
            }
            // Si originalDoc n'existe pas (cas très improbable ici), retourner une chaîne vide
            return '';
          }
        ],
      },
    },
  ],
};

export default Lieu;