import js from '@eslint/js'
import vitest from '@vitest/eslint-plugin'
import prettier from 'eslint-config-prettier'
import importPlugin from 'eslint-plugin-import'
import react from 'eslint-plugin-react'
import svelte from 'eslint-plugin-svelte'
import { defineConfig, globalIgnores } from 'eslint/config'
import globals from 'globals'
import ts from 'typescript-eslint'

import svelteConfig from './packages/embed/svelte.config.js'

const jsTsFiles = ['**/*.{js,jsx,ts,tsx}']
const reactFiles = ['packages/{map,admin}/src/**/*.{js,jsx,ts,tsx}']
const mapReactFiles = ['packages/map/src/**/*.{js,jsx,ts,tsx}']
const adminReactFiles = ['packages/admin/src/**/*.{js,jsx,ts,tsx}']
const legacyMapTsFiles = ['packages/map/src/**/*.{ts,tsx}']
const apiFiles = ['packages/api/src/**/*.{js,ts}']
const svelteFiles = [
  'packages/embed/src/**/*.{js,ts,svelte,svelte.js,svelte.ts}'
]

export default defineConfig(
  globalIgnores([
    '**/node_modules/**',
    '**/build/**',
    '**/dist/**',
    '**/.svelte-kit/**',
    '**/storybook-static/**',
    '**/coverage/**',
    'packages/api/db/**',
    'packages/api/scripts/**',
    'packages/embed/src/lib/paraglide/**',
    '**/playwright-report/**'
  ]),

  {
    files: jsTsFiles,
    extends: [js.configs.recommended],
    rules: {
      // TypeScript checks undefined names more reliably than ESLint can for TS syntax.
      'no-undef': 'off',
      'no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_'
        }
      ]
    }
  },

  {
    files: ['**/*.{ts,tsx}', '**/*.svelte.ts'],
    extends: [ts.configs.recommended]
  },

  {
    files: reactFiles,
    extends: [
      react.configs.flat.recommended,
      react.configs.flat['jsx-runtime']
    ],
    languageOptions: {
      ecmaVersion: 'latest',
      globals: globals.browser
    },
    plugins: {
      import: importPlugin
    },
    rules: {
      'react/display-name': 'off',
      'react/prop-types': 'off'
    }
  },

  {
    files: mapReactFiles,
    settings: {
      react: {
        version: '18.3'
      }
    }
  },

  {
    files: adminReactFiles,
    settings: {
      react: {
        version: '19.2'
      }
    }
  },

  {
    files: apiFiles,
    extends: [importPlugin.flatConfigs.recommended],
    languageOptions: {
      ecmaVersion: 'latest',
      globals: {
        ...globals.node,
        ...vitest.environments.env.globals
      }
    },
    plugins: {
      vitest
    }
  },

  {
    // Domains stay free of persistence and transport details; see the
    // packages/api rules in AGENTS.md.
    files: ['packages/api/src/domain/**/*.ts'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          paths: [
            'kysely',
            'pg',
            '@feathersjs/feathers',
            '@feathersjs/adapter-commons'
          ].map((name) => ({
            name,
            message:
              'Domains do not use Kysely or Feathers directly (AGENTS.md, packages/api).'
          })),
          patterns: [
            {
              group: ['**/db/types*', '**/repositories/relations*'],
              message:
                'Database types and relation helpers stay in the repositories (AGENTS.md, packages/api).'
            },
            {
              group: ['**/db/feathersQuery*'],
              allowImportNames: ['ListQuery'],
              message:
                'Domains pass the client query through as ListQuery (AGENTS.md, packages/api).'
            },
            {
              group: ['**/repositories/*'],
              importNamePattern: '^[A-Z][A-Z0-9_]*$',
              message:
                'Column lists stay in the repositories (AGENTS.md, packages/api).'
            }
          ]
        }
      ]
    }
  },

  {
    // The API source is TypeScript; only its tests stay JavaScript.
    files: ['packages/api/src/**/*.js'],
    ignores: ['**/__test__/**'],
    rules: {
      'no-restricted-syntax': [
        'error',
        {
          selector: 'Program',
          message: 'packages/api/src is TypeScript; use .ts (AGENTS.md).'
        }
      ]
    }
  },

  {
    files: legacyMapTsFiles,
    rules: {
      '@typescript-eslint/ban-ts-comment': 'off',
      '@typescript-eslint/no-empty-object-type': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      'preserve-caught-error': 'off'
    }
  },

  {
    files: svelteFiles,
    extends: [svelte.configs.recommended, prettier, ...svelte.configs.prettier],
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node
      },
      parserOptions: {
        extraFileExtensions: ['.svelte'],
        parser: ts.parser,
        svelteConfig
      }
    },
    rules: {
      'svelte/no-navigation-without-resolve': 'off',
      // Use the configured iconLibrary (@lucide/svelte/icons/<icon>), not the
      // deprecated all-in-one 'lucide-svelte' package.
      'no-restricted-imports': [
        'error',
        {
          paths: [
            {
              name: 'lucide-svelte',
              message:
                "Import icons from '@lucide/svelte/icons/<icon>' instead of 'lucide-svelte'."
            }
          ]
        }
      ]
    }
  }
)
