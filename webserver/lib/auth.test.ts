import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
    hashPassword,
    comparePassword,
    signToken,
    verifyToken,
    getSession,
} from './auth'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

// Mock mocks
vi.mock('bcryptjs', () => ({
    default: {
        genSalt: vi.fn(),
        hash: vi.fn(),
        compare: vi.fn(),
    },
}))

vi.mock('jsonwebtoken', () => ({
    default: {
        sign: vi.fn(),
        verify: vi.fn(),
    },
}))

vi.mock('next/headers', () => ({
    cookies: vi.fn(),
}))

describe('Auth Utils', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    describe('hashPassword', () => {
        it('should hash password successfully', async () => {
            const password = 'password123'
            const salt = 'salt123'
            const hash = 'hashedPassword'

            ;(bcrypt.genSalt as any).mockResolvedValue(salt)
            ;(bcrypt.hash as any).mockResolvedValue(hash)

            const result = await hashPassword(password)

            expect(bcrypt.genSalt).toHaveBeenCalledWith(10)
            expect(bcrypt.hash).toHaveBeenCalledWith(password, salt)
            expect(result).toBe(hash)
        })
    })

    describe('comparePassword', () => {
        it('should return true for matching passwords', async () => {
            ;(bcrypt.compare as any).mockResolvedValue(true)
            const result = await comparePassword('pass', 'hash')
            expect(result).toBe(true)
            expect(bcrypt.compare).toHaveBeenCalledWith('pass', 'hash')
        })

        it('should return false for non-matching passwords', async () => {
            ;(bcrypt.compare as any).mockResolvedValue(false)
            const result = await comparePassword('pass', 'hash')
            expect(result).toBe(false)
        })
    })

    describe('signToken', () => {
        it('should sign token', () => {
            const payload = { userId: 1 }
            const token = 'token'
            ;(jwt.sign as any).mockReturnValue(token)

            const result = signToken(payload)

            expect(jwt.sign).toHaveBeenCalledWith(payload, expect.any(String), {
                expiresIn: '7d',
            })
            expect(result).toBe(token)
        })
    })

    describe('verifyToken', () => {
        it('should return payload on valid token', () => {
            const payload = { userId: 1 }
            ;(jwt.verify as any).mockReturnValue(payload)

            const result = verifyToken('token')
            expect(result).toBe(payload)
        })

        it('should return null on invalid token', () => {
            ;(jwt.verify as any).mockImplementation(() => {
                throw new Error('Invalid')
            })
            const result = verifyToken('token')
            expect(result).toBeNull()
        })
    })

    describe('getSession', () => {
        it('should return null if no token cookie', async () => {
            const mockCookies = {
                get: vi.fn().mockReturnValue(undefined),
            }
            const { cookies } = await import('next/headers')
            ;(cookies as any).mockResolvedValue(mockCookies)

            const session = await getSession()
            expect(session).toBeNull()
        })

        it('should return null if token is invalid', async () => {
            const mockCookies = {
                get: vi.fn().mockReturnValue({ value: 'invalid_token' }),
            }
            const { cookies } = await import('next/headers')
            ;(cookies as any).mockResolvedValue(mockCookies)
            ;(jwt.verify as any).mockImplementation(() => {
                throw new Error()
            })

            const session = await getSession()
            expect(session).toBeNull()
        })

        it('should return null if payload is string', async () => {
            const mockCookies = {
                get: vi.fn().mockReturnValue({ value: 'token' }),
            }
            const { cookies } = await import('next/headers')
            ;(cookies as any).mockResolvedValue(mockCookies)
            ;(jwt.verify as any).mockReturnValue('string_payload')

            const session = await getSession()
            expect(session).toBeNull()
        })

        it('should return null if payload has no userId', async () => {
            const mockCookies = {
                get: vi.fn().mockReturnValue({ value: 'token' }),
            }
            const { cookies } = await import('next/headers')
            ;(cookies as any).mockResolvedValue(mockCookies)
            ;(jwt.verify as any).mockReturnValue({ email: 'test@test.com' }) // No userId

            const session = await getSession()
            expect(session).toBeNull()
        })

        it('should return session if token is valid', async () => {
            const mockCookies = {
                get: vi.fn().mockReturnValue({ value: 'valid_token' }),
            }
            const { cookies } = await import('next/headers')
            ;(cookies as any).mockResolvedValue(mockCookies)

            const payload = {
                userId: 123,
                email: 'test@example.com',
                name: 'Test User',
            }
            ;(jwt.verify as any).mockReturnValue(payload)

            const session = await getSession()
            expect(session).toEqual({
                user: {
                    id: 123,
                    email: 'test@example.com',
                    name: 'Test User',
                },
            })
        })
    })
})
