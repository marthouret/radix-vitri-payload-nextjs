// src/collections/Personnalite.ts
import { CollectionConfig } from 'payload';
import { createSimplifiedSlugHook } from '@/utils/payloadHooks';
// Importer les options partagées
import { rolePrincipalOptions } from '../config/selectOptions'; // Conservé

const Personnalite: CollectionConfig = {
  slug: 'personnalites',
  labels: { // Conservé
    singular: 'Personnalité',
    plural: 'Personnalités',
  },
  admin: {
    useAsTitle: 'nomComplet', // Conservé
    defaultColumns: ['nomComplet', 'nom', 'prenom', 'rolePrincipal', 'updatedAt'],
    group: 'Verreries',
  },
  access: {
    read: () => true, // Conservé
  },
  fields: [
    { // nom - Conservé
      name: 'nom',
      type: 'text',
      label: 'Nom',
      required: true,
    },
    { // prenom - Conservé
      name: 'prenom',
      type: 'text',
      label: 'Prénom',
    },
    { // nomComplet - Conservé (y compris hook)
      name: 'nomComplet',
      type: 'text',
      label: 'Nom Complet (affichage)',
      admin: {
        description: 'Généré automatiquement si laissé vide, ou peut être saisi manuellement.',
      },
      hooks: {
        beforeChange: [
          ({ value, data, originalDoc }) => {
            if (typeof value === 'string' && value.trim().length > 0) {
              return value.trim();
            }
            const prenomToUse = data?.prenom !== undefined ? data.prenom : originalDoc?.prenom;
            const nomToUse = data?.nom !== undefined ? data.nom : originalDoc?.nom;
            if (typeof prenomToUse === 'string' || typeof nomToUse === 'string') {
              const generatedNomComplet = `${prenomToUse || ''} ${nomToUse || ''}`.trim();
              if (generatedNomComplet && (originalDoc?.nomComplet !== generatedNomComplet)) {
                return generatedNomComplet;
              }
            }
            return value;
          }
        ]
      }
    },
    {
      name: 'sexe',
      label: 'Sexe',
      type: 'select',
      options: [
        { label: 'Masculin', value: 'M' },
        { label: 'Féminin', value: 'F' },
        // { label: 'Non spécifié', value: 'X' },
      ],
      // required: false,
      admin: {
        description: 'Pour l\'accord grammatical.',
        // width: '50%',
      }
    },
    { // slug - Conservé (y compris hook)
      name: 'slug',
      label: 'Slug (pour URL)',
      type: 'text',
      admin: { position: 'sidebar' },
      unique: true,
      index: true,
      hooks: {
        beforeValidate: [
          createSimplifiedSlugHook()
        ],
      },
    },
    { // rolePrincipal - Conservé
      name: 'rolePrincipal',
      type: 'select',
      label: 'Rôle Principal / Titre',
      required: true,
      options: rolePrincipalOptions,
    },
    {
      type: 'row',
      fields: [
        { // dateDeNaissance - Conservé
          name: 'dateDeNaissance',
          type: 'text',
          label: 'Date de Naissance (texte)',
          admin: { width: '50%', description: 'Ex: "vers 1750", "le 12/03/1810"', }
        },
        {
          name: 'lieuDeNaissance',
          label: 'Lieu de Naissance',
          type: 'relationship',
          relationTo: 'lieux', // Pointe vers la collection 'Lieu'
          hasMany: false,     // Une personne a un seul lieu de naissance
          // required: false, // Généralement optionnel
          admin: {
            width: '50%',
            description: 'Sélectionnez le lieu de naissance si connu.',
          }
        },
      ]
    },
    {
      type: 'row',
      fields: [
        { // dateDeDeces - Conservé
          name: 'dateDeDeces',
          type: 'text',
          label: 'Date de Décès (texte)',
          admin: { width: '50%', description: 'Ex: "vers 1820", "le 01/10/1880"', }
        },
        {
          name: 'lieuDeDeces',
          label: 'Lieu de Décès',
          type: 'relationship',
          relationTo: 'lieux', // Pointe vers la collection 'Lieu'
          hasMany: false,     // Une personne a un seul lieu de décès
          // required: false, // Généralement optionnel
          admin: {
            width: '50%',
            description: 'Sélectionnez le lieu de décès si connu.',
          }
        },
      ]
    },
    {
      name: 'anneeNaissance',
      label: 'Année de Naissance (pour affichage/tri)',
      type: 'number',
      admin: {
        description: 'Année seulement, ex: 1820.',
        width: '50%'
      }
    },
    {
      name: 'anneeDeces',
      label: 'Année de Décès (pour affichage/tri)',
      type: 'number',
      admin: {
        description: 'Année seulement, ex: 1890.',
        width: '50%'
      }
    },
    { // biographie - Conservé
      name: 'biographie',
      type: 'richText',
      label: 'Biographie',
      localized: true,
    },
  ],
};

export default Personnalite;