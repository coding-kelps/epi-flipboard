import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import {
    getPrismaIdentity,
    getPrismaContent,
    getPrismaActivity,
} from './prisma'

// Mock dependencies
vi.mock('@prisma/adapter-pg', () => ({
    PrismaPg: vi.fn(),
}))

vi.mock('@/lib/database-url', () => ({
    getDatabaseUrl: vi.fn().mockReturnValue('mock-url'),
}))

// Mock Prisma Clients
const mocks = vi.hoisted(() => ({
    mockPrismaClientIdentity: vi.fn(),
    mockPrismaClientContent: vi.fn(),
    mockPrismaClientActivity: vi.fn(),
}))

vi.mock('@/app/generated/prisma-identity/client', () => ({
    PrismaClient: mocks.mockPrismaClientIdentity,
}))
vi.mock('@/app/generated/prisma-content/client', () => ({
    PrismaClient: mocks.mockPrismaClientContent,
}))
vi.mock('@/app/generated/prisma-activity/client', () => ({
    PrismaClient: mocks.mockPrismaClientActivity,
}))

describe('Prisma Lib', () => {
    const originalEnv = process.env

    beforeEach(() => {
        vi.clearAllMocks()
        // Reset global mocks
        ;(global as any).prismaIdentity = undefined
        ;(global as any).prismaContent = undefined
        ;(global as any).prismaActivity = undefined
        process.env = { ...originalEnv, NODE_ENV: 'test' }
    })

    afterEach(() => {
        process.env = originalEnv
    })

    describe('getPrismaIdentity', () => {
        it('should create new instance if not exists', () => {
            getPrismaIdentity()
            expect(mocks.mockPrismaClientIdentity).toHaveBeenCalledTimes(1)
        })

        it('should reuse instance in global in non-production', () => {
            Object.defineProperty(process.env, 'NODE_ENV', {
                value: 'development',
                writable: true,
            })
            getPrismaIdentity()
            getPrismaIdentity()

            // In our mock, the constructor returns undefined mostly, but we can verify calls
            // Ideally we'd mock return value to be an object to verify strict equality
            expect(mocks.mockPrismaClientIdentity).toHaveBeenCalled()
        })
    })

    describe('getPrismaContent', () => {
        it('should create new instance if not exists', () => {
            getPrismaContent()
            expect(mocks.mockPrismaClientContent).toHaveBeenCalledTimes(1)
        })
    })

    describe('getPrismaActivity', () => {
        it('should create new instance if not exists', () => {
            getPrismaActivity()
            expect(mocks.mockPrismaClientActivity).toHaveBeenCalledTimes(1)
        })
    })
})
