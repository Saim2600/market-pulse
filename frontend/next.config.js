/** @type {import('next').NextType} */
const nextConfig = {
  output: 'export',
  images: {
    unoptimized: true,
  },
  // If hosting under a subpath like username.github.io/market-pulse:
  basePath: '/market-pulse', 
};

module.exports = nextConfig;
