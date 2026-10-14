/** @type {import('next').NextConfig} */
const nextConfig = {
  // Browser Maps key: intentionally public; restrict it by HTTP referrer in Google Cloud.
  env: {
    GOOGLE_MAPS_API_KEY: process.env.GOOGLE_MAPS_API_KEY || '',
  },
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'http2.mlstatic.com', pathname: '/**' },
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
        pathname: '/**',
      },
    ],
  },
  async redirects() {
    return [
      {
        source: '/auth/signin',
        destination: '/auth/login',
        permanent: true,
      },
    ];
  },
};

module.exports = nextConfig;
