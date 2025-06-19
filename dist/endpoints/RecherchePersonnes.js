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
exports.recherchePersonnesEndpoint = void 0;
var server_1 = require("next/server");
var recherchePersonnesHandler = function (req) { return __awaiter(void 0, void 0, void 0, function () {
    var payload, query, searchTerm, verreriesFondateurMap, verriersQuery, verrierIds, personnesMap_1, engagements, engagementsQuery, verreriesQuery, uniquePeople, finalResults, error_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                payload = req.payload, query = req.query;
                searchTerm = query.q;
                if (!searchTerm || typeof searchTerm !== 'string') {
                    return [2 /*return*/, server_1.NextResponse.json({ error: 'Le terme de recherche est manquant ou invalide.' }, { status: 400 })];
                }
                verreriesFondateurMap = new Map();
                _a.label = 1;
            case 1:
                _a.trys.push([1, 8, , 9]);
                return [4 /*yield*/, payload.find({
                        collection: 'verriers',
                        where: { nomComplet: { like: searchTerm } },
                        depth: 0,
                        limit: 100,
                    })];
            case 2:
                verriersQuery = _a.sent();
                verrierIds = verriersQuery.docs.map(function (v) { return v.id; });
                personnesMap_1 = new Map();
                engagements = [];
                if (!(verrierIds.length > 0)) return [3 /*break*/, 4];
                return [4 /*yield*/, payload.find({
                        collection: 'engagements',
                        where: { personneConcernee: { in: verrierIds } },
                        depth: 1,
                        limit: 200,
                    })];
            case 3:
                engagementsQuery = _a.sent();
                engagements = engagementsQuery.docs;
                engagements.forEach(function (eng) {
                    var _a;
                    if (typeof eng.personneConcernee === 'object' && ((_a = eng.personneConcernee) === null || _a === void 0 ? void 0 : _a.id)) {
                        personnesMap_1.set(eng.personneConcernee.id.toString(), eng.personneConcernee);
                    }
                });
                _a.label = 4;
            case 4:
                if (!(verrierIds.length > 0)) return [3 /*break*/, 6];
                return [4 /*yield*/, payload.find({
                        collection: 'verreries',
                        where: { fondateurs: { in: verrierIds } },
                        depth: 1, // depth=1 est ok si periodeVerriere n'est pas une relation
                        limit: 100,
                    })];
            case 5:
                verreriesQuery = _a.sent();
                verreriesQuery.docs.forEach(function (verrerie) {
                    if (Array.isArray(verrerie.fondateurs)) {
                        verrerie.fondateurs.forEach(function (fondateur) {
                            var _a;
                            var fondateurId = (typeof fondateur === 'object' ? fondateur.id : fondateur).toString();
                            if (!verreriesFondateurMap.has(fondateurId)) {
                                verreriesFondateurMap.set(fondateurId, []);
                            }
                            // Logique de date : la date d'un engagement de fondateur est déduite de la date de début ou de création de la verrerie.
                            var dateDebut; // Notre objet date final
                            // Priorité 1 : On utilise les données structurées de periodeVerriere si elles existent
                            if (verrerie.periodeVerriere && verrerie.periodeVerriere.anneeDebutSort) {
                                dateDebut = {
                                    anneeDebutSort: verrerie.periodeVerriere.anneeDebutSort,
                                    moisDebutSort: verrerie.periodeVerriere.moisDebutSort,
                                    typePrecisionDateDebut: verrerie.periodeVerriere.typePrecisionDateDebut,
                                };
                            }
                            // Priorité 2 : Sinon, on se rabat sur l'année approximative
                            else if ((_a = verrerie.periodeVerriere) === null || _a === void 0 ? void 0 : _a.anneeFondationApprox) {
                                dateDebut = {
                                    anneeDebutSort: verrerie.periodeVerriere.anneeFondationApprox,
                                    typePrecisionDateDebut: 'CircaAnnee', // On suppose que c'est une approximation
                                };
                            }
                            // Priorité 3 : On pourrait même vérifier dateDeCreation.datePreciseCreation ici
                            // ...
                            else {
                                dateDebut = undefined; // Aucune date trouvée
                            }
                            verreriesFondateurMap.get(fondateurId).push({
                                verrerie: { id: verrerie.id, nomPrincipal: verrerie.nomPrincipal, slug: verrerie.slug },
                                dateDebutStructurée: dateDebut,
                            });
                        });
                    }
                });
                _a.label = 6;
            case 6:
                uniquePeople = Array.from(personnesMap_1.values());
                console.log('Personnes uniques trouvées:', uniquePeople);
                return [4 /*yield*/, Promise.all(uniquePeople.map(function (personne) { return __awaiter(void 0, void 0, void 0, function () {
                        var allEngagementsForPerson, fondateurDe, engagementsFondateur;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0: return [4 /*yield*/, payload.find({
                                        collection: 'engagements',
                                        where: { personneConcernee: { equals: personne.id.toString() } },
                                        depth: 2,
                                        limit: 100,
                                    })];
                                case 1:
                                    allEngagementsForPerson = (_a.sent()).docs;
                                    // Récupère les verreries fondées par cette personne
                                    console.log('verreriesFondateurMap:', verreriesFondateurMap);
                                    fondateurDe = verreriesFondateurMap.get(personne.id.toString()) || [];
                                    engagementsFondateur = fondateurDe.map(function (v) { return ({
                                        id: "fondateur-".concat(v.verrerie.id),
                                        typeEngagement: 'role_personnalite',
                                        fonctionPersonnalite: { nom: 'Fondateur' }, // Simplifié
                                        verrerie: v.verrerie,
                                        // On utilise directement l'objet qu'on a préparé
                                        dateDebutStructurée: v.dateDebutStructurée,
                                        dateFinStructurée: undefined, // Pas de date de fin pour un fondateur
                                        // On met les autres champs à null pour la cohérence des types
                                        fonctionVerrier: null,
                                        periodeActiviteTexte: null,
                                        descriptionEngagement: null,
                                        personneConcernee: personne,
                                        createdAt: '', // Mettre une chaîne vide ou une date valide si nécessaire
                                        updatedAt: '',
                                    }); });
                                    // On concatène les vrais engagements et les engagements "fondateur"
                                    return [2 /*return*/, __assign(__assign({}, personne), { engagements: __spreadArray(__spreadArray([], allEngagementsForPerson, true), engagementsFondateur, true) })];
                            }
                        });
                    }); }))];
            case 7:
                finalResults = _a.sent();
                console.log('finalResults:', finalResults);
                return [2 /*return*/, server_1.NextResponse.json({ docs: finalResults }, { status: 200 })];
            case 8:
                error_1 = _a.sent();
                console.error("Erreur dans l'endpoint de recherche:", error_1);
                return [2 /*return*/, server_1.NextResponse.json({ error: 'Erreur interne du serveur.' }, { status: 500 })];
            case 9: return [2 /*return*/];
        }
    });
}); };
exports.recherchePersonnesEndpoint = {
    path: '/custom/recherche-personnes',
    method: 'get',
    handler: recherchePersonnesHandler,
};
