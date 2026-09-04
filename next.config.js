/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    return [
      { source: '/Codman-Demo', destination: '/codman-square', permanent: true },
      { source: '/Codman-Demo/:path*', destination: '/codman-square', permanent: true },
      { source: '/codman-demo', destination: '/codman-square', permanent: true },
      { source: '/codman-demo/:path*', destination: '/codman-square', permanent: true },
    ]
  },
}
module.exports = nextConfig
