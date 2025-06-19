"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// src/payload.config.ts
var payload_1 = require("payload");
var db_postgres_1 = require("@payloadcms/db-postgres");
var payload_cloud_1 = require("@payloadcms/payload-cloud");
var richtext_lexical_1 = require("@payloadcms/richtext-lexical");
var path_1 = __importDefault(require("path"));
var url_1 = require("url");
var sharp_1 = __importDefault(require("sharp"));
// Importer les traductions (laissez comme c'était si cela ne causait pas d'erreur de build)
var fr_1 = require("@payloadcms/translations/languages/fr");
var en_1 = require("@payloadcms/translations/languages/en");
// Import des collections et endpoints custom
var Users_1 = require("./collections/Users");
var Media_1 = require("./collections/Media");
var Pages_1 = require("./collections/Pages");
var Verrerie_1 = __importDefault(require("./collections/Verrerie"));
var Verrier_1 = __importDefault(require("./collections/Verrier"));
var TypeDeProduction_1 = __importDefault(require("./collections/TypeDeProduction"));
var Engagements_1 = __importDefault(require("./collections/Engagements"));
var EvenementsBiographiques_1 = __importDefault(require("./collections/EvenementsBiographiques"));
var Lieu_1 = __importDefault(require("./collections/Lieu"));
var FonctionsVerriers_1 = __importDefault(require("./collections/FonctionsVerriers"));
var FonctionsPersonnalites_1 = __importDefault(require("./collections/FonctionsPersonnalites"));
var Histoires_1 = require("./collections/Histoires");
var RecherchePersonnes_1 = require("./endpoints/RecherchePersonnes");
var filename = (0, url_1.fileURLToPath)(import.meta.url);
var dirname = path_1.default.dirname(filename);
exports.default = (0, payload_1.buildConfig)({
    admin: {
        user: Users_1.Users.slug, // Remplacez Users.slug par votre collection utilisateur
        // defaultLocale: 'fr', // Commenté si cela cause des erreurs de type
    },
    // Assurez-vous que TOUTES vos collections sont listées ici
    collections: [
        Users_1.Users,
        Media_1.Media,
        Pages_1.Pages,
        // Collections spécifiques
        Verrerie_1.default,
        Verrier_1.default,
        TypeDeProduction_1.default,
        Engagements_1.default,
        EvenementsBiographiques_1.default,
        Lieu_1.default,
        FonctionsVerriers_1.default,
        FonctionsPersonnalites_1.default,
        Histoires_1.Histoires,
        // Ajoutez d'autres collections ici si nécessaire
    ],
    endpoints: [
        RecherchePersonnes_1.recherchePersonnesEndpoint,
    ],
    localization: {
        locales: ['fr', 'en'],
        defaultLocale: 'fr',
    },
    i18n: {
        translations: { fr: fr_1.fr, en: en_1.en },
        // fallbackLng: 'en', // Commenté si cela cause des erreurs de type
    },
    editor: (0, richtext_lexical_1.lexicalEditor)(),
    secret: process.env.PAYLOAD_SECRET || '',
    typescript: {
        outputFile: path_1.default.resolve(dirname, 'payload-types.ts'),
    },
    db: (0, db_postgres_1.postgresAdapter)({
        pool: {
            connectionString: process.env.DATABASE_URI || '',
        },
    }),
    sharp: sharp_1.default,
    plugins: [
        (0, payload_cloud_1.payloadCloudPlugin)(),
    ],
});
