import { describe, it, expect, vi } from 'vitest'
import { checkImageResolution } from '@/lib/image-utils'

// Mock probe-image-size
vi.mock('probe-image-size', () => {
    return {
        default: vi.fn((url: string) => {
            if (url === 'http://valid.com/image.jpg') {
                return Promise.resolve({ width: 1000, height: 800 })
            }
            if (url === 'http://small.com/image.jpg') {
                return Promise.resolve({ width: 100, height: 100 })
            }
            return Promise.reject(new Error('Network error'))
        })
    }
})

describe('checkImageResolution', () => {
    it('should return false if url is empty', async () => {
        expect(await checkImageResolution('')).toBe(false)
    })

    it('should return true if image width is >= minWidth', async () => {
        // default minWidth is 800
        expect(await checkImageResolution('http://valid.com/image.jpg')).toBe(true)
    })

    it('should return false if image width is < minWidth', async () => {
        expect(await checkImageResolution('http://small.com/image.jpg')).toBe(false)
    })

    it('should return false on error', async () => {
        expect(await checkImageResolution('http://error.com/image.jpg')).toBe(false)
    })

    it('should respect custom minWidth', async () => {
        expect(await checkImageResolution('http://valid.com/image.jpg', 1200)).toBe(false)
    })
})
