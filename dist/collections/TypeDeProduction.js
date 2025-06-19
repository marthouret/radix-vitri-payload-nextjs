"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var richtext_lexical_1 = require("@payloadcms/richtext-lexical");
var TypeDeProduction = {
    slug: 'types-de-production',
    labels: {
        singular: 'Type de production',
        plural: 'Types de production',
    },
    admin: {
        useAsTitle: 'nom',
        group: 'Verreries',
    },
    fields: [
        {
            name: 'nom',
            type: 'text',
            label: 'Nom du Type de Production',
            required: true,
            unique: true, // Assure que chaque type est unique
            localized: true,
        },
        {
            name: 'description',
            type: 'richText',
            editor: (0, richtext_lexical_1.lexicalEditor)({}),
            label: 'Description Détaillée',
            localized: true,
        },
        // Vous pourriez ajouter des champs pour 'période typique', 'techniques associées', etc.
        {
            name: 'verreriesProductrices', // Relation inverse
            type: 'relationship',
            relationTo: 'verreries',
            hasMany: true,
            admin: {
                readOnly: true,
            }
        },
    ],
};
exports.default = TypeDeProduction;
