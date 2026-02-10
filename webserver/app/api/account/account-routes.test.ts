import { describe, it, expect, vi, beforeEach } from 'vitest'
import { POST as LoginPOST } from './login/route'
import { POST as LogoutPOST } from './logout/route'
import { POST as RegisterPOST } from './register/route'
import { GET as ProfileGET, PUT as ProfilePUT } from './profile/route'
import { DELETE as DeleteDELETE } from './delete/route'
import { NextRequest } from 'next/server'

// Mock Dependencies
const mockPrismaIdentity = {
    user: {
        findUnique: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
        delete: vi.fn(),
    },
}

const mockPrismaActivity = {
    feed: { findMany: vi.fn(), deleteMany: vi.fn() },
    followedFeed: { deleteMany: vi.fn() },
    comment: { deleteMany: vi.fn() },
    readingHistory: { deleteMany: vi.fn() },
    markedArticle: { deleteMany: vi.fn() },
}

vi.mock('@/lib/prisma', () => ({
    getPrismaIdentity: () => mockPrismaIdentity,
    getPrismaActivity: () => mockPrismaActivity,
}))

vi.mock('@/lib/auth', () => ({
    comparePassword: vi.fn(),
    hashPassword: vi.fn(),
    signToken: vi.fn(() => 'mock-token'),
    verifyToken: vi.fn(),
}))

import { comparePassword, hashPassword, verifyToken } from '@/lib/auth'

// Mock Cookies
const mockCookieStore = {
    set: vi.fn(),
    delete: vi.fn(),
    get: vi.fn(),
}

vi.mock('next/headers', () => ({
    cookies: () => Promise.resolve(mockCookieStore),
}))

// Mock OpenTelemetry
vi.mock('@opentelemetry/api', () => ({
    trace: {
        getActiveSpan: () => ({
            addEvent: vi.fn(),
            recordException: vi.fn(),
            setStatus: vi.fn(),
        }),
    },
    SpanStatusCode: { ERROR: 1 },
}))

