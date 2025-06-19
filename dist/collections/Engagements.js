"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
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
var Engagements = {
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
        read: function () { return true; },
    },
    hooks: {
        beforeChange: [
            function (_a) { return __awaiter(void 0, [_a], void 0, function (_b) {
                var personneNom, verrerieNom, fonctionNom, verrier, e_1, verrerie, e_2, periode, debut, fin, formatAnnee, debutStr, finStr, titre;
                var data = _b.data, req = _b.req;
                return __generator(this, function (_c) {
                    switch (_c.label) {
                        case 0:
                            personneNom = '';
                            verrerieNom = '';
                            fonctionNom = '';
                            if (!data.personneConcernee) return [3 /*break*/, 4];
                            _c.label = 1;
                        case 1:
                            _c.trys.push([1, 3, , 4]);
                            return [4 /*yield*/, req.payload.findByID({
                                    collection: 'verriers',
                                    id: data.personneConcernee,
                                })];
                        case 2:
                            verrier = _c.sent();
                            personneNom = (verrier === null || verrier === void 0 ? void 0 : verrier.nomComplet) || (verrier === null || verrier === void 0 ? void 0 : verrier.nom) || '';
                            return [3 /*break*/, 4];
                        case 3:
                            e_1 = _c.sent();
                            console.warn('[Engagements] Impossible de récupérer le verrier', data.personneConcernee, e_1);
                            return [3 /*break*/, 4];
                        case 4:
                            if (!data.verrerie) return [3 /*break*/, 8];
                            _c.label = 5;
                        case 5:
                            _c.trys.push([5, 7, , 8]);
                            return [4 /*yield*/, req.payload.findByID({
                                    collection: 'verreries',
                                    id: data.verrerie,
                                })];
                        case 6:
                            verrerie = _c.sent();
                            verrerieNom = (verrerie === null || verrerie === void 0 ? void 0 : verrerie.nomPrincipal) || '';
                            return [3 /*break*/, 8];
                        case 7:
                            e_2 = _c.sent();
                            console.warn('[Engagements] Impossible de récupérer la verrerie', data.verrerie, e_2);
                            return [3 /*break*/, 8];
                        case 8:
                            // Récupération du nom de la fonction (inchangé)
                            if (data.typeEngagement === 'metier_verrier' && data.fonctionVerrier) {
                                // ... (logique de fonction inchangée)
                            }
                            else if (data.typeEngagement === 'role_personnalite' && data.fonctionPersonnalite) {
                                // ... (logique de fonction inchangée)
                            }
                            periode = '';
                            debut = data.dateDebutStructurée;
                            fin = data.dateFinStructurée;
                            formatAnnee = function (date, typePrecision) {
                                if (!date)
                                    return '';
                                switch (typePrecision) {
                                    case 'CircaAnnee': return "env. ".concat(date);
                                    case 'ApresAnnee': return "apr\u00E8s ".concat(date);
                                    case 'AvantAnnee': return "avant ".concat(date);
                                    case 'AnneeSeuleExacte':
                                    case 'MoisAnneeExacts':
                                    default:
                                        return date.toString();
                                }
                            };
                            debutStr = (debut === null || debut === void 0 ? void 0 : debut.anneeDebutSort) ? formatAnnee(debut.anneeDebutSort, debut.typePrecisionDateDebut) : '';
                            finStr = (fin === null || fin === void 0 ? void 0 : fin.anneeFinSort) ? formatAnnee(fin.anneeFinSort, fin.typePrecisionDateFin) : '';
                            if (debutStr && finStr && debutStr !== finStr) {
                                periode = "".concat(debutStr, " - ").concat(finStr);
                            }
                            else if (debutStr) {
                                periode = debutStr;
                            }
                            else if (finStr) {
                                periode = finStr;
                            }
                            titre = personneNom;
                            if (fonctionNom)
                                titre += fonctionNom;
                            if (periode)
                                titre += " (".concat(periode, ")");
                            if (verrerieNom)
                                titre += " - ".concat(verrerieNom);
                            if (titre.trim() === '') {
                                titre = data.id ? "Engagement ID: ".concat(data.id) : 'Nouvel Engagement';
                            }
                            return [2 /*return*/, __assign(__assign({}, data), { titreAdmin: titre })];
                    }
                });
            }); }
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
                condition: function (_data, siblingData) { return siblingData.typeEngagement === 'metier_verrier'; },
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
                condition: function (_data, siblingData) { return siblingData.typeEngagement === 'role_personnalite'; },
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
                    options: [
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
exports.default = Engagements;
