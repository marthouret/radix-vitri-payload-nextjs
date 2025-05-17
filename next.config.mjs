// next.config.mjs
import path from 'path';
// import { fileURLToPath } from 'url'; // Pas nécessaire si vous utilisez process.cwd()
import { withPayload } from '@payloadcms/next/withPayload';

// const __filename = fileURLToPath(import.meta.url); // Pas nécessaire
// const __dirname = path.dirname(__filename); // Pas nécessaire

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  // La configuration 'devIndicators' est valide
  devIndicators: {
    position: 'bottom-right',
  },

  // La configuration 'webpack' est valide
  webpack: (config, { isServer, webpack }) => {
    if (isServer) {
      // @ts-ignore // Pour TypeScript si 'cloudflare:sockets' n'est pas dans les types connus
      config.externals = [...config.externals, 'cloudflare:sockets'];
    }
    return config;
  },

  // La configuration 'images' que nous avons ajoutée est valide
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: '51.159.180.190',
        port: '3000',
        pathname: '/api/media/file/**',
      },
      {
        protocol: 'https',
        hostname: 'placehold.co',
        // pathname: '/**', // Optionnel si vous voulez être plus spécifique
      },
    ],
  },

  // Clés non reconnues mises en commentaire ou supprimées :
  // allowedDevOrigins: [
  //   'http://51.159.180.190:3000',
  //   'http://localhost:3000'
  // ],
  // outputFileTracingExcludes: ...
  // outputFileTracingIncludes: ...
  // serverExternalPackages: ...
};

export default withPayload(
  nextConfig,
  {
    configPath: path.resolve(process.cwd(), './src/payload.config.ts'),
  }
);