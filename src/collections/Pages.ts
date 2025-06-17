// src/collections/Pages.ts
import type { CollectionConfig } from 'payload'
import { generateBaseSlug } from '@/utils/slugs' // On utilise bien votre utilitaire de base

export const Pages: CollectionConfig = {
  slug: 'pages',
  labels: {
    singular: 'Page',
    plural: 'Pages',
  },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'slug', 'updatedAt'],
  },
  access: {
    read: () => true, // Tout le monde peut lire les pages. Attention : seul le ID est renvoyé dan sun appel API select !
  },
  fields: [
    {
      name: 'title',
      label: 'Titre de la page',
      type: 'text',
      required: true,
      access: {
        read: () => true,
      },
    },
    {
      name: 'content',
      label: 'Contenu de la page',
      type: 'richText',
      required: true,
    },
    {
      name: 'slug',
      label: 'Slug (URL)',
      type: 'text',
      admin: {
          position: 'sidebar',
          // Il est souvent bon de rendre le champ 'slug' visible mais en lecture seule
          // pour que l'utilisateur voie le résultat sans pouvoir le modifier facilement
          // et risquer de casser des liens. Vous pouvez décommenter si vous le souhaitez.
          // readOnly: true, 
      },
      hooks: {
        beforeChange: [
          ({ data }) => {
            // On s'assure que data et data.title existent
            if (data?.title) {
              // On génère le slug à partir du titre.
              // Cette logique s'exécutera à la création et à chaque mise à jour,
              // assurant que le slug reste synchronisé si le titre change.
              return generateBaseSlug(data.title);
            }
            // Si pas de titre, on ne change pas le slug
            return data?.slug;
          },
        ],
      },
      access: {
        read: () => true,
      },
      index: true,
      unique: true, // Il est aussi bon de s'assurer que chaque slug est unique
    }
  ],
}