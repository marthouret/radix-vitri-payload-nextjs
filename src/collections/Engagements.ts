// src/collections/Engagements.ts
import { CollectionConfig } from 'payload';

const Engagements: CollectionConfig = {
  slug: 'engagements',
  admin: {
    useAsTitle: 'titreAdmin',
    defaultColumns: ['verrerie', 'personneConcernee', 'typeEngagement', 'fonctionVerrier', 'fonctionPersonnalite'],
    // Mettez à jour defaultColumns une fois que vous savez quels champs sont les plus pertinents à afficher dans la liste.
    // Peut-être créer un champ admin virtuel qui combine fonctionVerrier/fonctionPersonnalite pour l'affichage.
    description: 'Définit le rôle ou le métier d\'une personne dans une verrerie sur une période donnée.',
    group: 'Personnes',
  },
  access: {
    read: () => true,
  },
  hooks: {
    beforeChange: [
      async ({ data, req }) => {
        let personneNom = '';
        let verrerieNom = '';
        const fonctionNom = '';

        // Récupération du nom du verrier (inchangé)
        if (data.personneConcernee) {
          try {
            const verrier = await req.payload.findByID({
              collection: 'verriers',
              id: data.personneConcernee,
            });
            personneNom = verrier?.nomComplet || verrier?.nom || '';
          } catch (e) {
            console.warn('[Engagements] Impossible de récupérer le verrier', data.personneConcernee, e);
          }
        }

        // Récupération du nom de la verrerie (inchangé)
        if (data.verrerie) {
          try {
            const verrerie = await req.payload.findByID({
              collection: 'verreries',
              id: data.verrerie,
            });
            verrerieNom = verrerie?.nomPrincipal || '';
          } catch (e) {
            console.warn('[Engagements] Impossible de récupérer la verrerie', data.verrerie, e);
          }
        }

        // Récupération du nom de la fonction (inchangé)
        if (data.typeEngagement === 'metier_verrier' && data.fonctionVerrier) {
            // ... (logique de fonction inchangée)
        } else if (data.typeEngagement === 'role_personnalite' && data.fonctionPersonnalite) {
            // ... (logique de fonction inchangée)
        }

        // --- SECTION CORRIGÉE ---
        // Gestion de la période à partir des dates structurées uniquement
        let periode = '';
        const debut = data.dateDebutStructurée;
        const fin = data.dateFinStructurée;

        const formatAnnee = (date: { toString: () => any; }, typePrecision: any) => {
          if (!date) return '';
          switch (typePrecision) {
            case 'CircaAnnee': return `env. ${date}`;
            case 'ApresAnnee': return `après ${date}`;
            case 'AvantAnnee': return `avant ${date}`;
            case 'AnneeSeuleExacte':
            case 'MoisAnneeExacts':
            default:
              return date.toString();
          }
        };

        const debutStr = debut?.anneeDebutSort ? formatAnnee(debut.anneeDebutSort, debut.typePrecisionDateDebut) : '';
        const finStr = fin?.anneeFinSort ? formatAnnee(fin.anneeFinSort, fin.typePrecisionDateFin) : '';

        if (debutStr && finStr && debutStr !== finStr) {
          periode = `${debutStr} - ${finStr}`;
        } else if (debutStr) {
          periode = debutStr;
        } else if (finStr) {
          periode = finStr;
        }
        // --- FIN DE LA SECTION CORRIGÉE ---


        // On assemble le titre avec les informations récupérées (inchangé)
        let titre = personneNom;
        if (fonctionNom) titre += fonctionNom;
        if (periode) titre += ` (${periode})`;
        if (verrerieNom) titre += ` - ${verrerieNom}`;

        if (titre.trim() === '') {
          titre = data.id ? `Engagement ID: ${data.id}` : 'Nouvel Engagement';
        }
        
        return {
          ...data,
          titreAdmin: titre,
        };
      }
    ]
  },
  fields: [
    {
      name: 'titreAdmin',
      type: 'text',
      label: 'Titre (admin)',
      admin: {
        readOnly: true,
        position: 'sidebar',
        description: 'Titre généré automatiquement pour l’admin.',
      }
    },
    {
      name: 'verrerie',
      type: 'relationship',
      relationTo: 'verreries',
      hasMany: false,
      required: true, 
      index: true,
      label: 'Verrerie Concernée',
    },
    {
      name: 'personneConcernee',
      type: 'relationship',
      relationTo: 'verriers',
      hasMany: false,
      required: true, 
      index: true,
      label: 'Personne Concernée',
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

    // NOUVEAUX CHAMPS FONCTION (Option 1)
    {
      name: 'fonctionVerrier',
      label: 'Métier (si Verrier)',
      type: 'relationship',
      relationTo: 'fonctions-verriers', // Slug de votre collection FonctionsVerriers
      hasMany: false,
      required: false, // Commencer avec false
      admin: {
        condition: (_data, siblingData) => siblingData.typeEngagement === 'metier_verrier',
      },
    },
    {
      name: 'fonctionPersonnalite',
      label: 'Rôle (si Personnalité)',
      type: 'relationship',
      relationTo: 'fonctions-personnalites', // Slug de votre collection FonctionsPersonnalites
      hasMany: false,
      required: false, // Commencer avec false
      admin: {
        condition: (_data, siblingData) => siblingData.typeEngagement === 'role_personnalite',
      },
    },
    {
      type: 'group',
      name: 'dateDebutStructurée',
      label: 'Date de Début Structurée',
      fields: [
          {
              name: 'anneeDebutSort', type: 'number', label: 'Année de début',
          },
          {
              name: 'moisDebutSort', type: 'number', label: 'Mois de début (1-12)', min: 1, max: 12,
          },
          {
              name: 'typePrecisionDateDebut',
              type: 'select',
              label: 'Précision Date Début',
              options: [
                  { label: 'Année Seule exacte', value: 'AnneeSeuleExacte' },
                  { label: 'Vers l\'Année (circa)', value: 'CircaAnnee' },
                  { label: 'Après l\'année', value: 'ApresAnnee' }, // NOUVEAU
                  { label: 'Avant l\'année', value: 'AvantAnnee' }, // NOUVEAU
                  { label: 'Mois et Année exacts', value: 'MoisAnneeExacts' },
              ],
              defaultValue: 'AnneeSeuleExacte',
              dbName: 'eng_prec_debut_enum',
          },
      ]
    },
    {
      type: 'group',
      name: 'dateFinStructurée',
      label: 'Date de Fin Structurée',
      fields: [
          {
              name: 'anneeFinSort', type: 'number', label: 'Année de fin',
          },
          {
              name: 'moisFinSort', type: 'number', label: 'Mois de fin (1-12)', min: 1, max: 12,
          },
          {
              name: 'typePrecisionDateFin',
              type: 'select',
              label: 'Précision Date Fin',
              options: [ // Mêmes options que pour le début
                  { label: 'Année Seule exacte', value: 'AnneeSeuleExacte' },
                  { label: 'Vers l\'Année (circa)', value: 'CircaAnnee' },
                  { label: 'Après l\'année', value: 'ApresAnnee' }, // NOUVEAU
                  { label: 'Avant l\'année', value: 'AvantAnnee' }, // NOUVEAU
                  { label: 'Mois et Année exacts', value: 'MoisAnneeExacts' },
              ],
              defaultValue: 'AnneeSeuleExacte',
              dbName: 'eng_prec_fin_enum',
          },
      ]
    },
    {
      name: 'descriptionEngagement',
      type: 'textarea',
      label: 'Détails / Notes sur l\'Engagement',
    }
  ],
};

export default Engagements;