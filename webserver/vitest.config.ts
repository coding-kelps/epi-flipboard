import { defineConfig } from 'vitest/config'
import path from 'path'

export default defineConfig({
    test: {
        environment: 'jsdom',
        setupFiles: './vitest.setup.ts',
        alias: {
            '@': path.resolve(__dirname, './'),
        },
        coverage: {
            provider: 'v8',
            reporter: ['text', 'json', 'lcov'],
            include: [
                'app/**/*.{ts,tsx}',
                'components/**/*.{ts,tsx}',
                'lib/**/*.{ts,tsx}',
            ],
            exclude: ['**/*.test.{ts,tsx}', '**/generated/**'],
        },
    },
})
