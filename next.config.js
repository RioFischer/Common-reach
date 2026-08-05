/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      { source: '/Codman-Demo', destination: '/codman-square/search' },
      { source: '/Codman-Demo/:path*', destination: '/codman-square/search' },
      { source: '/codman-demo', destination: '/codman-square/search' },
      { source: '/codman-demo/:path*', destination: '/codman-square/search' },
    ]
  },
}
module.exports = nextConfig
