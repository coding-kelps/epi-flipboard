import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import About from './about/page'
import Terms from './terms/page'
import Privacy from './privacy/page'

describe('Static Pages', () => {
    describe('About Page', () => {
        it('renders correctly', () => {
            render(<About />)
            expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
                /About/i
            )
        })
    })

    describe('Terms Page', () => {
        it('renders correctly', () => {
            render(<Terms />)
            // content might vary, but usually has a heading
            expect(
                screen.getByRole('heading', { level: 1 })
            ).toBeInTheDocument()
        })
    })

    describe('Privacy Page', () => {
        it('renders correctly', () => {
            render(<Privacy />)
            expect(
                screen.getByRole('heading', { level: 1 })
            ).toBeInTheDocument()
        })
    })
})
