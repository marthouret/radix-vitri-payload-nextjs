// next.config.mjs
import path from 'path';
import { withPayload } from '@payloadcms/next/withPayload';

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  devIndicators: {
    position: 'bottom-right',
  },

  webpack: (config, { isServer, webpack }) => {
    if (isServer) {
      // @ts-ignore
      config.externals = [...config.externals, 'cloudflare:sockets'];
    }
    return config;
  },

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
        hostname: 'radixvitri.com',
        pathname: '/api/media/file/**',
      },
      {
        protocol: 'https',
        hostname: 'placehold.co',
        // pathname: '/**',
      },
    ],
  },

  async redirects() {
    return [
      {
        source: '/',
        destination: '/home',
        permanent: true, // 308 redirect (SEO-friendly)
      },
    ];
  },
};

export default withPayload(
  nextConfig,
  {
    configPath: path.resolve(process.cwd(), './src/payload.config.ts'),
  }
);