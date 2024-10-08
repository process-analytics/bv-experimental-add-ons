/*
Copyright 2023 Bonitasoft S.A.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

// The type provided here could provide more guidance if it included types from @swc/jest
/** @type {import('@jest/types').Config.InitialOptions} */
const config = {
  collectCoverageFrom: ['src/**/*.{ts,js}'],
  coverageReporters: ['html', 'text-summary'],
  extensionsToTreatAsEsm: ['.ts'],
  // https://jestjs.io/docs/configuration#modulefileextensions-arraystring
  moduleFileExtensions: ['ts', 'js', 'mjs', 'cjs', 'jsx', 'tsx', 'json', 'node'],
  // Make usage of .js extension in import work, see https://github.com/swc-project/jest/issues/64#issuecomment-1029753225
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1',
  },
  setupFilesAfterEnv: ['<rootDir>/config/jest-setup.js'],
  testEnvironment: 'jsdom', // let access to the browser objects
  testMatch: ['**/test/**/?(*.)+(spec|test).[tj]s?(x)'],
  transform: {
    '^.+\\.tsx?$': [
      '@swc/jest',
      {
        jsc: {
          parser: {
            syntax: 'typescript',
            tsx: false,
          },
          target: 'es2020', // keep in sync with tsconfig.test.json
        },
      },
    ],
  },
};

export default config;
