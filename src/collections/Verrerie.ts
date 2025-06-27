// src/collections/Verrerie.ts
import { CollectionConfig } from 'payload';
import { lexicalEditor, UploadFeature, RelationshipFeature, } from '@payloadcms/richtext-lexical';
// import { revalidateHomeAndList } from '../hooks/revalidate'

// Les imports pour les cellules personnalisées sont commentés pour l'instant
// import { DateDeCreationCell, DateDeFermetureCell } from '../admin/components/FormattedDateCell';

const Verrerie: CollectionConfig = {
  slug: 'verreries',
  labels: {
    // Vos labels personnalisés - conservés
    singular: 'Verrerie',
    plural: 'Verreries'
  },
  admin: {
    useAsTitle: 'nomPrincipal',
    defaultColumns: ['nomPrincipal', 'statutActuel', 'updatedAt'],
    group: 'Verreries',
  },
  access: {
    read: () => true,
  },
  hooks: {
    // afterChange: [revalidateHomeAndList('verreries') as any], // On attache le hook ici
  },
  fields: [
    {
      name: 'nomPrincipal',
      type: 'text',
      label: 'Nom Principal',
      required: true,
      localized: false, 
    },
    {
      name: 'slug',
      label: 'Slug (pour URL)',
      type: 'text',
      required: true,
      unique: true,
      index: true,
      admin: { position: 'sidebar' },
      hooks: {
        // Votre hook pour le slug - conservé
        beforeValidate: [
          async ({ value, data, originalDoc, operation }) => {
            const slugify = (str: string): string =>
              str
                .toLowerCase()
                .trim()
                .replace(/[^\w\s-]/g, '')
                .replace(/[\s_-]+/g, '-')
                .replace(/^-+|-+$/g, '')
            if (typeof value === 'string' && value.length > 0) return slugify(value)
            if (
              (operation === 'create' && data?.nomPrincipal) ||
              (operation === 'update' && !value && data?.nomPrincipal)
            ) {
              const nomPourSlug =
                (data.nomPrincipal as string) || (originalDoc?.nomPrincipal as string)
              if (nomPourSlug && typeof nomPourSlug === 'string') return slugify(nomPourSlug)
            }
            return value
          },
        ],
      },
    },
    {
      name: 'statutActuel',
      type: 'select',
      label: 'Statut Actuel',
      admin: { position: 'sidebar' },
      options: [
        { label: 'En activité', value: 'enActivite' },
        { label: "Fermée, vestiges visibles", value: "fermeeVestigesVisibles" },
        { label: 'En ruines', value: 'enRuines' },
        { label: 'Disparue (sans vestiges visibles)', value: 'disparueSansVestiges' },
        { label: 'Site converti (autre usage)', value: 'convertie' },
        { label: "Inconnu", value: "inconnu" },
      ],
    },
    {
      name: 'notesStatutVestiges',
      type: 'textarea',
      label: 'Notes sur le statut et les vestiges',
      admin: { position: 'sidebar' },
      localized: true,
    },
    {
      name: 'nomsAlternatifs', // Conservé tel quel, à supprimer plus tard.
      type: 'array',
      label: 'Noms Alternatifs (obsolète)',
      fields: [
        {
          name: 'typeDeNom',
          type: 'select',
          label: 'Type de Nom',
          options: [
            { label: 'Raison Sociale', value: 'raisonSociale' },
            { label: "Nom d'Usage", value: 'nomUsage' },
            { label: 'Nom du Maître Verrier', value: 'nomMaitreVerrier' },
            { label: 'Nom de Lieu-dit', value: 'nomLieuDit' },
            { label: 'Autre', value: 'autre' },
          ],
        },
        { name: 'nom', type: 'text', label: 'Nom Alternatif', required: true, localized: false },
      ],
    },
    // --- Période d'Activité (Groupe Unique) ---
    {
      name: 'periodeVerriere', // Un nom de groupe simple
      label: "Période d'Activité de la Verrerie",
      type: 'group',
      admin: {
        description: "Définissez la période d'activité principale de cet établissement verrier.",
        // Vous pouvez ajouter un style ou un composant admin pour ce groupe si besoin
      },
      fields: [
        {
          name: 'periodeActiviteTexte',
          type: 'text',
          label: 'Description textuelle de la période',
          admin: {
            description: 'Ex: "de 1780 à 1950 environ", "actif au XIXe siècle", "fondée vers 1750"',
            width: '100%',
          },
        },
        {
          type: 'row', // Mettre les années approx. sur la même ligne
          fields: [
            {
              name: 'anneeFondationApprox',
              type: 'number',
              label: 'Année Fondation (Approx.)',
              admin: { width: '50%' },
            },
            {
              name: 'anneeFermetureApprox',
              type: 'number',
              label: 'Année Fermeture (Approx.)',
              admin: { width: '50%' },
            },
          ],
        },
        // Groupe pour la date de début structurée détaillée (optionnelle)
        {
          label: 'Date de Début (Détaillée)',
          type: 'collapsible', // On peut laisser en groupe pour la clarté visuelle
          admin: {
            description: 'Précisez si vous avez le mois ou un type de précision.',
            initCollapsed: true, // Peut être initialement replié pour ne pas surcharger
          },
          fields: [
            {
              name: 'anneeDebutSort',
              type: 'number',
              label: 'Année Début',
              admin: { width: '33%' },
            },
            {
              name: 'moisDebutSort',
              type: 'number',
              label: 'Mois (1-12)',
              min: 1,
              max: 12,
              admin: { width: '33%' },
            },
            {
              name: 'typePrecisionDateDebut',
              type: 'select',
              label: 'Précision Début',
              options: [
                { label: 'Mois et Année exacts', value: 'MoisAnneeExacts' },
                { label: 'Année Seule exacte', value: 'AnneeSeuleExacte' },
                { label: "Vers l'Année (circa)", value: 'CircaAnnee' },
              ],
              defaultValue: 'AnneeSeuleExacte',
              dbName: 'verreries_prec_debut_enum',
              admin: { width: '33%' },
            },
          ],
        },
        // Groupe pour la date de fin structurée détaillée (optionnelle)
        {
          label: 'Date de Fin (Détaillée)',
          type: 'collapsible',
          admin: {
            description: 'Précisez si vous avez le mois ou un type de précision.',
            initCollapsed: true, // Peut être initialement replié
          },
          fields: [
            { name: 'anneeFinSort', type: 'number', label: 'Année Fin', admin: { width: '33%' } },
            {
              name: 'moisFinSort',
              type: 'number',
              label: 'Mois (1-12)',
              min: 1,
              max: 12,
              admin: { width: '33%' },
            },
            {
              name: 'typePrecisionDateFin',
              type: 'select',
              label: 'Précision Fin',
              options: [
                { label: 'Mois et Année exacts', value: 'MoisAnneeExacts' },
                { label: 'Année Seule exacte', value: 'AnneeSeuleExacte' },
                { label: "Vers l'Année (circa)", value: 'CircaAnnee' },
              ],
              defaultValue: 'AnneeSeuleExacte',
              dbName: 'verreries_prec_fin_enum',
              admin: { width: '33%' },
            },
          ],
        },
      ],
    },
    // --- Noms Historiques et Raisons Sociales ---
    {
      name: 'nomsHistoriquesEtRaisonsSociales',
      label: 'Noms Historiques et Raisons Sociales',
      labels: {
        // Pour nommer les items dans l'UI de l'array
        singular: 'Nom/Raison Sociale Historique',
        plural: 'Noms/Raisons Sociales Historiques',
      },
      type: 'array',
      minRows: 0,
      admin: {
        description:
          'Listez les différents noms et raisons sociales de la verrerie au fil du temps, avec leurs périodes.',
        // On enlève RowLabel pour l'instant pour éviter l'erreur de type
      },
      fields: [
        {
          name: 'nom',
          type: 'text',
          label: 'Nom / Raison Sociale',
          required: true,
          admin: {
            width: '70%',
            // Ce champ 'nom' sera le plus visible pour chaque ligne par défaut
          },
        },
        {
          name: 'typeDeNom',
          type: 'select',
          label: 'Type',
          options: [
            { label: "Nom d'usage", value: 'usage' },
            { label: 'Raison sociale', value: 'raison_sociale' },
            { label: 'Nom de fondation', value: 'fondation' },
            { label: 'Nom populaire/surnom', value: 'populaire' },
            { label: 'Autre', value: 'autre' },
          ],
          defaultValue: 'usage',
          admin: { width: '30%' },
        },
        {
          name: 'periodeValidite',
          type: 'text',
          label: 'Période de Validité (affichage libre)',
          admin: { description: 'Ex: "1749-1792", "vers 1880"' },
        },
        {
          name: 'anneeDebut',
          type: 'number',
          label: 'Année Début (pour tri)',
          admin: { width: '50%' },
        },
        {
          name: 'anneeFin',
          type: 'number',
          label: 'Année Fin (pour tri)',
          admin: { width: '50%' },
        },
        {
          name: 'notes',
          type: 'textarea',
          label: 'Notes sur ce nom/cette période',
        },
      ],
    },
    {
      name: 'fondateurs',
      type: 'relationship',
      relationTo: 'verriers',
      hasMany: true,
      label: 'Fondateur(s) de la Verrerie',
      admin: {
        description: 'Personnalités ayant fondé cet établissement.',
      },
    },
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Dates et Statut (ancien, à supprimer)', // Onglet conservé tel quel, à supprimer
          fields: [
            {
              name: 'dateDeCreation',
              label: 'Date de Création (ancien, à supprimer)',
              type: 'group',
              fields: [
                {
                  name: 'datePreciseCreation',
                  type: 'date',
                  label: 'Date Précise (si connue)',
                  admin: {
                    date: {
                      pickerAppearance: 'dayOnly',
                      displayFormat: 'dd/MM/yyyy',
                      minDate: new Date('1600-01-01'),
                      maxDate: new Date('2000-01-01'),
                    },
                  },
                },
                {
                  name: 'descriptionDateCreation',
                  type: 'text',
                  label: 'Description Date Imprécise (ex: vers 1845, avant 1860)',
                },
              ],
            },
            {
              name: 'dateDeFermeture',
              label: 'Date de Fermeture (ancien, à supprimer)',
              type: 'group',
              fields: [
                {
                  name: 'datePreciseFermeture',
                  type: 'date',
                  label: 'Date Précise (si connue)',
                  admin: {
                    date: {
                      pickerAppearance: 'dayOnly',
                      displayFormat: 'dd/MM/yyyy',
                      minDate: new Date('1600-01-01'),
                      maxDate: new Date('2050-01-01'),
                    },
                  },
                },
                {
                  name: 'descriptionDateFermeture',
                  type: 'text',
                  label: 'Description Date Imprécise',
                },
              ],
            },
          ],
        },
        {
          label: 'Localisation', // Onglet conservé
          fields: [
            {
              name: 'lieuPrincipal',
              label: "Lieu d'implantation principal",
              type: 'relationship',
              relationTo: 'lieux', // Assurez-vous que la slug de votre collection Lieu est bien 'lieux'
              hasMany: false, // Une verrerie a un seul lieu principal
              required: true, // Un lieu est requis pour une verrerie
              /* filterOptions: { 
                typeDeLieu: { equals: 'site_verrier' }
              }, */
              admin: {
                description:
                  'Sélectionnez ou créez le lieu où cette verrerie est (ou était) implantée.',
              },
            },
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
                description:
                  'Liez ici les personnalités (directeurs, etc.) et les verriers (ouvriers, artisans) avec leurs fonctions et périodes spécifiques à cette verrerie.',
              },
            },
            {
              name: 'typesDeProduction',
              type: 'relationship',
              label: 'Types de Production',
              relationTo: 'types-de-production',
              hasMany: true,
            },
          ],
        },
        {
          label: 'Médias et Sources', // Onglet conservé tel quel
          fields: [
            {
              name: 'imagesEtMedias',
              type: 'relationship',
              label: 'Images et Médias',
              relationTo: 'media',
              hasMany: true,
            },
            {
              name: 'sourcesBibliographiques',
              type: 'array',
              label: 'Sources Bibliographiques',
              fields: [
                {
                  name: 'typeSource',
                  type: 'select',
                  label: 'Type de Source',
                  options: [
                    { label: 'Livre', value: 'livre' },
                    { label: 'Article', value: 'article' },
                    { label: 'Site Web', value: 'siteWeb' },
                    { label: 'Archive', value: 'archive' },
                    { label: 'Entretien', value: 'entretien' },
                    { label: 'Autre', value: 'autre' },
                  ],
                },
                { name: 'titre', type: 'text', label: 'Titre' },
                { name: 'auteur', type: 'text', label: 'Auteur(s)' },
                { name: 'url', type: 'text', label: 'URL (si applicable)' },
                {
                  name: 'detailsPublication',
                  type: 'text',
                  label: 'Détails de publication (éditeur, année, pages, etc.)',
                },
                {
                  name: 'citationOuExtrait',
                  type: 'textarea',
                  label: 'Citation / Extrait pertinent',
                },
                { name: 'notesSource', type: 'textarea', label: 'Notes sur la source' },
              ],
            },
          ],
        },
        {
          label: 'Histoire et Description', // Onglet conservé tel quel
          fields: [
            {
              name: 'histoire',
              type: 'richText',
              label: 'Histoire de la Verrerie',
              localized: true,
              editor: lexicalEditor({
                features: ({ defaultFeatures }) => [
                  ...defaultFeatures,
                  RelationshipFeature(),
                  UploadFeature({ 
                    collections: {
                      media: { // Slug de votre collection media
                        // Optionnel: Définir quels champs de votre collection media sont utilisés par l'éditeur Lexical
                        // pour l'image (ex: alt text). Si non défini, Payload utilise des valeurs par défaut.
                        fields: [
                          {
                            name: 'alt', // Nom du champ 'alt' dans votre collection 'media'
                            label: 'Texte Alternatif',
                            type: 'text',
                          },
                        ],
                      }
                    }
                  }),
                ].filter(Boolean),
              }),
            },
            {
              name: 'techniquesInnovations',
              type: 'textarea',
              label: 'Techniques Spécifiques et Innovations',
              localized: true,
            },
            {
              name: 'aspectsSociaux',
              type: 'richText',
              label: 'Aspects Sociaux',
              localized: true,
              editor: lexicalEditor({ // Appliquer la même configuration
                features: ({ defaultFeatures }) => [
                  ...defaultFeatures,
                  UploadFeature({
                    collections: {
                      media: {
                        fields: [
                          { name: 'alt', label: 'Texte Alternatif', type: 'text' },
                        ],
                      }
                    }
                  })
                ].filter(Boolean),
              }),
            }
          ],
        },
      ],
    },
  ],
}

export default Verrerie;