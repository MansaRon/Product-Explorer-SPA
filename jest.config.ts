module.exports = {
    displayName: 'lexis-nexus-assignmnt',
    preset: 'jest-preset-angular',
    setupFilesAfterEnv: ['<rootDir>/src/setup-jest.ts'],
    testPathIgnorePatterns: ['/node_modules/', '/dist/'],
    coverageDirectory: 'coverage',
    collectCoverageFrom: [
      'src/app/**/*.ts',
      '!src/app/**/*.spec.ts',
      '!src/app/**/*.routes.ts',
      '!src/app/**/index.ts',
      '!src/app/main.ts',
      '!src/app/app.config.ts'
    ],
    coverageReporters: ['html', 'text', 'lcov'],
    moduleNameMapper: {
      '^@app/(.*)$': '<rootDir>/src/app/$1',
      '^@core/(.*)$': '<rootDir>/src/app/core/$1',
      '^@shared/(.*)$': '<rootDir>/src/app/shared/$1',
      '^@features/(.*)$': '<rootDir>/src/app/features/$1'
    },
    transform: {
      '^.+\\.(ts|js|html)$': [
        'jest-preset-angular',
        {
          tsconfig: '<rootDir>/tsconfig.spec.json',
          stringifyContentPathRegex: '\\.html$'
        }
      ]
    },
    transformIgnorePatterns: ['node_modules/(?!.*\\.mjs$)'],
    testMatch: ['**/*.spec.ts'],
    moduleFileExtension: ['ts', 'html', 'js', 'json', 'mjs'],
};