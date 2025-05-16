// src/collections/Personnalite.ts
import { CollectionConfig } from 'payload';
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
    defaultColumns: ['nomComplet', 'nom', 'prenom', 'rolePrincipal', 'updatedAt'], // Conservé
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
    { // slug - Conservé (y compris hook)
      name: 'slug',
      label: 'Slug (pour URL)',
      type: 'text',
      admin: { position: 'sidebar' },
      unique: true,
      index: true,
      hooks: {
        beforeValidate: [
          async ({ value, data, originalDoc, operation }) => {
            const slugify = (str: string): string => str.toLowerCase().trim().replace(/[^\w\s-]/g, '').replace(/[\s_-]+/g, '-').replace(/^-+|-+$/g, '');
            if (typeof value === 'string' && value.length > 0) return slugify(value);
            let nameToSlugify = data?.nomComplet !== undefined ? data.nomComplet : originalDoc?.nomComplet;
            if (!nameToSlugify) {
              const prenomToUse = data?.prenom !== undefined ? data.prenom : originalDoc?.prenom;
              const nomToUse = data?.nom !== undefined ? data.nom : originalDoc?.nom;
              if (prenomToUse || nomToUse) {
                nameToSlugify = `${prenomToUse || ''} ${nomToUse || ''}`.trim();
              }
            }
            if (nameToSlugify && (operation === 'create' || (operation === 'update' && !originalDoc?.slug) )) {
              return slugify(nameToSlugify);
            }
            return value;
          },
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
        // --- CHAMP lieuDeNaissance MODIFIÉ ---
        // Ancien champ texte (commenté pour suppression après migration) :
        // {
        //   name: 'lieuDeNaissance',
        //   type: 'text',
        //   label: 'Lieu de Naissance',
        //   localized: false,
        //   admin: { width: '50%', }
        // },
        // Nouveau champ relationship :
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
        // --- CHAMP lieuDeDeces MODIFIÉ ---
        // Ancien champ texte (commenté pour suppression après migration) :
        // {
        //   name: 'lieuDeDeces',
        //   type: 'text',
        //   label: 'Lieu de Décès',
        //   localized: false,
        //   admin: { width: '50%', }
        // },
        // Nouveau champ relationship :
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
    { // biographie - Conservé
      name: 'biographie',
      type: 'richText',
      label: 'Biographie',
      localized: true,
    },
  ],
};

export default Personnalite;