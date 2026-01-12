const nextConfig = {
  allowedDevOrigins: ["169.254.156.216", "192.168.1.2"],
  onDemandEntries: {
    // Make sure we don't keep pages around forever
    maxInactiveAge: 25 * 1000,
    pagesBufferLength: 2,
  },
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '5000',
        pathname: '/uploads/**',
      },
      {
        protocol: 'http',
        hostname: '127.0.0.1',
        port: '5000',
        pathname: '/uploads/**',
      },
      {
        protocol: 'http',
        hostname: '169.254.156.216',
        port: '5000',
        pathname: '/uploads/**',
      },
      {
        protocol: 'http',
        hostname: '192.168.1.2',
        port: '5000',
        pathname: '/uploads/**',
      },
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'via.placeholder.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'loremflickr.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'picsum.photos',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'fastly.picsum.photos',
        pathname: '/**',
      }
    ],
  },
};

// Suppress specific console warnings
const originalConsoleWarn = console.warn;
console.warn = (...args) => {
  if (
    typeof args[0] === 'string' &&
    (args[0].includes('stale') || args[0].includes('version-staleness'))
  ) {
    return;
  }
  originalConsoleWarn(...args);
};

module.exports = nextConfig;
