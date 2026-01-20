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
}

module.exports = nextConfig


