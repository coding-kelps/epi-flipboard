'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, Trash2, ArrowLeft, CheckCircle } from 'lucide-react'
import Link from 'next/link'
import { useAuth } from '@/components/AuthProvider'

export default function ProfilePage() {
    const { user, loading: authLoading, logout, refreshUser } = useAuth()
    const [name, setName] = useState('')
    const [updating, setUpdating] = useState(false)
    const [successMsg, setSuccessMsg] = useState('')

    // Deletion state
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
    const [confirmEmail, setConfirmEmail] = useState('')
    const [deleteError, setDeleteError] = useState<string | null>(null)
    const [deleting, setDeleting] = useState(false)

    const router = useRouter()

    useEffect(() => {
        if (!authLoading && !user) {
            router.push('/')
        }
        if (user) {
            setName(user.name || '')
        }
    }, [user, authLoading, router])

    async function handleUpdate(e: React.FormEvent) {
        e.preventDefault()
        setUpdating(true)
        try {
            const res = await fetch('/api/account/profile', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name }),
            })
            if (res.ok) {
                await refreshUser()
                setSuccessMsg('Profile updated successfully')
                setTimeout(() => setSuccessMsg(''), 3000)
            }
        } catch (err) {
            console.error(err)
        } finally {
            setUpdating(false)
        }
    }

    async function handleDeleteAccount() {
        setDeleteError(null)
        if (confirmEmail !== user?.email) {
            setDeleteError('Email confirmation does not match.')
            return
        }

        setDeleting(true)
        try {
            const res = await fetch('/api/account/delete', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ confirmationEmail: confirmEmail }),
            })

            if (res.ok) {
                router.push('/')
                router.refresh()
            } else {
                const data = await res.json()
                setDeleteError(data.error || 'Failed to delete account')
            }
        } catch {
            setDeleteError('Something went wrong')
        } finally {
            setDeleting(false)
        }
    }

    if (authLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-gray-500" />
            </div>
        )
    }

    if (!user) return null

    return (
        <div className="container mx-auto px-4 py-12 max-w-2xl">
            <Link
                href="/"
                className="inline-flex items-center text-gray-500 hover:text-black mb-8"
            >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Home
            </Link>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
                <div className="flex items-center justify-between mb-8">
                    <h1 className="text-3xl font-serif font-bold">
                        Your Profile
                    </h1>
                    <button
                        onClick={logout}
                        className="text-sm text-gray-600 hover:text-black hover:underline"
                    >
                        Log Out
                    </button>
                </div>

                <form onSubmit={handleUpdate} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Email
                        </label>
                        <input
                            type="email"
                            value={user.email}
                            disabled
                            className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-md text-gray-500 cursor-not-allowed"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                            Email cannot be changed.
                        </p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Full Name
                        </label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-black focus:border-black outline-none transition-all"
                        />
                    </div>

                    {successMsg && (
                        <div className="flex items-center gap-2 text-green-700 text-sm font-medium bg-green-50 p-3 rounded-md animate-in fade-in slide-in-from-top-2">
                            <CheckCircle className="w-4 h-4" />
                            {successMsg}
                        </div>
                    )}

                    <div className="pt-4">
                        <button
                            type="submit"
                            disabled={updating}
                            className="px-6 py-2 bg-black text-white rounded-md hover:bg-gray-800 transition-colors disabled:opacity-50"
                        >
                            {updating ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                </form>

                <hr className="my-10 border-gray-200" />

                <div className="bg-red-50 border border-red-100 rounded-lg p-6">
                    <h3 className="text-lg font-bold text-red-700 flex items-center gap-2 mb-2">
                        <Trash2 className="w-5 h-5" />
                        Danger Zone
                    </h3>
                    <p className="text-sm text-red-600 mb-4">
                        Deleting your account is permanent. All your data will
                        be wiped out immediately and you won&apos;t be able to
                        get it back.
                    </p>

                    {!showDeleteConfirm ? (
                        <button
                            onClick={() => setShowDeleteConfirm(true)}
                            className="px-4 py-2 bg-white border border-red-300 text-red-700 rounded-md hover:bg-red-50 transition-colors text-sm font-medium"
                        >
                            Delete Account
                        </button>
                    ) : (
                        <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-200">
                            <div>
                                <label className="block text-sm font-medium text-red-700 mb-1">
                                    Type <strong>{user.email}</strong> to
                                    confirm
                                </label>
                                <input
                                    type="text"
                                    value={confirmEmail}
                                    onChange={(e) =>
                                        setConfirmEmail(e.target.value)
                                    }
                                    className="w-full px-4 py-2 border border-red-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none"
                                    placeholder={user.email}
                                />
                            </div>

                            {deleteError && (
                                <p className="text-sm text-red-600 font-medium">
                                    {deleteError}
                                </p>
                            )}

                            <div className="flex gap-3">
                                <button
                                    onClick={handleDeleteAccount}
                                    disabled={
                                        deleting || confirmEmail !== user.email
                                    }
                                    className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {deleting
                                        ? 'Deleting...'
                                        : 'Confirm Deletion'}
                                </button>
                                <button
                                    onClick={() => {
                                        setShowDeleteConfirm(false)
                                        setConfirmEmail('')
                                        setDeleteError(null)
                                    }}
                                    className="px-4 py-2 bg-transparent text-gray-600 hover:text-gray-900 text-sm"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
