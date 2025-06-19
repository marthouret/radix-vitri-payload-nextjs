"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
var richtext_lexical_1 = require("@payloadcms/richtext-lexical");
// Les imports pour les cellules personnalisées sont commentés pour l'instant
// import { DateDeCreationCell, DateDeFermetureCell } from '../admin/components/FormattedDateCell';
var Verrerie = {
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
        read: function () { return true; },
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
                    function (_a) { return __awaiter(void 0, [_a], void 0, function (_b) {
                        var slugify, nomPourSlug;
                        var value = _b.value, data = _b.data, originalDoc = _b.originalDoc, operation = _b.operation;
                        return __generator(this, function (_c) {
                            slugify = function (str) {
                                return str
                                    .toLowerCase()
                                    .trim()
                                    .replace(/[^\w\s-]/g, '')
                                    .replace(/[\s_-]+/g, '-')
                                    .replace(/^-+|-+$/g, '');
                            };
                            if (typeof value === 'string' && value.length > 0)
                                return [2 /*return*/, slugify(value)];
                            if ((operation === 'create' && (data === null || data === void 0 ? void 0 : data.nomPrincipal)) ||
                                (operation === 'update' && !value && (data === null || data === void 0 ? void 0 : data.nomPrincipal))) {
                                nomPourSlug = data.nomPrincipal || (originalDoc === null || originalDoc === void 0 ? void 0 : originalDoc.nomPrincipal);
                                if (nomPourSlug && typeof nomPourSlug === 'string')
                                    return [2 /*return*/, slugify(nomPourSlug)];
                            }
                            return [2 /*return*/, value];
                        });
                    }); },
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
                description: 'Listez les différents noms et raisons sociales de la verrerie au fil du temps, avec leurs périodes.',
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
                                description: 'Sélectionnez ou créez le lieu où cette verrerie est (ou était) implantée.',
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
                                description: 'Liez ici les personnalités (directeurs, etc.) et les verriers (ouvriers, artisans) avec leurs fonctions et périodes spécifiques à cette verrerie.',
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
                            editor: (0, richtext_lexical_1.lexicalEditor)({
                                features: function (_a) {
                                    var defaultFeatures = _a.defaultFeatures;
                                    return __spreadArray(__spreadArray([], defaultFeatures, true), [
                                        (0, richtext_lexical_1.RelationshipFeature)(),
                                        (0, richtext_lexical_1.UploadFeature)({
                                            collections: {
                                                media: {
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
                                    ], false).filter(Boolean);
                                },
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
                            editor: (0, richtext_lexical_1.lexicalEditor)({
                                features: function (_a) {
                                    var defaultFeatures = _a.defaultFeatures;
                                    return __spreadArray(__spreadArray([], defaultFeatures, true), [
                                        (0, richtext_lexical_1.UploadFeature)({
                                            collections: {
                                                media: {
                                                    fields: [
                                                        { name: 'alt', label: 'Texte Alternatif', type: 'text' },
                                                    ],
                                                }
                                            }
                                        })
                                    ], false).filter(Boolean);
                                },
                            }),
                        }
                    ],
                },
            ],
        },
    ],
};
exports.default = Verrerie;
