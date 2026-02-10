import Link from 'next/link'

export default function Footer() {
    return (
        <footer className="border-t border-gray-200 mt-12 py-8 bg-gray-50">
            <div className="container mx-auto px-4 flex flex-col items-center gap-4 text-center">
                <h2 className="font-serif text-3xl text-gray-400">
                    Epi FlipBoard
                </h2>
                <div className="text-sm text-gray-500">
                    &copy; {new Date().getFullYear()} Epi FlipBoard. All rights
                    reserved.
                </div>
                <div className="flex gap-4 text-xs text-gray-400">
                    <Link href="/privacy" className="hover:underline">
                        Privacy Policy
                    </Link>
                    <Link href="/terms" className="hover:underline">
                        Terms of Service
                    </Link>
                    <Link href="/about" className="hover:underline">
                        About
                    </Link>
                </div>
            </div>
        </footer>
    )
}
