import type { Metadata } from "next";
import { Inter, Playfair_Display, UnifrakturMaguntia } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import NavBar from "@/components/NavBar";
import Footer from "@/components/Footer";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const playfair = Playfair_Display({ subsets: ["latin"], variable: "--font-playfair" });
const gothic = UnifrakturMaguntia({ weight: "400", subsets: ["latin"], variable: "--font-gothic" });

export const metadata: Metadata = {
  title: "Epi FlipBoard",
  description: "A FlipBoard clone made for a school project.",
  icons: {
    icon: [
      {
        url: "/favicon-light.ico",
        media: "(prefers-color-scheme: light)",
      },
      {
        url: "/favicon-dark.ico",
        media: "(prefers-color-scheme: dark)",
      },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${playfair.variable} ${gothic.variable} font-sans antialiased bg-white text-gray-900`}>
        <Header />
        <NavBar />
        <main className="min-h-screen">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
