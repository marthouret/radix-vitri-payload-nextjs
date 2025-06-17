// src/collections/EvenementsBiographiques.ts
import { CollectionConfig } from 'payload';
import { FieldHook } from 'payload'; // Importer FieldHook pour typer correctement

type EvenementBiographiqueData = {
  id: string | number; // L'ID de l'événement lui-même, utile si on modifie un doc existant
  typeEvenement?: string;
  personneConcernee?: string | number; // On s'attend principalement à un ID ici
  dateEvenementTexte?: string;
  dateStructureeEvenement?: {
    anneeSort?: number;
    moisSort?: number;
    jourSort?: number;
    typePrecisionDate?: string;
  };
  lieu?: string | number; // On s'attend principalement à un ID ici (non utilisé par le hook de titre)
  descriptionEvenement?: string;
  titreEvenementPourAdmin?: string; // Le champ que notre hook va définir
};

const genererTitreAdminEvenement: FieldHook<EvenementBiographiqueData, string, EvenementBiographiqueData> = async ({ data, req }) => {
  // 'data' ici est l'ensemble des données du document EvenementsBiographiques qui va être sauvegardé.
  // La valeur retournée par ce hook sera la NOUVELLE VALEUR pour le champ 'titreEvenementPourAdmin'.

  if (!data) return ''; // Retourner une chaîne vide si pas de données, ou la valeur actuelle si besoin

  let titreTypeEvenement  = 'Événement';

    if (data.typeEvenement) {
    // Trouver la définition du champ 'typeEvenement' pour accéder à ses options
    const typeEvenementFieldDefinition = EvenementsBiographiques.fields.find(
      (f) => 'name' in f && f.name === 'typeEvenement'
    );

    if (typeEvenementFieldDefinition && 'options' in typeEvenementFieldDefinition && Array.isArray(typeEvenementFieldDefinition.options)) {
      const options = typeEvenementFieldDefinition.options as { label: string; value: string }[];
      const selectedOption = options.find(opt => opt.value === data.typeEvenement);
      
      if (selectedOption) {
        titreTypeEvenement = selectedOption.label; // On utilise le label qui contient les accents
      } else {
        // Fallback: si la valeur n'est pas trouvée, on formate la valeur brute
        titreTypeEvenement = data.typeEvenement
          .replace(/_/g, ' ')
          .replace(/\b\w/g, l => l.toUpperCase());
      }
    } else {
        // Fallback si on ne trouve pas la définition du champ ou les options
         titreTypeEvenement = data.typeEvenement
          .replace(/_/g, ' ')
          .replace(/\b\w/g, l => l.toUpperCase());
    }
  }

  let titreFinal = titreTypeEvenement;

  let personneNom = 'Personne Inconnue';
  // data.personneConcernee sera l'ID de la personne lors de la création ou de la modification via l'admin.
  // Si la relation est déjà peuplée (rare dans un beforeChange sauf si un autre hook l'a fait),
  // on essaie d'en extraire l'ID.
  const personneId = typeof data.personneConcernee === 'string' || typeof data.personneConcernee === 'number'
                      ? data.personneConcernee
                      : (typeof data.personneConcernee === 'object' && data.personneConcernee !== null)
                        ? (data.personneConcernee as any).id || (data.personneConcernee as any).value // Pour les cas où l'objet est partiellement là
                        : undefined;


  if (personneId && req.payload) {
    try {
        const personneDoc = await req.payload.findByID({
          collection: 'verriers', // Assurez-vous que c'est le bon slug de collection
          id: personneId.toString(), // findByID attend un string pour l'ID
          depth: 0, // Pas besoin de peupler les relations de la personne
        });
        // personneDoc est l'objet Verrier complet (ou null si non trouvé)
        personneNom = personneDoc ? (personneDoc.nomComplet || personneDoc.nom || personneId.toString()) : `ID ${personneId}`;
    } catch(e) {
        console.error("Erreur récupération personne pour titre admin événement biographique:", e);
        personneNom = `ID ${personneId}`;
    }
  }
  titreFinal = `${titreFinal} - ${personneNom}`;

  if (data.dateEvenementTexte) {
    titreFinal = `${titreFinal} (${data.dateEvenementTexte})`;
  } else if (data.dateStructureeEvenement?.anneeSort) {
    titreFinal = `${titreFinal} (env. ${data.dateStructureeEvenement.anneeSort})`;
  }

  console.log('[Hook titreEvenementPourAdmin] Titre généré pour le champ :', titreFinal);
  return titreFinal; // On retourne UNIQUEMENT la chaîne de caractères pour le champ
};

