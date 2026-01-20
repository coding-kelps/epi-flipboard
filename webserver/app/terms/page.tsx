import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Terms of Service - Epi FlipBoard",
    description: "Terms of service and user agreement for Epi FlipBoard.",
};

export default function TermsPage() {
    return (
        <div className="container mx-auto px-4 py-12 max-w-4xl">
            <h1 className="text-4xl font-serif font-bold text-gray-900 mb-2">Terms of Service</h1>
            <p className="text-sm text-gray-500 mb-8">Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>

            <div className="prose prose-gray max-w-none space-y-8">
                <section>
                    <h2 className="text-2xl font-serif font-semibold text-gray-900 mb-4">1. Acceptance of Terms</h2>
                    <p className="text-gray-700 leading-relaxed">
                        Welcome to Epi FlipBoard. By accessing or using our website and services, you agree to be bound by these Terms of Service
                        ("Terms"). If you do not agree to these Terms, please do not use our services. We reserve the right to modify these Terms
                        at any time, and your continued use of the service constitutes acceptance of any changes.
                    </p>
                </section>

                <section>
                    <h2 className="text-2xl font-serif font-semibold text-gray-900 mb-4">2. Description of Service</h2>
                    <p className="text-gray-700 leading-relaxed mb-4">
                        Epi FlipBoard is a news aggregation and content discovery platform that provides users with curated articles, news stories,
                        and other content from various sources. Our service allows you to:
                    </p>
                    <ul className="list-disc pl-6 text-gray-700 space-y-2">
                        <li>Browse and read articles from multiple sources</li>
                        <li>Create a personalized account to save preferences</li>
                        <li>Search for specific topics and content</li>
                        <li>Access content across different categories and sources</li>
                    </ul>
                </section>

                <section>
                    <h2 className="text-2xl font-serif font-semibold text-gray-900 mb-4">3. User Accounts</h2>

                    <h3 className="text-xl font-semibold text-gray-800 mb-3">3.1 Account Registration</h3>
                    <p className="text-gray-700 leading-relaxed mb-4">
                        To access certain features of our service, you may be required to create an account. When creating an account, you agree to:
                    </p>
                    <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-4">
                        <li>Provide accurate, current, and complete information</li>
                        <li>Maintain and promptly update your account information</li>
                        <li>Maintain the security of your password and account credentials</li>
                        <li>Accept responsibility for all activities that occur under your account</li>
                        <li>Notify us immediately of any unauthorized use of your account</li>
                    </ul>

                    <h3 className="text-xl font-semibold text-gray-800 mb-3">3.2 Account Termination</h3>
                    <p className="text-gray-700 leading-relaxed">
                        We reserve the right to suspend or terminate your account at any time, with or without notice, for violation of these Terms
                        or for any other reason we deem appropriate. You may also delete your account at any time by contacting us.
                    </p>
                </section>

                <section>
                    <h2 className="text-2xl font-serif font-semibold text-gray-900 mb-4">4. User Conduct and Responsibilities</h2>
                    <p className="text-gray-700 leading-relaxed mb-4">
                        You agree not to use our service to:
                    </p>
                    <ul className="list-disc pl-6 text-gray-700 space-y-2">
                        <li>Violate any applicable laws, regulations, or third-party rights</li>
                        <li>Post or transmit harmful, offensive, or illegal content</li>
                        <li>Impersonate any person or entity or misrepresent your affiliation</li>
                        <li>Interfere with or disrupt the service or servers</li>
                        <li>Attempt to gain unauthorized access to any part of the service</li>
                        <li>Use automated systems (bots, scrapers) without our express permission</li>
                        <li>Collect or store personal data about other users without consent</li>
                        <li>Engage in any activity that could harm, disable, or impair the service</li>
                    </ul>
                </section>

                <section>
                    <h2 className="text-2xl font-serif font-semibold text-gray-900 mb-4">5. Intellectual Property Rights</h2>

                    <h3 className="text-xl font-semibold text-gray-800 mb-3">5.1 Our Content</h3>
                    <p className="text-gray-700 leading-relaxed mb-4">
                        All content, features, and functionality of Epi FlipBoard, including but not limited to text, graphics, logos, icons,
                        images, audio clips, software, and the compilation thereof (collectively, "Content"), are the exclusive property of
                        Epi FlipBoard or its licensors and are protected by international copyright, trademark, and other intellectual property laws.
                    </p>

                    <h3 className="text-xl font-semibold text-gray-800 mb-3">5.2 Third-Party Content</h3>
                    <p className="text-gray-700 leading-relaxed mb-4">
                        Articles and content displayed on our platform are sourced from third-party publishers and content providers.
                        We do not claim ownership of this third-party content, and all rights remain with the respective copyright holders.
                    </p>

                    <h3 className="text-xl font-semibold text-gray-800 mb-3">5.3 Limited License</h3>
                    <p className="text-gray-700 leading-relaxed">
                        We grant you a limited, non-exclusive, non-transferable license to access and use our service for personal,
                        non-commercial purposes. You may not reproduce, distribute, modify, create derivative works, publicly display,
                        or exploit any Content without our express written permission.
                    </p>
                </section>

                <section>
                    <h2 className="text-2xl font-serif font-semibold text-gray-900 mb-4">6. Third-Party Links and Services</h2>
                    <p className="text-gray-700 leading-relaxed">
                        Our service may contain links to third-party websites, applications, or services that are not owned or controlled by us.
                        We have no control over and assume no responsibility for the content, privacy policies, or practices of any third-party
                        sites or services. You acknowledge and agree that we shall not be responsible or liable for any damage or loss caused by
                        your use of such third-party content or services.
                    </p>
                </section>

                <section>
                    <h2 className="text-2xl font-serif font-semibold text-gray-900 mb-4">7. Disclaimers and Limitations of Liability</h2>

                    <h3 className="text-xl font-semibold text-gray-800 mb-3">7.1 Service Availability</h3>
                    <p className="text-gray-700 leading-relaxed mb-4">
                        Our service is provided "as is" and "as available" without warranties of any kind, either express or implied.
                        We do not warrant that the service will be uninterrupted, secure, or error-free. We reserve the right to modify,
                        suspend, or discontinue any aspect of the service at any time without notice.
                    </p>

                    <h3 className="text-xl font-semibold text-gray-800 mb-3">7.2 Content Accuracy</h3>
                    <p className="text-gray-700 leading-relaxed mb-4">
                        While we strive to provide accurate and up-to-date information, we make no representations or warranties regarding
                        the accuracy, completeness, or reliability of any content displayed on our service. Third-party content is provided
                        by external sources, and we are not responsible for errors or omissions in such content.
                    </p>

                    <h3 className="text-xl font-semibold text-gray-800 mb-3">7.3 Limitation of Liability</h3>
                    <p className="text-gray-700 leading-relaxed">
                        To the fullest extent permitted by law, Epi FlipBoard and its affiliates, officers, directors, employees, and agents
                        shall not be liable for any indirect, incidental, special, consequential, or punitive damages, or any loss of profits
                        or revenues, whether incurred directly or indirectly, or any loss of data, use, goodwill, or other intangible losses
                        resulting from your use of or inability to use the service.
                    </p>
                </section>

                <section>
                    <h2 className="text-2xl font-serif font-semibold text-gray-900 mb-4">8. Indemnification</h2>
                    <p className="text-gray-700 leading-relaxed">
                        You agree to indemnify, defend, and hold harmless Epi FlipBoard and its affiliates, officers, directors, employees,
                        and agents from and against any claims, liabilities, damages, losses, costs, or expenses (including reasonable attorneys' fees)
                        arising from your use of the service, your violation of these Terms, or your violation of any rights of a third party.
                    </p>
                </section>

                <section>
                    <h2 className="text-2xl font-serif font-semibold text-gray-900 mb-4">9. Privacy</h2>
                    <p className="text-gray-700 leading-relaxed">
                        Your privacy is important to us. Please review our <a href="/privacy" className="text-blue-600 hover:underline">Privacy Policy</a> to
                        understand how we collect, use, and protect your personal information. By using our service, you consent to our collection
                        and use of your data as described in the Privacy Policy.
                    </p>
                </section>

                <section>
                    <h2 className="text-2xl font-serif font-semibold text-gray-900 mb-4">10. Governing Law and Dispute Resolution</h2>
                    <p className="text-gray-700 leading-relaxed mb-4">
                        These Terms shall be governed by and construed in accordance with the laws of [Your Jurisdiction], without regard to
                        its conflict of law provisions. Any disputes arising from these Terms or your use of the service shall be resolved through
                        binding arbitration in accordance with the rules of [Arbitration Association], except that either party may seek injunctive
                        or equitable relief in a court of competent jurisdiction.
                    </p>
                    <p className="text-gray-700 leading-relaxed">
                        You agree to waive any right to a jury trial or to participate in a class action lawsuit.
                    </p>
                </section>

                <section>
                    <h2 className="text-2xl font-serif font-semibold text-gray-900 mb-4">11. Severability</h2>
                    <p className="text-gray-700 leading-relaxed">
                        If any provision of these Terms is found to be invalid, illegal, or unenforceable, the remaining provisions shall
                        continue in full force and effect. The invalid provision shall be modified to the minimum extent necessary to make it
                        valid and enforceable.
                    </p>
                </section>

                <section>
                    <h2 className="text-2xl font-serif font-semibold text-gray-900 mb-4">12. Entire Agreement</h2>
                    <p className="text-gray-700 leading-relaxed">
                        These Terms, together with our Privacy Policy and any other legal notices or agreements published on the service,
                        constitute the entire agreement between you and Epi FlipBoard regarding your use of the service and supersede any
                        prior agreements or understandings.
                    </p>
                </section>

                <section>
                    <h2 className="text-2xl font-serif font-semibold text-gray-900 mb-4">13. Changes to Terms</h2>
                    <p className="text-gray-700 leading-relaxed">
                        We reserve the right to modify or replace these Terms at any time at our sole discretion. Material changes will be
                        effective upon posting to this page with an updated "Last updated" date. Your continued use of the service after any
                        changes constitutes acceptance of the new Terms. We encourage you to review these Terms periodically.
                    </p>
                </section>

                <section>
                    <h2 className="text-2xl font-serif font-semibold text-gray-900 mb-4">14. Contact Information</h2>
                    <p className="text-gray-700 leading-relaxed mb-4">
                        If you have any questions or concerns about these Terms of Service, please contact us at:
                    </p>
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
                        <p className="text-gray-700"><strong>Epi FlipBoard</strong></p>
                        <p className="text-gray-700">Email: legal@kelps.org</p>
                    </div>
                </section>
            </div>
        </div>
    );
}
