import { defineWorkspace } from 'vitest/config'

// More info at: https://storybook.js.org/docs/writing-tests/test-addon
// Note: storybookTest from '@storybook/experimental-addon-test/vitest-plugin' is experimental
// and not currently installed. For now, using basic workspace configuration.
export default defineWorkspace(['vite.config.ts'])
