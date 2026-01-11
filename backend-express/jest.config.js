export default {
    testEnvironment: 'node',
    transform: {}, // Disable transforms for ESM
    moduleNameMapper: {
      '^(\\.{1,2}/.*)\\.js$': '$1', // Handle .js extensions in imports
    },
    testTimeout: 10000,
    verbose: true,
  };
