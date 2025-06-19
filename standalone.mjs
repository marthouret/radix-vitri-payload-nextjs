import payload from 'payload';
import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Charge le .env explicitement
dotenv.config({ path: path.resolve(__dirname, '.env') });

console.log('PAYLOAD_SECRET:', process.env.PAYLOAD_SECRET); // Vérification

const app = express();

payload.init({
  // ts-expect-error
  secret: process.env.PAYLOAD_SECRET,
  express: app,
  config: path.resolve(__dirname, './dist/payload.config.js'), // <-- ici le .js compilé
  onInit: () => {
    app.listen(3001, () => {
      console.log('Payload admin running on http://localhost:3001/admin');
    });
  },
});