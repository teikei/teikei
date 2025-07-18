// For more info, see https://github.com/storybookjs/eslint-plugin-storybook#configuration-flat-config-format

import js from '@eslint/js'
import importPlugin from 'eslint-plugin-import'
import jest from 'eslint-plugin-jest'
import react from 'eslint-plugin-react'
import globals from 'globals'
import ts from 'typescript-eslint'

/** @type {import("eslint").Linter.Config[]} */
export default [
  {
    ignores: ['**/node_modules/**', '**/build/**']
  },
  {
    files: ['**/packages/[map|admin]/src/*.{js,ts,jsx,tsx}'],
    ...js.configs.recommended,
    ...ts.configs.recommended,
    ...react.configs.flat.recommended,
    ...importPlugin.flatConfigs.recommended,
    ...importPlugin.flatConfigs.react,
    plugins: {
      import: importPlugin
    },
    languageOptions: {
      globals: globals.browser
    }
  },
  {
    files: ['**/packages/api/src/*.{js,ts,jsx,tsx}'],
    ...js.configs.recommended,
    ...importPlugin.flatConfigs.recommended,
    languageOptions: {
      globals: { ...globals.node, ...jest.environments.globals.globals }
    },
    plugins: {
      jest: jest,
      import: importPlugin
    },
    settings: {
      jest: {
        version: 29
      }
    }
  }
]
