/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export', // Enable static export
  trailingSlash: true, // Required for static export
  distDir: 'out', // Output directory
  images: {
    unoptimized: true, // Required for static export
  },
  env: {
    NEXT_PUBLIC_STATIC_EXPORT: 'true',
  },
  // Disable server-side features for static export
  experimental: {
    serverComponentsExternalPackages: [],
  },
  // Webpack configuration for client-side only
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        crypto: false,
        stream: false,
        url: false,
        zlib: false,
        http: false,
        https: false,
        assert: false,
        os: false,
        path: false,
        child_process: false,
        cluster: false,
        dgram: false,
        dns: false,
        domain: false,
        events: false,
        module: false,
        punycode: false,
        querystring: false,
        readline: false,
        repl: false,
        string_decoder: false,
        sys: false,
        timers: false,
        tty: false,
        util: false,
        vm: false,
        worker_threads: false,
      };
    }
    return config;
  },
  // async rewrites() {
  //   return [
  //     {
  //       source: '/api/:path*',
  //       destination: `${process.env.NEXT_PUBLIC_API_BASE_URL}/:path*`,
  //     },
  //   ];
  // },
  // async headers() {
  //   return [
  //     {
  //       source: '/(.*)',
  //       headers: [
  //         {
  //           key: 'X-Frame-Options',
  //           value: 'DENY',
  //         },
  //         {
  //           key: 'X-Content-Type-Options',
  //           value: 'nosniff',
  //         },
  //         {
  //           key: 'Referrer-Policy',
  //           value: 'origin-when-cross-origin',
  //         },
  //       ],
  //     },
  //   ];
  // },
};

module.exports = nextConfig;
