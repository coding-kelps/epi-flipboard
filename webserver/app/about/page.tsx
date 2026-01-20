import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "About - Epi FlipBoard",
    description: "Learn about Epi FlipBoard and the team behind this student project.",
};

export default function AboutPage() {
    return (
        <div className="container mx-auto px-4 py-12 max-w-4xl">
            <h1 className="text-4xl font-serif font-bold text-gray-900 mb-2">About Epi FlipBoard</h1>
            <p className="text-sm text-gray-500 mb-8">A Student FlipBoard CloneProject</p>

            <div className="prose prose-gray max-w-none space-y-8">
                <section>
                    <h2 className="text-2xl font-serif font-semibold text-gray-900 mb-4">About This Project</h2>
                    <p className="text-gray-700 leading-relaxed mb-4">
                        Epi FlipBoard is a news aggregation platform developed as part of a student school project.
                        Its primary goal was to create FlipBoard clone.
                    </p>
                </section>

                <section>
                    <h2 className="text-2xl font-serif font-semibold text-gray-900 mb-4">Disclaimer</h2>
                    <p className="text-gray-700 leading-relaxed">
                        This is a student project created for educational purposes. This platform is not intended for commercial use.
                        Articles and content displayed on this platform are sourced from third-party providers, and all rights remain with the respective copyright holders.
                    </p>
                </section>

                <section>
                    <h2 className="text-2xl font-serif font-semibold text-gray-900 mb-4">Contact</h2>
                    <p className="text-gray-700 leading-relaxed mb-4">
                        For questions or feedback about this project, please reach out to us:
                    </p>
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
                        <p className="text-gray-700"><strong>Epi FlipBoard Team</strong></p>
                        <p className="text-gray-700">Email: contact@kelps.org</p>
                        <p className="text-gray-700 mt-2 text-sm italic">This is a student project - responses may be limited</p>
                    </div>
                </section>
            </div>
        </div>
    );
}
