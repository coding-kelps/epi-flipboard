'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

export default function CookieConsent() {
    const [showBanner, setShowBanner] = useState(false)

    useEffect(() => {
        // Check if user has already made a consent choice
        const consent = localStorage.getItem('cookieConsent')
        if (!consent) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setShowBanner(true)
        }
    }, [])

    const handleAccept = () => {
        localStorage.setItem('cookieConsent', 'accepted')
        setShowBanner(false)
    }

    const handleDecline = () => {
        localStorage.setItem('cookieConsent', 'declined')
        setShowBanner(false)
    }

    if (!showBanner) {
        return null
    }

    return (
        <div className="fixed bottom-0 left-0 right-0 z-50 animate-slide-up">
            <div className="bg-white/95 backdrop-blur-md border-t border-gray-200 shadow-2xl">
                <div className="container mx-auto px-4 py-6">
                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                        <div className="flex-1">
                            <h3 className="font-semibold text-gray-900 mb-2">
                                🍪 We Use Cookies
                            </h3>
                            <p className="text-sm text-gray-600 leading-relaxed">
                                We use cookies and similar technologies to
                                enhance your browsing experience, analyze site
                                traffic, and personalize content. By clicking
                                &quot;Accept,&quot; you consent to our use of
                                cookies as described in our{' '}
                                <Link
                                    href="/privacy"
                                    className="text-blue-600 hover:underline font-medium"
                                >
                                    Privacy Policy
                                </Link>
                                .
                            </p>
                        </div>
                        <div className="flex gap-3 w-full md:w-auto">
                            <button
                                onClick={handleDecline}
                                className="flex-1 md:flex-none px-6 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors duration-200"
                                aria-label="Decline cookies"
                            >
                                Decline
                            </button>
                            <button
                                onClick={handleAccept}
                                className="flex-1 md:flex-none px-6 py-2.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors duration-200 shadow-sm"
                                aria-label="Accept cookies"
                            >
                                Accept
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
