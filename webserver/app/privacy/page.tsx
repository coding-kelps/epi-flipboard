import type { Metadata } from 'next'

export const metadata: Metadata = {
    title: 'Privacy Policy - Epi FlipBoard',
    description:
        'Privacy policy and data protection information for Epi FlipBoard users.',
}

export default function PrivacyPage() {
    return (
        <div className="container mx-auto px-4 py-12 max-w-4xl">
            <h1 className="text-4xl font-serif font-bold text-gray-900 mb-2">
                Privacy Policy
            </h1>
            <p className="text-sm text-gray-500 mb-8">
                Last updated:{' '}
                {new Date().toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                })}
            </p>

            <div className="prose prose-gray max-w-none space-y-8">
                <section>
                    <h2 className="text-2xl font-serif font-semibold text-gray-900 mb-4">
                        1. Introduction
                    </h2>
                    <p className="text-gray-700 leading-relaxed mb-4">
                        Welcome to Epi FlipBoard (&quot;we,&quot;
                        &quot;our,&quot; or &quot;us&quot;). We are committed to
                        protecting your personal data and respecting your
                        privacy. This Privacy Policy explains how we collect,
                        use, disclose, and safeguard your information when you
                        visit our website and use our services.
                    </p>
                    <p className="text-gray-700 leading-relaxed">
                        Please read this privacy policy carefully. If you do not
                        agree with the terms of this privacy policy, please do
                        not access the site.
                    </p>
                </section>

                <section>
                    <h2 className="text-2xl font-serif font-semibold text-gray-900 mb-4">
                        2. Information We Collect
                    </h2>

                    <h3 className="text-xl font-semibold text-gray-800 mb-3">
                        2.1 Personal Data
                    </h3>
                    <p className="text-gray-700 leading-relaxed mb-4">
                        We may collect personal information that you voluntarily
                        provide to us when you:
                    </p>
                    <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-4">
                        <li>Register for an account</li>
                        <li>Subscribe to our newsletter</li>
                        <li>Fill out a form or survey</li>
                        <li>
                            Contact us via email or other communication channels
                        </li>
                    </ul>
                    <p className="text-gray-700 leading-relaxed mb-4">
                        This information may include your name, email address,
                        username, and any other information you choose to
                        provide.
                    </p>

                    <h3 className="text-xl font-semibold text-gray-800 mb-3">
                        2.2 Automatically Collected Information
                    </h3>
                    <p className="text-gray-700 leading-relaxed mb-4">
                        When you access our website, we may automatically
                        collect certain information about your device,
                        including:
                    </p>
                    <ul className="list-disc pl-6 text-gray-700 space-y-2">
                        <li>IP address and location data</li>
                        <li>Browser type and version</li>
                        <li>Operating system</li>
                        <li>Referring URLs and pages viewed</li>
                        <li>Date and time of visits</li>
                        <li>Cookies and similar tracking technologies</li>
                    </ul>
                </section>

                <section>
                    <h2 className="text-2xl font-serif font-semibold text-gray-900 mb-4">
                        3. How We Use Your Information
                    </h2>
                    <p className="text-gray-700 leading-relaxed mb-4">
                        We use the information we collect for various purposes,
                        including:
                    </p>
                    <ul className="list-disc pl-6 text-gray-700 space-y-2">
                        <li>
                            Providing, maintaining, and improving our services
                        </li>
                        <li>Personalizing your experience on our website</li>
                        <li>
                            Communicating with you about updates, news, and
                            promotional content
                        </li>
                        <li>
                            Analyzing usage patterns and trends to enhance user
                            experience
                        </li>
                        <li>
                            Detecting, preventing, and addressing technical
                            issues and security threats
                        </li>
                        <li>
                            Complying with legal obligations and enforcing our
                            terms and policies
                        </li>
                    </ul>
                </section>

                <section>
                    <h2 className="text-2xl font-serif font-semibold text-gray-900 mb-4">
                        4. Cookies and Tracking Technologies
                    </h2>
                    <p className="text-gray-700 leading-relaxed mb-4">
                        We use &apos;cookies&apos; and similar tracking
                        technologies to track the activity on our service and
                        hold certain information. about your interactions with
                        our website. Cookies are small data files stored on your
                        device that help us improve functionality and analyze
                        site usage.
                    </p>

                    <h3 className="text-xl font-semibold text-gray-800 mb-3">
                        4.1 Types of Cookies We Use
                    </h3>
                    <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-4">
                        <li>
                            <strong>Essential Cookies:</strong> Required for the
                            website to function properly
                        </li>
                        <li>
                            <strong>Performance Cookies:</strong> Help us
                            understand how visitors interact with our website
                        </li>
                        <li>
                            <strong>Functionality Cookies:</strong> Remember
                            your preferences and settings
                        </li>
                    </ul>

                    <p className="text-gray-700 leading-relaxed">
                        You can instruct your browser to refuse all cookies or
                        to indicate when a cookie is being sent. However, if you
                        do not accept cookies, you may not be able to use some
                        portions of our service.
                    </p>
                </section>

                <section>
                    <h2 className="text-2xl font-serif font-semibold text-gray-900 mb-4">
                        5. Data Sharing and Disclosure
                    </h2>
                    <p className="text-gray-700 leading-relaxed mb-4">
                        We do not sell, trade, or rent your personal information
                        to third parties. We may share your information in the
                        following circumstances:
                    </p>
                    <ul className="list-disc pl-6 text-gray-700 space-y-2">
                        <li>
                            <strong>Service Providers:</strong> With trusted
                            third-party service providers who assist us in
                            operating our website and services
                        </li>
                        <li>
                            <strong>Legal Compliance:</strong> When required by
                            law, regulation, or legal process
                        </li>
                        <li>
                            <strong>Business Transfers:</strong> In connection
                            with a merger, acquisition, or sale of assets
                        </li>
                        <li>
                            <strong>Protection of Rights:</strong> To protect
                            our rights, property, safety, or that of our users
                            or others
                        </li>
                    </ul>
                </section>

                <section>
                    <h2 className="text-2xl font-serif font-semibold text-gray-900 mb-4">
                        6. Your Rights Under GDPR
                    </h2>
                    <p className="text-gray-700 leading-relaxed mb-4">
                        If you are a resident of the European Economic Area
                        (EEA), you have certain data protection rights under the
                        General Data Protection Regulation (GDPR):
                    </p>
                    <ul className="list-disc pl-6 text-gray-700 space-y-2">
                        <li>
                            <strong>Right to Access:</strong> Request a copy of
                            the personal data we hold about you
                        </li>
                        <li>
                            <strong>Right to Rectification:</strong> Request
                            correction of inaccurate or incomplete data
                        </li>
                        <li>
                            <strong>Right to Erasure:</strong> Request deletion
                            of your personal data (subject to legal obligations)
                        </li>
                        <li>
                            <strong>Right to Restrict Processing:</strong>{' '}
                            Request limitation on how we use your data
                        </li>
                        <li>
                            <strong>Right to Data Portability:</strong> Request
                            transfer of your data to another service
                        </li>
                        <li>
                            <strong>Right to Object:</strong> Object to our
                            processing of your personal data
                        </li>
                        <li>
                            <strong>Right to Withdraw Consent:</strong> Withdraw
                            consent at any time where we rely on consent to
                            process your data
                        </li>
                    </ul>
                    <p className="text-gray-700 leading-relaxed mt-4">
                        To exercise any of these rights, please contact us using
                        the information provided at the end of this policy.
                    </p>
                </section>

                <section>
                    <h2 className="text-2xl font-serif font-semibold text-gray-900 mb-4">
                        7. Data Security
                    </h2>
                    <p className="text-gray-700 leading-relaxed">
                        We implement appropriate technical and organizational
                        security measures to protect your personal data against
                        unauthorized access, alteration, disclosure, or
                        destruction. However, no method of transmission over the
                        internet or electronic storage is 100% secure, and we
                        cannot guarantee absolute security.
                    </p>
                </section>

                <section>
                    <h2 className="text-2xl font-serif font-semibold text-gray-900 mb-4">
                        8. Data Retention
                    </h2>
                    <p className="text-gray-700 leading-relaxed">
                        We retain your personal data only for as long as
                        necessary to fulfill the purposes for which it was
                        collected, comply with legal obligations, resolve
                        disputes, and enforce our agreements. When your data is
                        no longer needed, we will securely delete or anonymize
                        it.
                    </p>
                </section>

                <section>
                    <h2 className="text-2xl font-serif font-semibold text-gray-900 mb-4">
                        9. Third-Party Links
                    </h2>
                    <p className="text-gray-700 leading-relaxed">
                        Our website may contain links to third-party websites or
                        services. We are not responsible for the privacy
                        practices or content of these external sites. We
                        encourage you to review the privacy policies of any
                        third-party sites you visit.
                    </p>
                </section>

                <section>
                    <h2 className="text-2xl font-serif font-semibold text-gray-900 mb-4">
                        10. Children&apos;s Privacy
                    </h2>
                    <p className="text-gray-700 leading-relaxed">
                        Our services are not intended for individuals under the
                        age of 16. We do not knowingly collect personal
                        information from children. If we become aware that we
                        have collected data from a child without parental
                        consent, we will take steps to delete that information
                        promptly.
                    </p>
                </section>

                <section>
                    <h2 className="text-2xl font-serif font-semibold text-gray-900 mb-4">
                        11. International Data Transfers
                    </h2>
                    <p className="text-gray-700 leading-relaxed">
                        Your information may be transferred to and maintained on
                        servers located outside of your state, province,
                        country, or other governmental jurisdiction where data
                        protection laws may differ. By using our services, you
                        consent to the transfer of your information to these
                        locations, where we will take appropriate measures to
                        ensure your data is protected in accordance with this
                        Privacy Policy. protected in accordance with this
                        Privacy Policy.
                    </p>
                </section>

                <section>
                    <h2 className="text-2xl font-serif font-semibold text-gray-900 mb-4">
                        12. Changes to This Privacy Policy
                    </h2>
                    <p className="text-gray-700 leading-relaxed">
                        We may update this Privacy Policy from time to time to
                        reflect changes in our practices or for legal,
                        operational, or regulatory reasons. We will notify you
                        of any material changes by posting the updated policy on
                        this page with a new &quot;Last updated&quot; date. Your
                        continued use of our services after such changes
                        constitutes acceptance of the updated policy.
                    </p>
                </section>

                <section>
                    <h2 className="text-2xl font-serif font-semibold text-gray-900 mb-4">
                        13. Contact Us
                    </h2>
                    <p className="text-gray-700 leading-relaxed mb-4">
                        If you have any questions, concerns, or requests
                        regarding this Privacy Policy or our data practices,
                        please contact us at:
                    </p>
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
                        <p className="text-gray-700">
                            <strong>Epi FlipBoard</strong>
                        </p>
                        <p className="text-gray-700">
                            Email: privacy@kelps.org
                        </p>
                    </div>
                </section>
            </div>
        </div>
    )
}
