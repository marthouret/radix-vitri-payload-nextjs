// src/collections/Verrerie.ts
import { CollectionConfig } from 'payload';
import { lexicalEditor } from '@payloadcms/richtext-lexical';

// Les imports pour les cellules personnalisées sont commentés pour l'instant
// import { DateDeCreationCell, DateDeFermetureCell } from '../admin/components/FormattedDateCell';

const Verrerie: CollectionConfig = {
  slug: 'verreries',
  labels: { // Vos labels personnalisés - conservés
    singular: { en: 'Glasswork', fr: 'Verrerie' },
    plural: { en: 'Glassworks', fr: 'Verreries' }
  },
  admin: {
    useAsTitle: 'nomPrincipal',
    // MODIFICATION ICI: 'ville' remplacé par 'lieuPrincipal'
    defaultColumns: ['nomPrincipal', 'statutActuel', 'updatedAt'],
  },
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'nomPrincipal',
      type: 'text',
      label: 'Nom Principal',
      required: true,
      localized: false, // Conservé tel quel
    },
    {
      name: 'slug',
      label: 'Slug (pour URL)',
      type: 'text',
      required: true,
      unique: true,
      index: true,
      admin: {
        position: 'sidebar',
      },
      hooks: { // Votre hook pour le slug - conservé
        beforeValidate: [
          async ({ value, data, originalDoc, operation }) => {
            const slugify = (str: string): string => str.toLowerCase().trim().replace(/[^\w\s-]/g, '').replace(/[\s_-]+/g, '-').replace(/^-+|-+$/g, '');
            if (typeof value === 'string' && value.length > 0) return slugify(value);
            if (operation === 'create' && data?.nomPrincipal || (operation === 'update' && !value && data?.nomPrincipal)) {
              const nomPourSlug = (data.nomPrincipal as string) || (originalDoc?.nomPrincipal as string);
              if (nomPourSlug && typeof nomPourSlug === 'string') return slugify(nomPourSlug);
            }
            return value;
          },
        ],
      },
    },
    {
      name: 'nomsAlternatifs', // Conservé tel quel
      type: 'array',
      label: 'Noms Alternatifs',
      fields: [
        {
          name: 'typeDeNom',
          type: 'select',
          label: 'Type de Nom',
          options: [
            { label: 'Raison Sociale', value: 'raisonSociale' },
            { label: 'Nom d\'Usage', value: 'nomUsage' },
            { label: 'Nom du Maître Verrier', value: 'nomMaitreVerrier' },
            { label: 'Nom de Lieu-dit', value: 'nomLieuDit' },
            { label: 'Autre', value: 'autre' },
          ],
        },
        { name: 'nom', type: 'text', label: 'Nom Alternatif', required: true, localized: false, },
      ],
    },
    {
      name: 'fondateurs', // Conservé tel quel
      type: 'relationship',
      relationTo: 'personnalites',
      hasMany: true,
      label: 'Fondateur(s) de la Verrerie',
      admin: {
        description: 'Personnalités ayant fondé cet établissement.',
      }
    },
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Dates et Statut', // Onglet conservé tel quel
          fields: [
            {
              name: 'dateDeCreation',
              label: 'Date de Création',
              type: 'group',
              fields: [
                { name: 'datePreciseCreation', type: 'date', label: 'Date Précise (si connue)', admin: { date: { pickerAppearance: 'dayOnly', displayFormat: 'dd/MM/yyyy', minDate: new Date('1600-01-01'), maxDate: new Date('2000-01-01'), },}, },
                { name: 'descriptionDateCreation', type: 'text', label: 'Description Date Imprécise (ex: vers 1845, avant 1860)', },
              ],
            },
            {
              name: 'dateDeFermeture',
              label: 'Date de Fermeture',
              type: 'group',
              fields: [
                { name: 'datePreciseFermeture', type: 'date', label: 'Date Précise (si connue)', admin: { date: { pickerAppearance: 'dayOnly', displayFormat: 'dd/MM/yyyy', minDate: new Date('1600-01-01'), maxDate: new Date('2050-01-01'), },}, },
                { name: 'descriptionDateFermeture', type: 'text', label: 'Description Date Imprécise', },
              ],
            },
            { name: 'statutActuel', type: 'select', label: 'Statut Actuel', options: [ { label: 'En activité', value: 'enActivite' }, { label: 'Fermée définitivement', value: 'fermeeDefinitivement' }, { label: 'Fermée temporairement', value: 'fermeeTemporairement' }, { label: 'En ruines', value: 'enRuines' }, { label: 'Disparue (sans vestiges visibles)', value: 'disparueSansVestiges' }, { label: 'Convertie (autre usage)', value: 'convertie' }, ], },
            { name: 'notesStatutVestiges', type: 'textarea', label: 'Notes sur le statut et les vestiges', localized: true, },
          ],
        },
        {
          label: 'Localisation', // Onglet conservé
          fields: [
            // --- NOUVEAU CHAMP DE RELATION VERS 'lieux' ---
            {
              name: 'lieuPrincipal',
              label: 'Lieu d\'implantation principal',
              type: 'relationship',
              relationTo: 'lieux', // Assurez-vous que la slug de votre collection Lieu est bien 'lieux'
              hasMany: false,    // Une verrerie a un seul lieu principal
              required: false,    // Un lieu est requis pour une verrerie
              admin: {
                description: 'Sélectionnez ou créez le lieu où cette verrerie est (ou était) implantée.',
              }
            },
            // --- ANCIENS CHAMPS DE LOCALISATION (À SUPPRIMER APRÈS MIGRATION) ---
            // { name: 'adresse', type: 'text', label: 'Adresse',},
            // { name: 'ville', type: 'text', label: 'Ville',},
            // { name: 'coordonnees', type: 'point', label: 'Coordonnées GPS',},
          ],
        },
        {
          label: 'Personnel et Rôles (Engagements)', // Onglet conservé tel quel
          fields: [
            {
              name: 'engagements',
              type: 'relationship',
              relationTo: 'engagements',
              hasMany: true,
              label: 'Engagements (Rôles, Métiers, Périodes)',
              admin: {
                description: 'Liez ici les personnalités (directeurs, etc.) et les verriers (ouvriers, artisans) avec leurs fonctions et périodes spécifiques à cette verrerie.',
              }
            },
            { name: 'typesDeProduction', type: 'relationship', label: 'Types de Production', relationTo: 'types-de-production', hasMany: true, },
          ]
        },
        {
          label: 'Médias et Sources', // Onglet conservé tel quel
          fields: [
            { name: 'imagesEtMedias', type: 'relationship', label: 'Images et Médias', relationTo: 'media', hasMany: true, },
            {
              name: 'sourcesBibliographiques',
              type: 'array',
              label: 'Sources Bibliographiques',
              fields: [
                { name: 'typeSource', type: 'select', label: 'Type de Source', options: [ {label: 'Livre', value: 'livre'}, {label: 'Article', value: 'article'}, {label: 'Site Web', value: 'siteWeb'}, {label: 'Archive', value: 'archive'}, {label: 'Entretien', value: 'entretien'}, {label: 'Autre', value: 'autre'}, ] },
                { name: 'titre', type: 'text', label: 'Titre', },
                { name: 'auteur', type: 'text', label: 'Auteur(s)', },
                { name: 'url', type: 'text', label: 'URL (si applicable)', },
                { name: 'detailsPublication', type: 'text', label: 'Détails de publication (éditeur, année, pages, etc.)' },
                { name: 'citationOuExtrait', type: 'textarea', label: 'Citation / Extrait pertinent' },
                { name: 'notesSource', type: 'textarea', label: 'Notes sur la source', },
              ],
            },
          ],
        },
        {
          label: 'Histoire et Description', // Onglet conservé tel quel
          fields: [
            { name: 'histoire', type: 'richText', editor: lexicalEditor({}), label: 'Histoire de la Verrerie', localized: true, },
            { name: 'techniquesInnovations', type: 'textarea', label: 'Techniques Spécifiques et Innovations', localized: true, },
            { name: 'aspectsSociaux', type: 'richText', editor: lexicalEditor({}), label: 'Aspects Sociaux', localized: true, }
          ],
        },
      ],
    },
  ],
};

export default Verrerie;