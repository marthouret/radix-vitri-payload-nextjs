// src/payload.config.ts
import { buildConfig } from 'payload';
import { postgresAdapter } from '@payloadcms/db-postgres'
import { payloadCloudPlugin } from '@payloadcms/payload-cloud'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import path from 'path'
import { fileURLToPath } from 'url'
import sharp from 'sharp'

// Importer les traductions (laissez comme c'était si cela ne causait pas d'erreur de build)
import { fr } from '@payloadcms/translations/languages/fr'; 
import { en } from '@payloadcms/translations/languages/en';

// Import des collections et endpoints custom
import { Users } from './collections/Users'
import { Media } from './collections/Media'
import { Pages } from './collections/Pages' 
import Verrerie from './collections/Verrerie'
import Verrier from './collections/Verrier'
import TypeDeProduction from './collections/TypeDeProduction'
import Engagements from './collections/Engagements';
import EvenementsBiographiques from './collections/EvenementsBiographiques';
import Lieux from './collections/Lieu';
import FonctionsVerriers from './collections/FonctionsVerriers';
import FonctionsPersonnalites from './collections/FonctionsPersonnalites';
import { Histoires } from './collections/Histoires';
import { recherchePersonnesEndpoint } from './endpoints/RecherchePersonnes';

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
  admin: {
    user: Users.slug, // Remplacez Users.slug par votre collection utilisateur
    // defaultLocale: 'fr', // Commenté si cela cause des erreurs de type
  },
  // Assurez-vous que TOUTES vos collections sont listées ici
  collections: [
    Users, 
    Media, 
    Pages,
    // Collections spécifiques
    Verrerie, 
    Verrier,
    TypeDeProduction,
    Engagements,
    EvenementsBiographiques,
    Lieux,
    FonctionsVerriers,
    FonctionsPersonnalites,
    Histoires,
    // Ajoutez d'autres collections ici si nécessaire
  ],
  endpoints: [
    recherchePersonnesEndpoint,
  ],
  
  localization: {
    locales: ['fr', 'en'], 
    defaultLocale: 'fr',   
  },
  i18n: {
    translations: { fr, en },
    // fallbackLng: 'en', // Commenté si cela cause des erreurs de type
  },

  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || '',
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URI || '',
    },
  }),
  sharp,
  plugins: [
    payloadCloudPlugin(),
  ],
})
