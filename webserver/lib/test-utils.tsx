import { vi } from 'vitest';
import React from 'react';

// Common test data
export const mockUser = {
    id: 1,
    email: 'test@example.com',
    name: 'Test User',
};

export const defaultAuthContext = {
    user: null,
    isAuthenticated: false,
    isLoading: false,
    login: vi.fn(),
    logout: vi.fn(),
    openAuthModal: vi.fn(),
    closeAuthModal: vi.fn(),
};

export const authenticatedContext = {
    ...defaultAuthContext,
    user: mockUser,
    isAuthenticated: true,
};
