/** @type {import('next').NextConfig} */
const nextConfig = {
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Cross-Origin-Opener-Policy',
            value: 'same-origin',
          },
          {
            key: 'Cross-Origin-Embedder-Policy',
            value: 'require-corp',
          },
        ],
      },
    ]
  },
  reactStrictMode: false,
  output: 'export',
  images: {
    // Image Optimization using the default loader is not compatible with `{ output: 'export' }`
    unoptimized: true
  }
};

export default nextConfig;
