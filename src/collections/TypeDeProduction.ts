import { CollectionConfig } from 'payload';
import { lexicalEditor } from '@payloadcms/richtext-lexical'; 

const TypeDeProduction: CollectionConfig = {
  slug: 'types-de-production',
  labels: {
    singular: 'Type de production',
    plural: 'Types de production',
  },
  admin: {
    useAsTitle: 'nom',
  },
  fields: [
    {
      name: 'nom',
      type: 'text',
      label: 'Nom du Type de Production',
      required: true,
      unique: true, // Assure que chaque type est unique
      localized: true,
    },
    {
      name: 'description',
      type: 'richText',
      editor: lexicalEditor({}),
      label: 'Description Détaillée',
      localized: true,
    },
    // Vous pourriez ajouter des champs pour 'période typique', 'techniques associées', etc.
    {
      name: 'verreriesProductrices', // Relation inverse
      type: 'relationship',
      relationTo: 'verreries',
      hasMany: true,
      admin: {
        readOnly: true,
      }
    },
  ],
};

export default TypeDeProduction;