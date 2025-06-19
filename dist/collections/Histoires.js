"use strict";
// src/collections/Histoires.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.Histoires = void 0;
var slugs_1 = require("@/utils/slugs");
exports.Histoires = {
    slug: 'histoires',
    labels: {
        singular: 'Histoire',
        plural: 'Histoires',
    },
    admin: {
        useAsTitle: 'title',
        defaultColumns: ['title', 'typeArticle', 'updatedAt'],
        description: "Articles de fond, récits sur les dynasties, les régions, ou les aventures verrières.",
    },
    access: {
        read: function () { return true; }, // Permet à n'importe qui de lire les 'Histoires' via l'API
    },
    fields: [
        {
            name: 'title',
            label: 'Titre',
            type: 'text',
            required: true,
            localized: true,
        },
        {
            name: 'typeArticle',
            label: "Type d'histoire",
            type: 'select',
            options: [
                { label: "Histoire d'un groupe de verreries", value: 'groupe_verreries' },
                { label: "Histoire d'une aventure verrière", value: 'aventure_verriere' },
                { label: "Histoire d'une dynastie verrière", value: 'dynastie_verriere' },
                { label: "Histoire d'une ville ou région", value: 'region_verriere' },
            ],
        },
        {
            name: 'resume',
            label: 'Résumé / Chapô',
            type: 'textarea',
            localized: true,
        },
        {
            name: 'content',
            label: 'Contenu principal',
            type: 'richText',
            required: true,
            localized: true,
        },
        // --- Les champs pour lier les objets ---
        {
            name: 'personnesLiees',
            label: 'Personnes liées',
            type: 'relationship',
            relationTo: 'verriers',
            hasMany: true,
            admin: {
                position: 'sidebar',
                description: 'Personnes clés mentionnées dans cette histoire. Elles apparaîtront dans un bloc dédié.',
            },
        },
        {
            name: 'verreriesLiees',
            label: 'Verreries liées',
            type: 'relationship',
            relationTo: 'verreries',
            hasMany: true,
            admin: {
                position: 'sidebar',
                description: 'Verreries clés mentionnées. Elles pourront être affichées sur une carte contextuelle.',
            },
        },
        {
            name: 'imageMiseEnAvant',
            label: 'Image de mise en avant',
            type: 'upload',
            relationTo: 'media', // La collection 'media' gère les images
        },
        // --- Champ technique ---
        {
            name: 'slug',
            label: 'Slug (URL)',
            type: 'text',
            admin: {
                position: 'sidebar',
                readOnly: true,
            },
            hooks: {
                beforeValidate: [
                    function (_a) {
                        var data = _a.data;
                        if ((data === null || data === void 0 ? void 0 : data.title) && !data.slug) {
                            return (0, slugs_1.generateBaseSlug)(data.title);
                        }
                        return data === null || data === void 0 ? void 0 : data.slug;
                    },
                ],
            },
            index: true,
            unique: true,
        },
    ],
};
