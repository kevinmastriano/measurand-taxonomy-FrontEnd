/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  // Enable static exports for Vercel deployment
  // If deploying to Vercel, you can remove this or set to 'export'
  // output: 'export',
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'licensebuttons.net',
        pathname: '/**',
      },
    ],
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'no-referrer' },
        ],
      },
    ];
  },
  async rewrites() {
    return [
      { source: '/api/openapi.json', destination: '/api/openapi' },
    ];
  },
}

module.exports = nextConfig


