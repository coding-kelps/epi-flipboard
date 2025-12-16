import Link from "next/link";
import { Search } from "lucide-react";

export default function Header() {
    const currentDate = new Date().toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
    });

    return (
        <header className="flex flex-col border-b border-gray-300 bg-white">
            <div className="container mx-auto px-4 py-4 grid grid-cols-1 md:grid-cols-3 items-center relative gap-4 md:gap-0">

                <div className="flex flex-col items-start gap-1 order-2 md:order-1">
                    <div className="text-xs font-bold text-gray-700">{currentDate}</div>
                    <div className="hidden md:block text-xs text-gray-500">Today’s News</div>
                </div>

                <div className="order-1 md:order-2 text-center w-full">
                    <Link href="/" className="inline-block group w-full">
                        {/* Fluid text size to prevent cropping: starts at 10vw on mobile, caps at 6xl size approx */}
                        <h1 className="font-gothic text-[11vw] md:text-6xl lg:text-7xl font-black tracking-tight text-gray-900 group-hover:opacity-90 transition-opacity whitespace-nowrap overflow-hidden text-ellipsis md:overflow-visible">
                            EpiFlipBoard
                        </h1>
                    </Link>
                </div>

                <div className="flex items-center gap-4 order-3 justify-center md:justify-end">
                    <button className="p-2 hover:bg-gray-100 rounded-full" aria-label="Search">
                        <Search className="w-5 h-5" />
                    </button>
                </div>
            </div>
        </header>
    );
}
