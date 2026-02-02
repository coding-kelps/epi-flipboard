import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import RootLayout from './layout';

// Mock Fonts
vi.mock('next/font/google', () => ({
    Inter: () => ({ variable: 'font-inter' }),
    Playfair_Display: () => ({ variable: 'font-playfair' }),
    UnifrakturMaguntia: () => ({ variable: 'font-gothic' }),
}));

// Mock child components to verify structure without deep rendering
vi.mock('@/components/Header', () => ({ default: () => <header data-testid="header" /> }));
vi.mock('@/components/Footer', () => ({ default: () => <footer data-testid="footer" /> }));
vi.mock('@/components/NavBarContainer', () => ({ default: () => <nav data-testid="navbar-container" /> }));
vi.mock('@/components/CookieConsent', () => ({ default: () => <div data-testid="cookie-consent" /> }));

// Mock AuthProvider
vi.mock('@/components/AuthProvider', () => ({
    AuthProvider: ({ children }: { children: React.ReactNode }) => <div data-testid="auth-provider">{children}</div>
}));

describe('RootLayout', () => {
    it('renders children within the main structure', () => {
        render(
            <RootLayout>
                <div data-testid="child-content">Main Content</div>
            </RootLayout>
        );

        expect(screen.getByTestId('auth-provider')).toBeInTheDocument();
        expect(screen.getByTestId('header')).toBeInTheDocument();
        expect(screen.getByTestId('navbar-container')).toBeInTheDocument();
        expect(screen.getByTestId('child-content')).toBeInTheDocument();
        expect(screen.getByTestId('footer')).toBeInTheDocument();
        expect(screen.getByTestId('cookie-consent')).toBeInTheDocument();
    });
});
