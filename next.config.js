/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    return [
      {
        source: '/',
        destination: '/api/version',
        permanent: true
      },
    ]
  },
  async rewrites() {
    return [
      {
        source: '/api/v1/collections/',
        destination: '/api/v1/collections'
      },
      {
        source: '/api/v1/collections/:address',
        destination: '/api/v1/collections/address'
      },
      {
        source: '/api/v1/collections/:address/distribution',
        destination: '/api/v1/collections/distribution'
      },
      {
        source: '/api/v1/collections/:address/tokens',
        destination: '/api/v1/collections/tokens'
      },
      {
        source: '/api/v1/collections/:address/filter',
        destination: '/api/v1/collections/tokens/filter'
      },
      {
        source: '/api/v1/collections/:address/tokens/:id',
        destination: '/api/v1/collections/tokens/id'
      },
      {
        source: "/api/v1/users/:address",
        destination: "/api/v1/users"
      },
      {
        source: '/api/v1/collections/add/:address',
        destination: '/api/v1/collections/add'
      },
      {
        source: "/api/v1/users/valid/:username",
        destination: "/api/v1/users/valid"
      }
    ]
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Access-Control-Allow-Origin',
            value: '*'
          },
          {
            key: 'Access-Control-Allow-Methods',
            value: 'GET, HEAD, POST, PUT, PATCH, DELETE, OPTIONS'
          },
          {
            key: 'Access-Control-Allow-Headers',
            value: 'Accept, Content-Type, Origin'
          },
          {
            key: 'Access-Control-Max-Age',
            value: '86400'
          },
          {
            key: 'Cache-Control',
            value: 'public, max-age=3600, s-maxage=3600'
          },
          {
            key: 'Pragma',
            value: 'no-cache'
          }
        ],
      },
    ]
  },
  reactStrictMode: true,
  swcMinify: true,
}

module.exports = nextConfig
