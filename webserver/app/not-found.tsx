import Link from 'next/link'

export default function NotFound() {
    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
            <h2 className="font-serif text-4xl md:text-5xl font-bold mb-4 text-gray-900">Page Not Found</h2>
            <p className="font-serif text-lg text-gray-600 mb-8 max-w-md">
                We’re sorry, we seem to have lost this page, but we don’t want to lose you.
            </p>
            <Link
                href="/"
                className="text-sm font-bold uppercase tracking-wider text-white bg-black px-6 py-3 rounded hover:bg-gray-800 transition-colors"
            >
                Return Home
            </Link>
        </div>
    )
}
