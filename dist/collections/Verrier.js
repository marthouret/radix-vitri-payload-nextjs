"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var payloadHooks_1 = require("@/utils/payloadHooks");
// import { lexicalEditor } from '@payloadcms/richtext-lexical'; 
var Verrier = {
    slug: 'verriers',
    labels: {
        singular: 'Verrier',
        plural: 'Verriers',
    },
    admin: {
        useAsTitle: 'nomComplet',
        // defaultColumns : les champs lieuDeNaissance et lieuDeDeces pointeront maintenant vers les relations
        defaultColumns: ['nomComplet', 'anneeNaissance', 'anneeDeces', 'rolePrincipal', 'updatedAt'],
        group: 'Verreries',
    },
    access: {
        read: function () { return true; },
    },
    fields: [
        {
            name: 'nom',
            type: 'text',
            label: 'Nom',
            required: true,
        },
        {
            name: 'prenom',
            type: 'text',
            label: 'Prénom',
        },
        {
            name: 'nomComplet',
            type: 'text',
            label: 'Nom Complet',
            admin: {
                description: 'Généré automatiquement à partir du prénom et du nom si laissé vide, ou peut être saisi manuellement.',
                readOnly: false,
            },
            hooks: {
                beforeChange: [
                    function (_a) {
                        var value = _a.value, data = _a.data, originalDoc = _a.originalDoc, operation = _a.operation;
                        if (typeof value === 'string' && value.trim().length > 0) {
                            return value.trim();
                        }
                        var prenomToUse = (data === null || data === void 0 ? void 0 : data.prenom) !== undefined ? data.prenom : originalDoc === null || originalDoc === void 0 ? void 0 : originalDoc.prenom;
                        var nomToUse = (data === null || data === void 0 ? void 0 : data.nom) !== undefined ? data.nom : originalDoc === null || originalDoc === void 0 ? void 0 : originalDoc.nom;
                        if (typeof prenomToUse === 'string' || typeof nomToUse === 'string') {
                            var generatedNomComplet = "".concat(prenomToUse || '', " ").concat(nomToUse || '').trim();
                            if (generatedNomComplet && (operation === 'create' || (originalDoc === null || originalDoc === void 0 ? void 0 : originalDoc.nomComplet) !== generatedNomComplet)) {
                                return generatedNomComplet;
                            }
                        }
                        return value;
                    }
                ]
            }
        },
        {
            name: 'sexe',
            label: 'Sexe',
            type: 'select',
            options: [
                { label: 'Masculin', value: 'M' },
                { label: 'Féminin', value: 'F' },
                // Vous pourriez ajouter une option "Non spécifié" ou "Autre" si pertinent pour vos données
                // { label: 'Non spécifié', value: 'X' }, 
            ],
            // required: false, // Le rendre optionnel si l'information n'est pas toujours disponible
            admin: {
                description: 'Pour l\'accord grammatical (Né/Née, etc.).',
                // width: '50%', // Pour l'affichage dans l'admin
            }
        },
        {
            name: 'slug',
            label: 'Slug (pour URL)',
            type: 'text',
            admin: { position: 'sidebar' },
            unique: true,
            index: true,
            hooks: {
                beforeValidate: [
                    (0, payloadHooks_1.createSimplifiedSlugHook)()
                ],
            },
        },
        {
            name: 'rolePrincipal',
            label: 'Rôle Principal',
            type: 'select',
            options: [
                { label: 'Fondateur', value: 'fondateur' },
                { label: 'Maître de Verrerie (propriétaire, associé, actionnaire)', value: 'maitre_verrerie' },
                { label: 'Directeur / Gérant', value: 'directeur' },
                { label: 'Ingénieur / Technicien / Inventeur', value: 'ingenieur_technicien' },
                { label: 'Maître-Verrier (Expertise / Savoir-faire)', value: 'maitre_verrier_expertise' },
                { label: 'Artiste / Décorateur / Designer', value: 'artiste_decorateur' },
                { label: 'Autre rôle', value: 'autre' },
            ],
            admin: {
                position: 'sidebar',
                description: "Le rôle le plus significatif de cette personne, au-delà de ses fonctions techniques. Utile pour qualifier les 'personnalités'.",
            },
        },
        // Champs pour Naissance
        {
            type: 'row',
            fields: [
                {
                    name: 'dateDeNaissance',
                    type: 'text',
                    label: 'Date de Naissance (texte)',
                    admin: {
                        width: '50%',
                        description: 'Ex: "vers 1787", "le 12/03/1850", "avant 1800"',
                    }
                },
                {
                    name: 'lieuDeNaissance',
                    label: 'Lieu de Naissance',
                    type: 'relationship',
                    relationTo: 'lieux', // Pointe vers la collection 'Lieu'
                    hasMany: false,
                    admin: {
                        width: '50%',
                        description: 'Sélectionnez le lieu de naissance si connu.',
                    }
                },
            ]
        },
        // Champs pour Décès
        {
            type: 'row',
            fields: [
                {
                    name: 'dateDeDeces',
                    type: 'text',
                    label: 'Date de Décès (texte)',
                    admin: {
                        width: '50%',
                        description: 'Ex: "vers 1820", "le 01/10/1899", "après 1870"',
                    }
                },
                {
                    name: 'lieuDeDeces',
                    label: 'Lieu de Décès',
                    type: 'relationship',
                    relationTo: 'lieux', // Pointe vers la collection 'Lieu'
                    hasMany: false,
                    admin: {
                        width: '50%',
                        description: 'Sélectionnez le lieu de décès si connu.',
                    }
                },
            ]
        },
        // Nouveaux champs pour l'affichage, redondants mais améliorent l'UX/UI
        {
            name: 'anneeNaissance',
            label: 'Année de Naissance (pour affichage/tri)',
            type: 'number',
            admin: {
                description: 'Année seulement, ex: 1855. Utile pour distinguer les homonymes.',
                width: '50%'
            }
        },
        {
            name: 'anneeDeces',
            label: 'Année de Décès (pour affichage/tri)',
            type: 'number',
            admin: {
                description: 'Année seulement, ex: 1939.',
                width: '50%'
            }
        },
        {
            name: 'periodePrincipaleActivite',
            type: 'text',
            label: 'Période d\'activité principale (ex: 1880-1910)',
            localized: false,
        },
        {
            name: 'specialisation',
            type: 'text',
            label: 'Spécialisation / Métier principal',
            localized: false,
        },
        {
            name: 'notesBiographie',
            type: 'richText',
            // editor: lexicalEditor({}),   (commenté dans votre source)
            label: 'Notes biographiques / Parcours',
            localized: true,
        },
        {
            name: 'ancetreDirect',
            label: 'Ancêtre Direct',
            type: 'checkbox',
            defaultValue: false,
            admin: {
                position: 'sidebar',
                description: 'Cochez cette case si cette personne est un de vos ancêtres directs.',
            }
        },
    ],
};
exports.default = Verrier;