describe('Account API Routes', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    describe('Login Route', () => {
        it('logs in successfully', async () => {
            const req = new NextRequest('http://localhost/api/account/login', {
                method: 'POST',
                body: JSON.stringify({
                    email: 'test@example.com',
                    password: 'password',
                }),
            })

            mockPrismaIdentity.user.findUnique.mockResolvedValue({
                id: 1,
                email: 'test@example.com',
                password: 'hashed-password',
                name: 'Test User',
            })
            ;(comparePassword as any).mockResolvedValue(true)

            const res = await LoginPOST(req)
            const json = await res.json()

            expect(res.status).toBe(200)
            expect(json.token).toBe('mock-token')
        })

        it('returns 400 if fields missing', async () => {
            const req = new NextRequest('http://localhost/api/account/login', {
                method: 'POST',
                body: JSON.stringify({ email: 'test@example.com' }), // missing password
            })
            const res = await LoginPOST(req)
            expect(res.status).toBe(400)
        })

        it('returns 401 for invalid credentials (password)', async () => {
            const req = new NextRequest('http://localhost/api/account/login', {
                method: 'POST',
                body: JSON.stringify({
                    email: 'test@example.com',
                    password: 'wrong',
                }),
            })

            mockPrismaIdentity.user.findUnique.mockResolvedValue({
                id: 1,
                email: 'test@example.com',
                password: 'hashed-password',
            })
            ;(comparePassword as any).mockResolvedValue(false)

            const res = await LoginPOST(req)
            expect(res.status).toBe(401)
        })

        it('returns 401 if user not found', async () => {
            const req = new NextRequest('http://localhost/api/account/login', {
                method: 'POST',
                body: JSON.stringify({
                    email: 'unknown@example.com',
                    password: 'password',
                }),
            })

            mockPrismaIdentity.user.findUnique.mockResolvedValue(null)
            const res = await LoginPOST(req)
            expect(res.status).toBe(401)
        })

        it('returns 500 on internal error', async () => {
            const req = new NextRequest('http://localhost/api/account/login', {
                method: 'POST',
                body: JSON.stringify({
                    email: 'test@example.com',
                    password: 'password',
                }),
            })
            mockPrismaIdentity.user.findUnique.mockRejectedValue(
                new Error('DB Error')
            )

            const res = await LoginPOST(req)
            expect(res.status).toBe(500)
        })
    })

    describe('Logout Route', () => {
        it('clears auth cookie', async () => {
            const res = await LogoutPOST()
            expect(mockCookieStore.delete).toHaveBeenCalledWith('auth_token')
            expect(res.status).toBe(200)
        })
    })

    describe('Register Route', () => {
        it('registers user successfully', async () => {
            const req = new NextRequest(
                'http://localhost/api/account/register',
                {
                    method: 'POST',
                    body: JSON.stringify({
                        email: 'new@example.com',
                        password: 'password',
                        name: 'New User',
                    }),
                }
            )

            mockPrismaIdentity.user.findUnique.mockResolvedValue(null)
            ;(hashPassword as any).mockResolvedValue('hashed-password')
            mockPrismaIdentity.user.create.mockResolvedValue({
                id: 1,
                email: 'new@example.com',
                name: 'New User',
            })

            const res = await RegisterPOST(req)
            expect(res.status).toBe(201)
        })

        it('returns 400 if fields missing', async () => {
            const req = new NextRequest(
                'http://localhost/api/account/register',
                {
                    method: 'POST',
                    body: JSON.stringify({ email: 'new@example.com' }),
                }
            )
            const res = await RegisterPOST(req)
            expect(res.status).toBe(400)
        })

        it('returns 409 if email exists', async () => {
            const req = new NextRequest(
                'http://localhost/api/account/register',
                {
                    method: 'POST',
                    body: JSON.stringify({
                        email: 'existing@example.com',
                        password: 'password',
                    }),
                }
            )
            mockPrismaIdentity.user.findUnique.mockResolvedValue({ id: 1 })

            const res = await RegisterPOST(req)
            expect(res.status).toBe(409)
        })

        it('returns 500 on internal error', async () => {
            const req = new NextRequest(
                'http://localhost/api/account/register',
                {
                    method: 'POST',
                    body: JSON.stringify({
                        email: 'error@example.com',
                        password: 'password',
                    }),
                }
            )
            mockPrismaIdentity.user.findUnique.mockRejectedValue(
                new Error('DB Error')
            )

            const res = await RegisterPOST(req)
            expect(res.status).toBe(500)
        })
    })

    describe('Profile Route', () => {
        describe('GET', () => {
            it('returns user profile', async () => {
                const req = new NextRequest(
                    'http://localhost/api/account/profile'
                )
                mockCookieStore.get.mockReturnValue({ value: 'token' })
                ;(verifyToken as any).mockReturnValue({ userId: 1 })
                mockPrismaIdentity.user.findUnique.mockResolvedValue({
                    id: 1,
                    name: 'User',
                })

                const res = await ProfileGET(req)
                expect(res.status).toBe(200)
            })

            it('returns 401 if no token', async () => {
                const req = new NextRequest(
                    'http://localhost/api/account/profile'
                )
                mockCookieStore.get.mockReturnValue(undefined)
                const res = await ProfileGET(req)
                expect(res.status).toBe(401)
            })

            it('returns 401 if invalid token', async () => {
                const req = new NextRequest(
                    'http://localhost/api/account/profile'
                )
                mockCookieStore.get.mockReturnValue({ value: 'bad-token' })
                ;(verifyToken as any).mockReturnValue(null)
                const res = await ProfileGET(req)
                expect(res.status).toBe(401)
            })

            it('returns 404 if user not found', async () => {
                const req = new NextRequest(
                    'http://localhost/api/account/profile'
                )
                mockCookieStore.get.mockReturnValue({ value: 'token' })
                ;(verifyToken as any).mockReturnValue({ userId: 1 })
                mockPrismaIdentity.user.findUnique.mockResolvedValue(null)

                const res = await ProfileGET(req)
                expect(res.status).toBe(404)
            })
        })

        describe('PUT', () => {
            it('updates user profile', async () => {
                const req = new NextRequest(
                    'http://localhost/api/account/profile',
                    {
                        method: 'PUT',
                        body: JSON.stringify({ name: 'Updated Name' }),
                    }
                )
                mockCookieStore.get.mockReturnValue({ value: 'token' })
                ;(verifyToken as any).mockReturnValue({ userId: 1 })
                mockPrismaIdentity.user.update.mockResolvedValue({
                    id: 1,
                    name: 'Updated Name',
                })

                const res = await ProfilePUT(req)
                expect(res.status).toBe(200)
            })

            it('returns 401 if no token', async () => {
                const req = new NextRequest(
                    'http://localhost/api/account/profile',
                    {
                        method: 'PUT',
                    }
                )
                mockCookieStore.get.mockReturnValue(undefined)
                const res = await ProfilePUT(req)
                expect(res.status).toBe(401)
            })

            it('returns 401 if invalid token', async () => {
                const req = new NextRequest(
                    'http://localhost/api/account/profile',
                    {
                        method: 'PUT',
                    }
                )
                mockCookieStore.get.mockReturnValue({ value: 'bad' })
                ;(verifyToken as any).mockReturnValue(null)
                const res = await ProfilePUT(req)
                expect(res.status).toBe(401)
            })
        })
    })

    describe('Delete Route', () => {
        it('deletes account successfully', async () => {
            const req = new NextRequest('http://localhost/api/account/delete', {
                method: 'DELETE',
                body: JSON.stringify({ confirmationEmail: 'test@example.com' }),
            })
            mockCookieStore.get.mockReturnValue({ value: 'token' })
            ;(verifyToken as any).mockReturnValue({ userId: 1 })

            mockPrismaIdentity.user.findUnique.mockResolvedValue({
                id: 1,
                email: 'test@example.com',
            })
            mockPrismaActivity.feed.findMany.mockResolvedValue([])

            const res = await DeleteDELETE(req)
            expect(res.status).toBe(200)
        })

        it('returns 401 if no token', async () => {
            const req = new NextRequest('http://localhost/api/account/delete', {
                method: 'DELETE',
            })
            mockCookieStore.get.mockReturnValue(undefined)
            const res = await DeleteDELETE(req)
            expect(res.status).toBe(401)
        })

        it('returns 401 if invalid token', async () => {
            const req = new NextRequest('http://localhost/api/account/delete', {
                method: 'DELETE',
            })
            mockCookieStore.get.mockReturnValue({ value: 'bad' })
            ;(verifyToken as any).mockReturnValue(null)
            const res = await DeleteDELETE(req)
            expect(res.status).toBe(401)
        })

        it('returns 400 if confirmation email missing', async () => {
            const req = new NextRequest('http://localhost/api/account/delete', {
                method: 'DELETE',
                body: JSON.stringify({}),
            })
            mockCookieStore.get.mockReturnValue({ value: 'token' })
            ;(verifyToken as any).mockReturnValue({ userId: 1 })

            const res = await DeleteDELETE(req)
            expect(res.status).toBe(400)
        })

        it('returns 404 if user not found', async () => {
            const req = new NextRequest('http://localhost/api/account/delete', {
                method: 'DELETE',
                body: JSON.stringify({ confirmationEmail: 't@e.com' }),
            })
            mockCookieStore.get.mockReturnValue({ value: 'token' })
            ;(verifyToken as any).mockReturnValue({ userId: 1 })

            mockPrismaIdentity.user.findUnique.mockResolvedValue(null)

            const res = await DeleteDELETE(req)
            expect(res.status).toBe(404)
        })

        it('returns 403 if email confirmation does not match', async () => {
            const req = new NextRequest('http://localhost/api/account/delete', {
                method: 'DELETE',
                body: JSON.stringify({
                    confirmationEmail: 'wrong@example.com',
                }),
            })
            mockCookieStore.get.mockReturnValue({ value: 'token' })
            ;(verifyToken as any).mockReturnValue({ userId: 1 })

            mockPrismaIdentity.user.findUnique.mockResolvedValue({
                id: 1,
                email: 'test@example.com',
            })

            const res = await DeleteDELETE(req)
            expect(res.status).toBe(403)
        })

        it('returns 500 on internal error', async () => {
            const req = new NextRequest('http://localhost/api/account/delete', {
                method: 'DELETE',
                body: JSON.stringify({ confirmationEmail: 'test@example.com' }),
            })
            mockCookieStore.get.mockReturnValue({ value: 'token' })
            ;(verifyToken as any).mockReturnValue({ userId: 1 })
            mockPrismaIdentity.user.findUnique.mockResolvedValue({
                id: 1,
                email: 'test@example.com',
            })
            mockPrismaActivity.feed.findMany.mockRejectedValue(
                new Error('DB Error')
            )

            const res = await DeleteDELETE(req)
            expect(res.status).toBe(500)
        })
    })
})
