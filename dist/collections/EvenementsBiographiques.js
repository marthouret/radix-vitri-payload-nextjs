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
Object.defineProperty(exports, "__esModule", { value: true });
var genererTitreAdminEvenement = function (_a) { return __awaiter(void 0, [_a], void 0, function (_b) {
    var titreTypeEvenement, typeEvenementFieldDefinition, options, selectedOption, titreFinal, personneNom, personneId, personneDoc, e_1;
    var _c;
    var data = _b.data, req = _b.req;
    return __generator(this, function (_d) {
        switch (_d.label) {
            case 0:
                // 'data' ici est l'ensemble des données du document EvenementsBiographiques qui va être sauvegardé.
                // La valeur retournée par ce hook sera la NOUVELLE VALEUR pour le champ 'titreEvenementPourAdmin'.
                if (!data)
                    return [2 /*return*/, '']; // Retourner une chaîne vide si pas de données, ou la valeur actuelle si besoin
                titreTypeEvenement = 'Événement';
                if (data.typeEvenement) {
                    typeEvenementFieldDefinition = EvenementsBiographiques.fields.find(function (f) { return 'name' in f && f.name === 'typeEvenement'; });
                    if (typeEvenementFieldDefinition && 'options' in typeEvenementFieldDefinition && Array.isArray(typeEvenementFieldDefinition.options)) {
                        options = typeEvenementFieldDefinition.options;
                        selectedOption = options.find(function (opt) { return opt.value === data.typeEvenement; });
                        if (selectedOption) {
                            titreTypeEvenement = selectedOption.label; // On utilise le label qui contient les accents
                        }
                        else {
                            // Fallback: si la valeur n'est pas trouvée, on formate la valeur brute
                            titreTypeEvenement = data.typeEvenement
                                .replace(/_/g, ' ')
                                .replace(/\b\w/g, function (l) { return l.toUpperCase(); });
                        }
                    }
                    else {
                        // Fallback si on ne trouve pas la définition du champ ou les options
                        titreTypeEvenement = data.typeEvenement
                            .replace(/_/g, ' ')
                            .replace(/\b\w/g, function (l) { return l.toUpperCase(); });
                    }
                }
                titreFinal = titreTypeEvenement;
                personneNom = 'Personne Inconnue';
                personneId = typeof data.personneConcernee === 'string' || typeof data.personneConcernee === 'number'
                    ? data.personneConcernee
                    : (typeof data.personneConcernee === 'object' && data.personneConcernee !== null)
                        ? data.personneConcernee.id || data.personneConcernee.value // Pour les cas où l'objet est partiellement là
                        : undefined;
                if (!(personneId && req.payload)) return [3 /*break*/, 4];
                _d.label = 1;
            case 1:
                _d.trys.push([1, 3, , 4]);
                return [4 /*yield*/, req.payload.findByID({
                        collection: 'verriers', // Assurez-vous que c'est le bon slug de collection
                        id: personneId.toString(), // findByID attend un string pour l'ID
                        depth: 0, // Pas besoin de peupler les relations de la personne
                    })];
            case 2:
                personneDoc = _d.sent();
                // personneDoc est l'objet Verrier complet (ou null si non trouvé)
                personneNom = personneDoc ? (personneDoc.nomComplet || personneDoc.nom || personneId.toString()) : "ID ".concat(personneId);
                return [3 /*break*/, 4];
            case 3:
                e_1 = _d.sent();
                console.error("Erreur récupération personne pour titre admin événement biographique:", e_1);
                personneNom = "ID ".concat(personneId);
                return [3 /*break*/, 4];
            case 4:
                titreFinal = "".concat(titreFinal, " - ").concat(personneNom);
                if (data.dateEvenementTexte) {
                    titreFinal = "".concat(titreFinal, " (").concat(data.dateEvenementTexte, ")");
                }
                else if ((_c = data.dateStructureeEvenement) === null || _c === void 0 ? void 0 : _c.anneeSort) {
                    titreFinal = "".concat(titreFinal, " (env. ").concat(data.dateStructureeEvenement.anneeSort, ")");
                }
                console.log('[Hook titreEvenementPourAdmin] Titre généré pour le champ :', titreFinal);
                return [2 /*return*/, titreFinal]; // On retourne UNIQUEMENT la chaîne de caractères pour le champ
        }
    });
}); };
var EvenementsBiographiques = {
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
        read: function () { return true; },
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
exports.default = EvenementsBiographiques;
