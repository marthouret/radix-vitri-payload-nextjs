// next.config.mjs
import path from 'path';
import { withPayload } from '@payloadcms/next/withPayload';

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  
  // Configuration pour allowedDevOrigins (option de premier niveau)
  // Ajout de localhost:3000 pour être exhaustif.
  allowedDevOrigins: [
    'http://51.159.180.190:3000', 
    'http://localhost:3000' // Au cas où des requêtes internes utiliseraient localhost
  ],

  // Configuration pour les indicateurs de développement (corrigée pour Next.js 15)
  devIndicators: {
    position: 'bottom-right', 
  },

  // Configuration Webpack pour gérer l'erreur "cloudflare:sockets"
  webpack: (config, { isServer, webpack }) => {
    if (isServer) {
      config.externals = [...config.externals, 'cloudflare:sockets'];
    }
    return config;
  },
};

// Rétablir l'export avec withPayload
export default withPayload(
  nextConfig, 
  { 
    configPath: path.resolve(process.cwd(), './src/payload.config.ts'),
  }
);
