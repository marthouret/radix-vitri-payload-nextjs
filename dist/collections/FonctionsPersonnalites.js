"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var FonctionsPersonnalites = {
    slug: 'fonctions-personnalites',
    admin: {
        useAsTitle: 'nom',
        defaultColumns: ['nom', 'updatedAt'],
        listSearchableFields: ['nom'],
        group: 'Personnes', // Optionnel: pour organiser dans l'admin
        description: 'Liste des rôles pour les personnalités (direction, cadres, etc.).',
    },
    access: {
        read: function () { return true; },
    },
    fields: [
        {
            name: 'nom',
            type: 'text',
            label: 'Nom du rôle/fonction',
            required: true,
            unique: true,
            index: true,
            admin: {
                description: 'Exemple: Directeur, Associé, Maître de verrerie (cadre), etc.',
            },
        },
        // Vous pourriez ajouter un champ "description" ici si vous voulez détailler chaque rôle
    ],
};
exports.default = FonctionsPersonnalites;
