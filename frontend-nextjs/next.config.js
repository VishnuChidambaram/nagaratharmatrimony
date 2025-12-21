const nextConfig = {
  devIndicators: {
    buildActivity: false,
    appIsrStatus: false,
  },
  allowedDevOrigins: ["169.254.156.216", "192.168.1.2"],
  onDemandEntries: {
    // Make sure we don't keep pages around forever
    maxInactiveAge: 25 * 1000,
    pagesBufferLength: 2,
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
