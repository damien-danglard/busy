/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@busy/mcp-server'],
  output: 'standalone',
}

module.exports = nextConfig
