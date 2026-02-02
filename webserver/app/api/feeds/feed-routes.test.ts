import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST as FeedPOST } from './route';
import { PUT as FeedPUT, DELETE as FeedDELETE } from './[feedId]/route';
import { NextRequest } from 'next/server';

// Mock Dependencies
const mockPrismaActivity = {
    feed: {
        create: vi.fn(),
        findUnique: vi.fn(),
        update: vi.fn(),
        delete: vi.fn(),
    },
};

vi.mock('@/lib/prisma', () => ({
    getPrismaActivity: () => mockPrismaActivity,
}));

vi.mock('@/lib/auth', () => ({
    verifyToken: vi.fn(),
}));

import { verifyToken } from '@/lib/auth';

// Mock Cookies
const mockCookieStore = {
    get: vi.fn(),
};

vi.mock('next/headers', () => ({
    cookies: () => Promise.resolve(mockCookieStore),
}));

describe('Feed API Routes', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('Create Feed Route', () => {
        it('creates a feed successfully with full data', async () => {
            const req = new NextRequest('http://api/feeds', {
                method: 'POST',
                body: JSON.stringify({ name: 'New Feed', description: 'Desc', tagIds: [1], publisherIds: [3] }),
            });

            mockCookieStore.get.mockReturnValue({ value: 'token' });
            (verifyToken as any).mockReturnValue({ userId: 1 });
            mockPrismaActivity.feed.create.mockResolvedValue({
                id: 10,
                name: 'New Feed',
                description: 'Desc',
                tagIds: [1n],
                publisherIds: [3n],
                userId: 1
            });

            const res = await FeedPOST(req);
            const json = await res.json();

            expect(json.id).toBe(10);
            expect(json.publisherIds).toEqual([3]);
        });

        it('creates a feed successfully without optional data', async () => {
            const req = new NextRequest('http://api/feeds', {
                method: 'POST',
                body: JSON.stringify({ name: 'Minimal', tagIds: [] }),
            });

            mockCookieStore.get.mockReturnValue({ value: 'token' });
            (verifyToken as any).mockReturnValue({ userId: 1 });
            mockPrismaActivity.feed.create.mockResolvedValue({
                id: 11,
                name: 'Minimal',
                description: null,
                tagIds: [],
                publisherIds: [],
                userId: 1
            });

            const res = await FeedPOST(req);
            const json = await res.json();

            expect(json.id).toBe(11);
        });

        it('returns 400 if name missing', async () => {
            const req = new NextRequest('http://api/feeds', {
                method: 'POST',
                body: JSON.stringify({ description: 'Desc' }),
            });
            mockCookieStore.get.mockReturnValue({ value: 'token' });
            (verifyToken as any).mockReturnValue({ userId: 1 });

            const res = await FeedPOST(req);
            expect(res.status).toBe(400);
        });

        it('returns 401 if not authenticated', async () => {
            const req = new NextRequest('http://api/feeds', { method: 'POST' });
            mockCookieStore.get.mockReturnValue(undefined);

            const res = await FeedPOST(req);
            expect(res.status).toBe(401);
        });

        it('returns 401 if invalid token', async () => {
            const req = new NextRequest('http://api/feeds', { method: 'POST' });
            mockCookieStore.get.mockReturnValue({ value: 'bad' });
            (verifyToken as any).mockReturnValue(null);
            const res = await FeedPOST(req);
            expect(res.status).toBe(401);
        });

        it('returns 500 on internal error', async () => {
            const req = new NextRequest('http://api/feeds', {
                method: 'POST',
                body: JSON.stringify({ name: 'Error Feed', tagIds: [] }),
            });
            mockCookieStore.get.mockReturnValue({ value: 'token' });
            (verifyToken as any).mockReturnValue({ userId: 1 });
            mockPrismaActivity.feed.create.mockRejectedValue(new Error('DB Error'));

            const res = await FeedPOST(req);
            expect(res.status).toBe(500);
        });
    });

    describe('Update Feed Route', () => {
        const params = Promise.resolve({ feedId: '10' });

        it('updates feed if owner', async () => {
            const req = new NextRequest('http://api/feeds/10', {
                method: 'PUT',
                body: JSON.stringify({ name: 'Updated', description: 'Desc', tagIds: [], publisherIds: [] }),
            });

            mockCookieStore.get.mockReturnValue({ value: 'token' });
            (verifyToken as any).mockReturnValue({ userId: 1 });

            mockPrismaActivity.feed.findUnique.mockResolvedValue({ id: 10, userId: 1 });
            mockPrismaActivity.feed.update.mockResolvedValue({
                id: 10, name: 'Updated', userId: 1, tagIds: [], publisherIds: []
            });

            const res = await FeedPUT(req, { params });
            const json = await res.json();
            expect(json.name).toBe('Updated');
        });

        it('returns 403 if not owner', async () => {
            const req = new NextRequest('http://api/feeds/10', {
                method: 'PUT',
                body: JSON.stringify({ name: 'Updated' }),
            });
            mockCookieStore.get.mockReturnValue({ value: 'token' });
            (verifyToken as any).mockReturnValue({ userId: 2 }); // Different user
            mockPrismaActivity.feed.findUnique.mockResolvedValue({ id: 10, userId: 1 });

            const res = await FeedPUT(req, { params });
            expect(res.status).toBe(403);
        });

        it('returns 404 if feed not found', async () => {
            const req = new NextRequest('http://api/feeds/10', {
                method: 'PUT',
                body: JSON.stringify({ name: 'Updated' }),
            });
            mockCookieStore.get.mockReturnValue({ value: 'token' });
            (verifyToken as any).mockReturnValue({ userId: 1 });
            mockPrismaActivity.feed.findUnique.mockResolvedValue(null);

            const res = await FeedPUT(req, { params });
            expect(res.status).toBe(404);
        });

        it('returns 400 if name missing', async () => {
            const req = new NextRequest('http://api/feeds/10', {
                method: 'PUT',
                body: JSON.stringify({ description: 'Only desc' }),
            });
            mockCookieStore.get.mockReturnValue({ value: 'token' });
            (verifyToken as any).mockReturnValue({ userId: 1 });

            const res = await FeedPUT(req, { params });
            expect(res.status).toBe(400);
        });

        it('returns 401 if not authorized', async () => {
            const req = new NextRequest('http://api/feeds/10', { method: 'PUT' });
            mockCookieStore.get.mockReturnValue(undefined);
            const res = await FeedPUT(req, { params });
            expect(res.status).toBe(401);
        });

        it('returns 500 on internal error', async () => {
            const req = new NextRequest('http://api/feeds/10', {
                method: 'PUT',
                body: JSON.stringify({ name: 'Update' }),
            });
            mockCookieStore.get.mockReturnValue({ value: 'token' });
            (verifyToken as any).mockReturnValue({ userId: 1 });
            mockPrismaActivity.feed.findUnique.mockRejectedValue(new Error('DB Error'));

            const res = await FeedPUT(req, { params });
            expect(res.status).toBe(500);
        });
    });

    describe('Delete Feed Route', () => {
        const params = Promise.resolve({ feedId: '10' });

        it('deletes feed if owner', async () => {
            const req = new NextRequest('http://api/feeds/10', { method: 'DELETE' });
            mockCookieStore.get.mockReturnValue({ value: 'token' });
            (verifyToken as any).mockReturnValue({ userId: 1 });
            mockPrismaActivity.feed.findUnique.mockResolvedValue({ id: 10, userId: 1 });

            const res = await FeedDELETE(req, { params });
            const json = await res.json();

            expect(json.success).toBe(true);
        });

        it('returns 403 if not owner', async () => {
            const req = new NextRequest('http://api/feeds/10', { method: 'DELETE' });
            mockCookieStore.get.mockReturnValue({ value: 'token' });
            (verifyToken as any).mockReturnValue({ userId: 2 });
            mockPrismaActivity.feed.findUnique.mockResolvedValue({ id: 10, userId: 1 });

            const res = await FeedDELETE(req, { params });
            expect(res.status).toBe(403);
        });

        it('returns 404 if feed not found', async () => {
            const req = new NextRequest('http://api/feeds/10', { method: 'DELETE' });
            mockCookieStore.get.mockReturnValue({ value: 'token' });
            (verifyToken as any).mockReturnValue({ userId: 1 });
            mockPrismaActivity.feed.findUnique.mockResolvedValue(null);

            const res = await FeedDELETE(req, { params });
            expect(res.status).toBe(404);
        });

        it('returns 401 if not authorized', async () => {
            const req = new NextRequest('http://api/feeds/10', { method: 'DELETE' });
            mockCookieStore.get.mockReturnValue(undefined);
            const res = await FeedDELETE(req, { params });
            expect(res.status).toBe(401);
        });

        it('returns 500 on internal error', async () => {
            const req = new NextRequest('http://api/feeds/10', { method: 'DELETE' });
            mockCookieStore.get.mockReturnValue({ value: 'token' });
            (verifyToken as any).mockReturnValue({ userId: 1 });
            mockPrismaActivity.feed.findUnique.mockRejectedValue(new Error('DB Error'));

            const res = await FeedDELETE(req, { params });
            expect(res.status).toBe(500);
        });
    });
});
