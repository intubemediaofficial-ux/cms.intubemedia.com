import Link from "next/link";

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-sm border p-8 sm:p-12">
        <div className="flex items-center gap-4 mb-6">
          <Link href="/" className="text-sm text-blue-600 hover:underline">&larr; Home</Link>
          <Link href="/privacy-policy" className="text-sm text-blue-600 hover:underline">Privacy Policy</Link>
          <Link href="/about" className="text-sm text-blue-600 hover:underline">About Us</Link>
          <Link href="/contact" className="text-sm text-blue-600 hover:underline">Contact Us</Link>
          <Link href="/faq" className="text-sm text-blue-600 hover:underline">FAQ</Link>
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Terms &amp; Conditions</h1>
        <p className="text-sm text-gray-500 mb-8">Last updated: May 14, 2026</p>

        <div className="space-y-6 text-gray-700 text-sm leading-relaxed">
          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">1. Acceptance of Terms</h2>
            <p>
              By accessing and using InTubeMedia (&quot;the Service&quot;) at cms.intubemedia.com,
              you agree to be bound by these Terms &amp; Conditions. If you do not agree with any part
              of these terms, you must not use our Service.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">2. Description of Service</h2>
            <p>
              InTubeMedia is a YouTube channel management system (CMS) operated by InTubeMedia.
              The Service provides the following features to registered users:
            </p>
            <ul className="list-disc pl-5 space-y-1 mt-2">
              <li>YouTube channel analytics dashboard (revenue, views, subscribers, watch time)</li>
              <li>Per-channel and per-video revenue tracking with daily and monthly breakdowns</li>
              <li>Video management including privacy status, monetization, and duplicate detection</li>
              <li>Revenue reports with INR conversion and Excel export</li>
              <li>Payment tracking and withdrawal request management</li>
              <li>Music distribution to streaming platforms</li>
              <li>Copyright claim monitoring and release requests</li>
              <li>Multi-channel management under a single account</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">3. User Accounts</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li>You must create an account to use the Service by registering with your email and password or signing in through Google OAuth.</li>
              <li>New accounts require admin approval before full access is granted.</li>
              <li>You are responsible for maintaining the security of your account credentials.</li>
              <li>You must provide accurate and complete information during registration.</li>
              <li>You must not share your account credentials with any other person.</li>
              <li>You are responsible for all activities that occur under your account.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">4. YouTube API &amp; Google Services</h2>
            <p className="mb-2">
              The Service uses the YouTube Data API and YouTube Analytics API to access your YouTube channel data.
              By connecting your YouTube channel(s), you agree to the following:
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li>
                You authorize us to access your YouTube channel data (statistics, analytics, revenue, videos)
                as described in our{" "}
                <Link href="/privacy-policy" className="text-blue-600 underline">
                  Privacy Policy
                </Link>.
              </li>
              <li>
                Your use of the Service is also subject to{" "}
                <a href="https://www.youtube.com/t/terms" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">
                  YouTube Terms of Service
                </a>{" "}
                and{" "}
                <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">
                  Google Privacy Policy
                </a>.
              </li>
              <li>You can revoke our access to your YouTube data at any time through your Google Account permissions at{" "}
                <a href="https://myaccount.google.com/permissions" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">
                  myaccount.google.com/permissions
                </a>.
              </li>
              <li>We adhere to the{" "}
                <a href="https://developers.google.com/terms/api-services-user-data-policy" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">
                  Google API Services User Data Policy
                </a>, including the Limited Use requirements.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">5. Acceptable Use</h2>
            <p className="mb-2">You agree not to:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Use the Service for any unlawful purpose or in violation of any applicable laws</li>
              <li>Attempt to gain unauthorized access to the Service or its related systems</li>
              <li>Interfere with or disrupt the Service or its infrastructure</li>
              <li>Use automated systems (bots, scrapers) to access the Service without our consent</li>
              <li>Impersonate another user or misrepresent your affiliation with any entity</li>
              <li>Upload or distribute malicious content or software through the Service</li>
              <li>Use the Service to violate YouTube&apos;s Terms of Service or Community Guidelines</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">6. Revenue Data &amp; Financial Information</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li>Revenue data displayed in the Service is sourced from the YouTube Analytics API and may be subject to YouTube&apos;s reporting delays and adjustments.</li>
              <li>INR conversion rates are fetched from third-party exchange rate APIs and may vary slightly from bank rates.</li>
              <li>The Service provides revenue data for informational purposes only. We are not responsible for discrepancies between our displayed data and actual YouTube payments.</li>
              <li>Revenue figures are estimates and may change until finalized by YouTube.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">7. Intellectual Property</h2>
            <p>
              The Service, including its design, features, code, and content (excluding user data), is owned by
              InTubeMedia. You retain ownership of your YouTube channel data and content. By using the Service,
              you do not transfer any intellectual property rights to us.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">8. Account Termination</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li>We reserve the right to suspend or terminate your account if you violate these Terms.</li>
              <li>You may request account deletion at any time by contacting our admin team.</li>
              <li>Upon account deletion, your personal data will be removed within 30 days as described in our Privacy Policy.</li>
              <li>Admin may expire or revoke your channel tokens at any time for security or maintenance purposes. You will be notified and can re-authorize your channels.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">9. Limitation of Liability</h2>
            <p>
              The Service is provided &quot;as is&quot; without warranties of any kind. InTubeMedia shall not
              be liable for any indirect, incidental, special, or consequential damages arising from your
              use of the Service. This includes but is not limited to loss of revenue data, service
              interruptions, or inaccuracies in displayed analytics.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">10. Service Availability</h2>
            <p>
              We strive to keep the Service available at all times but do not guarantee uninterrupted access.
              The Service may be temporarily unavailable due to maintenance, updates, or circumstances beyond
              our control. YouTube API quota limits may also affect data availability.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">11. Changes to Terms</h2>
            <p>
              We may update these Terms &amp; Conditions from time to time. Changes will be posted on this
              page with an updated revision date. Continued use of the Service after changes constitutes
              acceptance of the updated terms.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">12. Governing Law</h2>
            <p>
              These Terms shall be governed by and construed in accordance with the laws of India.
              Any disputes arising from these Terms or the Service shall be subject to the exclusive
              jurisdiction of the courts in India.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">13. Contact Us</h2>
            <p>
              If you have questions about these Terms &amp; Conditions, contact us at:
            </p>
            <ul className="list-none mt-2 space-y-1">
              <li><strong>Email:</strong> contact@intubemedia.com</li>
              <li><strong>Website:</strong>{" "}
                <a href="https://intubemedia.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">
                  intubemedia.com
                </a>
              </li>
            </ul>
          </section>
        </div>

        <div className="mt-8 pt-6 border-t flex items-center justify-between text-xs text-gray-400">
          <span>&copy; {new Date().getFullYear()} InTubeMedia. All rights reserved.</span>
          <Link href="/privacy-policy" className="text-blue-500 hover:underline">
            Privacy Policy
          </Link>
        </div>
      </div>
    </div>
  );
}
