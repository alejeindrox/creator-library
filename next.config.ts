import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.externals = [
        ...config.externals,
        'pino',
        'pino-loki',
      ];
    }
    return config;
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  serverExternalPackages: ['pino', 'pino-loki'],
};

export default nextConfig;
