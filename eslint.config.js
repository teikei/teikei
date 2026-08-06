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
