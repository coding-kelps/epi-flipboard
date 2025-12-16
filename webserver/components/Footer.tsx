export default function Footer() {
    return (
        <footer className="border-t border-gray-200 mt-12 py-8 bg-gray-50">
            <div className="container mx-auto px-4 flex flex-col items-center gap-4 text-center">
                <h2 className="font-serif text-3xl text-gray-400">EpiFlipBoard</h2>
                <div className="text-sm text-gray-500">
                    &copy; {new Date().getFullYear()} EpiFlipBoard. All rights reserved.
                </div>
                <div className="flex gap-4 text-xs text-gray-400">
                    <a href="#" className="hover:underline">Privacy Policy</a>
                    <a href="#" className="hover:underline">Terms of Service</a>
                    <a href="#" className="hover:underline">Contact Us</a>
                </div>
            </div>
        </footer>
    );
}