const EvenementsBiographiques: CollectionConfig = {
  slug: 'evenements-biographiques',
  labels: {
    singular: 'Événement Biographique',
    plural: 'Événements Biographiques',
  },
  admin: {
    useAsTitle: 'titreEvenementPourAdmin',
    defaultColumns: ['titreEvenementPourAdmin', 'typeEvenement', 'personneConcernee', 'updatedAt'], // titreEvenementPourAdmin ici pour une meilleure lisibilité
    description: 'Enregistre les événements marquants de la vie d\'une personne (naissance, mariage, décès, etc.).',
    group: 'Personnes',
  },
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'personneConcernee',
      type: 'relationship',
      relationTo: 'verriers',
      required: true,
      hasMany: false,
      label: 'Personne Concernée',
      index: true,
    },
    {
      name: 'typeEvenement',
      type: 'select',
      label: 'Type d\'Événement',
      required: true,
      options: [
        { label: 'Naissance', value: 'naissance' },
        { label: 'Baptême', value: 'bapteme' },
        { label: 'Mariage', value: 'mariage' },
        { label: 'Décès', value: 'deces' },
        { label: 'Inhumation/Sépulture', value: 'inhumation' },
        { label: 'Mention dans un acte', value: 'mention_acte' },
        { label: 'Autre événement marquant', value: 'autre' },
      ],
    },
    {
      name: 'dateEvenementTexte',
      type: 'text',
      label: 'Date de l\'Événement (affichage libre)',
      admin: {
        description: 'Ex: "Le 12 mars 1850", "Vers 1788", "Au printemps 1820"',
      }
    },
    {
      type: 'group',
      name: 'dateStructureeEvenement',
      label: 'Date Structurée (pour tri/filtre)',
      fields: [
        {
          name: 'anneeSort',
          type: 'number',
          label: 'Année',
          required: true,
        },
        {
          name: 'moisSort',
          type: 'number',
          label: 'Mois (1-12)',
          min: 1,
          max: 12,
        },
        {
          name: 'jourSort',
          type: 'number',
          label: 'Jour (1-31)',
          min: 1,
          max: 31,
        },
        {
          name: 'typePrecisionDate',
          type: 'select',
          label: 'Précision de la Date',
          options: [
            { label: 'Jour, Mois et Année exacts', value: 'JourMoisAnneeExacts' },
            { label: 'Mois et Année exacts', value: 'MoisAnneeExacts' },
            { label: 'Année Seule exacte', value: 'AnneeSeuleExacte' },
            { label: 'Vers l\'Année (circa)', value: 'CircaAnnee' },
            { label: 'Avant la date', value: 'AvantDate' },
            { label: 'Après la date', value: 'ApresDate' },
          ],
          defaultValue: 'AnneeSeuleExacte',
          dbName: 'event_bio_prec_date_enum',
        },
      ]
    },
    {
      name: 'lieu',
      label: 'Lieu de l\'Événement',
      type: 'relationship',
      relationTo: 'lieux',
      hasMany: false,
      admin: {
        description: 'Sélectionnez le lieu où l\'événement s\'est produit.',
      }
    },
    {
      name: 'descriptionEvenement',
      type: 'textarea',
      label: 'Description / Détails de l\'Événement',
    },
    // Champ virtuel pour un titre lisible dans l'admin
    {
      name: 'titreEvenementPourAdmin',
      type: 'text',
      label: 'Titre pour Admin (auto-généré)',
      admin: {
        hidden: true, 
        readOnly: true,
      },
      hooks: {
          beforeChange: [genererTitreAdminEvenement]
      }
    }
  ],
};

export default EvenementsBiographiques;