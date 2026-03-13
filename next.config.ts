import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./i18n/request.ts');

function getAllowedOrigins() {
  const origins = new Set(['localhost:3000', '127.0.0.1:3000']);
  const appUrl = process.env.NEXT_PUBLIC_APP_URL;
  const extraOrigins = process.env.SERVER_ACTIONS_ALLOWED_ORIGINS;

  if (appUrl) {
    try {
      origins.add(new URL(appUrl).host);
    } catch {
      // Ignore malformed URLs so local builds keep working.
    }
  }

  if (extraOrigins) {
    extraOrigins
      .split(',')
      .map(origin => origin.trim())
      .filter(Boolean)
      .forEach(origin => origins.add(origin.replace(/^https?:\/\//, '').replace(/\/$/, '')));
  }

  return [...origins];
}

const nextConfig: NextConfig = {
  output: 'standalone',
  experimental: {
    serverActions: {
      allowedOrigins: getAllowedOrigins(),
    },
  },
};

export default withNextIntl(nextConfig);
