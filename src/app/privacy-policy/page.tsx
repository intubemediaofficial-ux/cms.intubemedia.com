export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-sm border p-8 sm:p-12">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Privacy Policy</h1>
        <p className="text-sm text-gray-500 mb-8">Last updated: May 14, 2026</p>

        <div className="space-y-6 text-gray-700 text-sm leading-relaxed">
          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">1. Introduction</h2>
            <p>
              Bainsla Music Studio (&quot;we&quot;, &quot;our&quot;, or &quot;the Service&quot;) operated by Bainsla Music
              provides a channel management system for YouTube content creators. This Privacy Policy
              explains how we collect, use, and protect your information when you use our service at
              cms.bainslamusic.com.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">2. Information We Collect</h2>
            <p className="mb-2">We collect information in the following ways:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li><strong>Account Information:</strong> Name, email address, phone number (optional), and password when you create an account.</li>
              <li><strong>Google Account Data:</strong> When you sign in with Google, we access your email, profile name, and profile picture through Google OAuth.</li>
              <li><strong>YouTube Data:</strong> With your permission, we access your YouTube channel data including channel statistics (subscribers, views, videos), video metadata, analytics data (views, watch time, revenue), and monetization status through the YouTube Data API and YouTube Analytics API.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">3. How We Use Your Information</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li>To provide and maintain the channel management service</li>
              <li>To display your YouTube channel analytics and revenue data in the dashboard</li>
              <li>To manage channel assignments and user accounts</li>
              <li>To authenticate your identity and ensure account security</li>
              <li>To communicate with you about your account status</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">4. Google API Services Usage</h2>
            <p className="mb-2">
              Our use of information received from Google APIs adheres to the{" "}
              <a href="https://developers.google.com/terms/api-services-user-data-policy" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">
                Google API Services User Data Policy
              </a>
              , including the Limited Use requirements.
            </p>
            <p>
              We only use YouTube API data to display your channel analytics within our dashboard.
              We do not share, sell, or transfer your YouTube data to any third parties. We do not
              use your YouTube data for advertising purposes.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">5. Data Storage & Security</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li>Your account data is stored securely using Vercel KV (Redis).</li>
              <li>Passwords are hashed using SHA-256 before storage — we never store plain text passwords.</li>
              <li>YouTube OAuth tokens are stored per-channel and encrypted.</li>
              <li>We use HTTPS encryption for all data transmission.</li>
              <li>Access to admin functions is restricted to authorized administrators only.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">6. Data Sharing</h2>
            <p>
              We do not sell, trade, or rent your personal information to third parties. We may share
              data only with:
            </p>
            <ul className="list-disc pl-5 space-y-1 mt-2">
              <li><strong>Service Providers:</strong> Vercel (hosting), Google (authentication & YouTube APIs)</li>
              <li><strong>Legal Requirements:</strong> If required by law or to protect our rights</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">7. Your Rights</h2>
            <p>You have the right to:</p>
            <ul className="list-disc pl-5 space-y-1 mt-2">
              <li>Access your personal data stored in our system</li>
              <li>Request correction of inaccurate data</li>
              <li>Request deletion of your account and associated data</li>
              <li>Revoke Google OAuth access at any time through your{" "}
                <a href="https://myaccount.google.com/permissions" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">
                  Google Account permissions
                </a>
              </li>
              <li>Withdraw consent for data processing</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">8. Cookies</h2>
            <p>
              We use essential cookies for authentication and session management. These cookies are
              necessary for the service to function and cannot be disabled.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">9. Data Retention</h2>
            <p>
              We retain your account data as long as your account is active. If you request account
              deletion, we will remove your data within 30 days. Cached YouTube analytics data is
              refreshed periodically and old data is not permanently stored.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">10. Changes to This Policy</h2>
            <p>
              We may update this Privacy Policy from time to time. We will notify users of any
              significant changes by posting the new policy on this page with an updated revision date.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">11. Contact Us</h2>
            <p>
              If you have questions about this Privacy Policy or your data, contact us at:
            </p>
            <ul className="list-none mt-2 space-y-1">
              <li><strong>Email:</strong> bainslamusicofficial@gmail.com</li>
              <li><strong>Website:</strong> <a href="https://bainslamusic.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">bainslamusic.com</a></li>
            </ul>
          </section>
        </div>

        <div className="mt-10 pt-6 border-t text-center text-xs text-gray-400">
          &copy; {new Date().getFullYear()} Bainsla Music. All rights reserved.
        </div>
      </div>
    </div>
  );
}
