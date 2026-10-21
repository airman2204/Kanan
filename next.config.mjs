/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'servicioskanan.com',
      },
    ],
  },
};

export default nextConfig;
