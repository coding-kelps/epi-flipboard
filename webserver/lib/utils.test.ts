import { describe, it, expect } from 'vitest'
import { cn } from '@/lib/utils'

describe('cn', () => {
    it('should merge class names correctly', () => {
        expect(cn('bg-red-500', 'text-white')).toBe('bg-red-500 text-white')
    })

    it('should handle conditional class names', () => {
        expect(cn('bg-red-500', true && 'text-white', false && 'hidden')).toBe(
            'bg-red-500 text-white'
        )
    })

    it('should merge tailwind classes using tailwind-merge', () => {
        expect(cn('px-2 py-1', 'p-4')).toBe('p-4')
    })

    it('should handle arrays and objects if supported (clsx behavior)', () => {
        expect(cn(['a', 'b'], { c: true, d: false })).toBe('a b c')
    })
})
