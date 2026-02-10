'use client'

import {
    createContext,
    useContext,
    useEffect,
    useState,
    ReactNode,
} from 'react'
import { useRouter } from 'next/navigation'
import AuthModal from '@/components/AuthModal'

interface User {
    id: number
    email: string
    name?: string
}

interface AuthContextType {
    user: User | null
    loading: boolean
    login: (token?: string) => void
    logout: () => void
    refreshUser: () => Promise<void>
    isAuthenticated: boolean
    openAuthModal: () => void
    closeAuthModal: () => void
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    loading: true,
    login: () => {},
    logout: () => {},
    refreshUser: async () => {},
    isAuthenticated: false,
    openAuthModal: () => {},
    closeAuthModal: () => {},
})

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null)
    const [loading, setLoading] = useState(true)
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)
    const router = useRouter()

    const refreshUser = async () => {
        try {
            const res = await fetch('/api/account/profile')
            if (res.ok) {
                const data = await res.json()
                setUser(data.user)
            } else {
                setUser(null)
            }
        } catch {
            setUser(null)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        refreshUser()
    }, [])

    const login = () => {
        refreshUser()
    }

    const logout = async () => {
        try {
            await fetch('/api/account/logout', { method: 'POST' })
            setUser(null)
            router.refresh() // Refresh server components if needed
            router.push('/')
        } catch (error) {
            console.error('Logout failed', error)
        }
    }

    const openAuthModal = () => setIsAuthModalOpen(true)
    const closeAuthModal = () => setIsAuthModalOpen(false)

    return (
        <AuthContext.Provider
            value={{
                user,
                loading,
                login,
                logout,
                refreshUser,
                isAuthenticated: !!user,
                openAuthModal,
                closeAuthModal,
            }}
        >
            {children}
            <AuthModal isOpen={isAuthModalOpen} onClose={closeAuthModal} />
        </AuthContext.Provider>
    )
}

export const useAuth = () => useContext(AuthContext)
