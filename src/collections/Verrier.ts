// src/collections/Verrier.ts
import { CollectionConfig } from 'payload';
// import { lexicalEditor } from '@payloadcms/richtext-lexical'; // Conservé (commenté dans votre source)

const Verrier: CollectionConfig = {
  slug: 'verriers',
  labels: { // Conservé
    singular: 'Verrier',
    plural: 'Verriers',
  },
  admin: {
    useAsTitle: 'nomComplet', // Conservé
    // defaultColumns : les champs lieuDeNaissance et lieuDeDeces pointeront maintenant vers les relations
    defaultColumns: ['nomComplet', 'dateDeNaissance', 'lieuDeNaissance', 'dateDeDeces', 'lieuDeDeces', 'specialisation', 'updatedAt'], // Conservé
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
      label: 'Nom Complet',
      admin: {
        description: 'Généré automatiquement à partir du prénom et du nom si laissé vide, ou peut être saisi manuellement.',
        readOnly: false,
      },
      hooks: {
        beforeChange: [
          ({ value, data, originalDoc, operation }) => {
            if (typeof value === 'string' && value.trim().length > 0) {
              return value.trim();
            }
            const prenomToUse = data?.prenom !== undefined ? data.prenom : originalDoc?.prenom;
            const nomToUse = data?.nom !== undefined ? data.nom : originalDoc?.nom;
            if (typeof prenomToUse === 'string' || typeof nomToUse === 'string') {
              const generatedNomComplet = `${prenomToUse || ''} ${nomToUse || ''}`.trim();
              if (generatedNomComplet && (operation === 'create' || originalDoc?.nomComplet !== generatedNomComplet)) {
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
            if (typeof value === 'string' && value.length > 0) {
              return slugify(value);
            }
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
    // Champs pour Naissance
    {
      type: 'row',
      fields: [
        { // dateDeNaissance - Conservé
          name: 'dateDeNaissance',
          type: 'text',
          label: 'Date de Naissance (texte)',
          admin: {
            width: '50%',
            description: 'Ex: "vers 1787", "le 12/03/1850", "avant 1800"',
          }
        },
        // --- CHAMP lieuDeNaissance MODIFIÉ ---
        // Ancien champ texte (commenté pour suppression après migration) :
        // {
        //   name: 'lieuDeNaissance',
        //   type: 'text',
        //   label: 'Lieu de Naissance',
        //   localized: false,
        //   admin: {
        //     width: '50%',
        //   }
        // },
        // Nouveau champ relationship :
        {
          name: 'lieuDeNaissance',
          label: 'Lieu de Naissance',
          type: 'relationship',
          relationTo: 'lieux', // Pointe vers la collection 'Lieu'
          hasMany: false,
          admin: {
            width: '50%',
            description: 'Sélectionnez le lieu de naissance si connu.',
          }
        },
      ]
    },
    // Champs pour Décès
    {
      type: 'row',
      fields: [
        { // dateDeDeces - Conservé
          name: 'dateDeDeces',
          type: 'text',
          label: 'Date de Décès (texte)',
          admin: {
            width: '50%',
            description: 'Ex: "vers 1820", "le 01/10/1899", "après 1870"',
          }
        },
        // --- CHAMP lieuDeDeces MODIFIÉ ---
        // Ancien champ texte (commenté pour suppression après migration) :
        // {
        //   name: 'lieuDeDeces',
        //   type: 'text',
        //   label: 'Lieu de Décès',
        //   localized: false,
        //   admin: {
        //     width: '50%',
        //   }
        // },
        // Nouveau champ relationship :
        {
          name: 'lieuDeDeces',
          label: 'Lieu de Décès',
          type: 'relationship',
          relationTo: 'lieux', // Pointe vers la collection 'Lieu'
          hasMany: false,
          admin: {
            width: '50%',
            description: 'Sélectionnez le lieu de décès si connu.',
          }
        },
      ]
    },
    { // periodePrincipaleActivite - Conservé
      name: 'periodePrincipaleActivite',
      type: 'text',
      label: 'Période d\'activité principale (ex: 1880-1910)',
      localized: false,
    },
    { // specialisation - Conservé
      name: 'specialisation',
      type: 'text',
      label: 'Spécialisation / Métier principal',
      localized: false,
    },
    { // notesBiographie - Conservé
      name: 'notesBiographie',
      type: 'richText',
      // editor: lexicalEditor({}), // Conservé (commenté dans votre source)
      label: 'Notes biographiques / Parcours',
      localized: true,
    },
  ],
};

export default Verrier;