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

// Importer TOUTES vos collections
import { Users } from './collections/Users'
import { Media } from './collections/Media' 
import Verrerie from './collections/Verrerie'
import Personnalite from './collections/Personnalite'
import Verrier from './collections/Verrier'
import TypeDeProduction from './collections/TypeDeProduction'
import Engagements from './collections/Engagements';
import Lieux from './collections/Lieu';

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
    Verrerie, 
    Personnalite, 
    Verrier, // La collection Verrier doit être ici
    TypeDeProduction,
    Engagements,
    Lieux
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
