import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { loadSecret } from './env-secrets'
import fs from 'node:fs'

vi.mock('node:fs', () => ({
    default: {
        readFileSync: vi.fn(),
    },
    readFileSync: vi.fn(), // Handle named export if used
}))

describe('loadSecret', () => {
    const originalEnv = process.env

    beforeEach(() => {
        vi.clearAllMocks()
        process.env = { ...originalEnv }
    })

    afterEach(() => {
        process.env = originalEnv
    })

    it('returns direct env value if present', () => {
        process.env.TEST_SECRET = 'direct_value'
        const result = loadSecret({ name: 'TEST_SECRET' })
        expect(result).toBe('direct_value')
    })

    it('reads from file if direct value missing', () => {
        process.env.TEST_SECRET_FILE = '/path/to/secret'
        ;(fs.readFileSync as any).mockReturnValue('file_value\n')

        const result = loadSecret({ name: 'TEST_SECRET' })

        expect(fs.readFileSync).toHaveBeenCalledWith('/path/to/secret', 'utf8')
        expect(result).toBe('file_value')
    })

    it('throws error if file read fails', () => {
        process.env.TEST_SECRET_FILE = '/path/to/secret'
        ;(fs.readFileSync as any).mockImplementation(() => {
            throw new Error('File not found')
        })

        expect(() => loadSecret({ name: 'TEST_SECRET' })).toThrow(
            /Failed to read secret file/
        )
    })

    it('throws error if missing and required', () => {
        expect(() => loadSecret({ name: 'MISSING_SECRET' })).toThrow(
            /Missing required secret/
        )
    })

    it('returns undefined if missing and not required', () => {
        const result = loadSecret({ name: 'MISSING_SECRET', required: false })
        expect(result).toBeUndefined()
    })
})
