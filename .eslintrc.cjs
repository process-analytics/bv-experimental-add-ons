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

/**
 * @type {import("eslint").Linter.Config}
 */
module.exports = {
  root: true,
  plugins: ['import', 'n', 'notice', 'unicorn'],
  parser: '@typescript-eslint/parser', // Specifies the ESLint parser
  extends: [
    'plugin:import/recommended',
    'plugin:unicorn/recommended',
    'plugin:prettier/recommended', // Enables eslint-plugin-prettier and eslint-config-prettier. This will display prettier errors as ESLint errors. Make sure this is always the last configuration in the extends array.
  ],
  parserOptions: {
    ecmaVersion: 2018, // Allows for the parsing of modern ECMAScript features
    sourceType: 'module', // Allows for the use of imports
  },
  rules: {
    'notice/notice': ['error', { templateFile: 'config/license-header.js', onNonMatchingHeader: 'replace' }],
    'no-console': ['error', { allow: ['warn', 'error'] }],
    // as defined in `bpmn-visualization` b122995c
    'import/newline-after-import': ['error', { count: 1 }],
    'import/first': 'error',
    'import/order': [
      'error',
      {
        groups: ['type', 'builtin', 'external', 'parent', 'sibling', 'index', 'internal'],
        'newlines-between': 'always',
        alphabetize: {
          order: 'asc',
          orderImportKind: 'asc',
          caseInsensitive: true,
        },
      },
    ],
    'n/file-extension-in-import': ['error', 'always'],
  },
  overrides: [
    // typescript
    {
      files: ['*.ts'],
      extends: [
        'plugin:@typescript-eslint/recommended', // Uses the recommended rules from the @typescript-eslint/eslint-plugin
        'plugin:import/typescript',
        'plugin:prettier/recommended', // Enables eslint-plugin-prettier and eslint-config-prettier. This will display prettier errors as ESLint errors. Make sure this is always the last configuration in the extends array.
      ],
      settings: {
        'import/resolver': {
          typescript: {
            alwaysTryTypes: true, // always try to resolve types under `<root>@types` directory even it doesn't contain any source code, like `@types/unist`
            project: '**/tsconfig.json',
          },
        },
      },
      parserOptions: {
        // This setting is required if you want to use rules which require type information
        // https://typescript-eslint.io/packages/parser/#project
        project: ['./packages/**/tsconfig.json', './tsconfig.eslint.json'],
      },
      rules: {
        '@typescript-eslint/explicit-function-return-type': [
          'error',
          {
            allowExpressions: true,
            allowTypedFunctionExpressions: true,
          },
        ],
        '@typescript-eslint/explicit-member-accessibility': [
          'error',
          {
            accessibility: 'no-public',
          },
        ],
        '@typescript-eslint/consistent-type-exports': [
          'error',
          {
            fixMixedExportsWithInlineTypeSpecifier: true,
          },
        ],
        '@typescript-eslint/consistent-type-imports': ['error'],
      },
    },
  ],
};
