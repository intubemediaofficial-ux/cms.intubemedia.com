import Link from "next/link";

const faqs = [
  {
    question: "What is InTubeMedia?",
    answer: "InTubeMedia is a YouTube Channel Management System (CMS) designed for content creators, music labels, and multi-channel networks (MCNs). It helps you track revenue, manage videos, monitor analytics, handle payments, and distribute music — all from one dashboard."
  },
  {
    question: "How do I create an account?",
    answer: "You can create an account by clicking 'Sign In' and then 'Create Account'. You can register with your email and password, or sign in directly with your Google account. New accounts require admin approval before full access is granted."
  },
  {
    question: "Is InTubeMedia free to use?",
    answer: "InTubeMedia is available for content creators and music labels who are part of our network. Contact us to learn about partnership opportunities and pricing."
  },
  {
    question: "How does InTubeMedia access my YouTube data?",
    answer: "We use official Google OAuth 2.0 and YouTube APIs (YouTube Data API and YouTube Analytics API) to access your channel data. You explicitly authorize which channels to connect, and you can revoke access at any time through your Google account settings at myaccount.google.com/permissions."
  },
  {
    question: "What YouTube data does InTubeMedia access?",
    answer: "With your permission, we access: channel statistics (subscribers, views, video count), video metadata (titles, thumbnails, privacy status, monetization), analytics data (views, watch time, revenue, CPM, RPM), and monetary reports. We only access data you explicitly authorize."
  },
  {
    question: "Is my data safe with InTubeMedia?",
    answer: "Yes. We use HTTPS encryption for all data transmission, passwords are hashed before storage, and OAuth tokens are stored securely. We never share, sell, or transfer your YouTube data to third parties. We comply with Google's API Services User Data Policy including Limited Use requirements."
  },
  {
    question: "How do I connect my YouTube channel?",
    answer: "After logging in, go to the Channels page and click 'Add Channel'. You'll be redirected to Google to authorize access. Once authorized, your channel data will automatically sync to your dashboard."
  },
  {
    question: "Why is my channel token showing as 'Expired' or 'Not Validated'?",
    answer: "OAuth tokens can expire periodically. Go to your Channels page and click 'Validate Token' next to the affected channel. You'll be asked to re-authorize through Google. Once done, your token status will update to 'Valid' and data will sync again."
  },
  {
    question: "How accurate is the revenue data?",
    answer: "Revenue data comes directly from the YouTube Analytics API, which is the same source as YouTube Studio. Data is synced regularly and reflects the most recent information available from YouTube. Note that YouTube revenue data may have a 2-3 day delay."
  },
  {
    question: "Can I manage multiple YouTube channels?",
    answer: "Yes! InTubeMedia is built for multi-channel management. You can connect and manage unlimited YouTube channels from a single account. Each channel's data is tracked independently with consolidated dashboards."
  },
  {
    question: "What is Music Distribution?",
    answer: "Our music distribution feature allows you to distribute your music to major streaming platforms like Spotify, Apple Music, Amazon Music, JioSaavn, and more. Upload your tracks with artwork, fill in metadata, and we handle the distribution."
  },
  {
    question: "How do payments work?",
    answer: "InTubeMedia tracks your YouTube revenue and provides payment management features. You can view per-channel payment breakdowns, request withdrawals, and track payment history. TDS calculations are supported for Indian creators."
  },
  {
    question: "What are copyright claims and how do I manage them?",
    answer: "Copyright claims are made when Content ID detects your content in other videos or vice versa. InTubeMedia helps you monitor these claims, submit release requests, and track their resolution status."
  },
  {
    question: "How do I revoke InTubeMedia's access to my YouTube data?",
    answer: "You can revoke access anytime by visiting myaccount.google.com/permissions, finding InTubeMedia in the list of connected apps, and clicking 'Remove Access'. This will immediately stop our access to your YouTube data."
  },
  {
    question: "I'm having trouble logging in. What should I do?",
    answer: "Try these steps: 1) Clear your browser cache and cookies, 2) Try using an incognito/private window, 3) Make sure you're using the correct email and password, 4) If using Google login, ensure you're selecting the right Google account. If problems persist, contact us at shivlalbainslaofficial@gmail.com."
  },
  {
    question: "How do I contact support?",
    answer: "You can reach us via email at shivlalbainslaofficial@gmail.com, or use the Contact Us page on our website. We typically respond within 24-48 hours during business hours (Monday-Saturday, 10 AM - 7 PM IST)."
  }
];

export default function FAQPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      {/* Header */}
      <header className="border-b border-slate-200 bg-white/80 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-3">
              <div className="w-10 h-10 bg-red-600 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z" />
                </svg>
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-900">InTubeMedia</h1>
                <p className="text-xs text-slate-500">Channel Management System</p>
              </div>
            </Link>
          </div>
          <nav className="flex items-center gap-4">
            <Link href="/" className="text-sm text-slate-600 hover:text-slate-900 transition-colors">Home</Link>
            <Link href="/about" className="text-sm text-slate-600 hover:text-slate-900 transition-colors">About Us</Link>
            <Link href="/contact" className="text-sm text-slate-600 hover:text-slate-900 transition-colors">Contact Us</Link>
            <Link href="/faq" className="text-sm text-red-600 font-medium">FAQ</Link>
            <Link href="/login" className="px-5 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors">Sign In</Link>
          </nav>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Page Title */}
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-slate-900 mb-4">Frequently Asked Questions</h2>
          <p className="text-lg text-slate-600">
            Find answers to common questions about InTubeMedia and our services.
          </p>
        </div>

        {/* FAQ List */}
        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <details
              key={index}
              className="group bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden"
            >
              <summary className="flex items-center justify-between cursor-pointer px-6 py-4 hover:bg-slate-50 transition-colors">
                <span className="text-base font-medium text-slate-900 pr-4">{faq.question}</span>
                <svg
                  className="w-5 h-5 text-slate-400 flex-shrink-0 transition-transform group-open:rotate-180"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                </svg>
              </summary>
              <div className="px-6 pb-4">
                <p className="text-sm text-slate-600 leading-relaxed">{faq.answer}</p>
              </div>
            </details>
          ))}
        </div>

        {/* Still have questions */}
        <div className="mt-12 bg-red-50 rounded-2xl border border-red-100 p-8 text-center">
          <h3 className="text-xl font-bold text-slate-900 mb-2">Still have questions?</h3>
          <p className="text-slate-600 mb-4">
            Can&apos;t find the answer you&apos;re looking for? Our support team is happy to help.
          </p>
          <Link
            href="/contact"
            className="inline-flex items-center px-6 py-3 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition-colors"
          >
            Contact Support
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-8 mt-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z" />
                </svg>
              </div>
              <span className="text-sm font-semibold text-slate-900">InTubeMedia</span>
            </div>
            <nav className="flex items-center gap-6 text-sm text-slate-600">
              <Link href="/privacy-policy" className="hover:text-slate-900 transition-colors">Privacy Policy</Link>
              <Link href="/terms" className="hover:text-slate-900 transition-colors">Terms &amp; Conditions</Link>
              <Link href="/about" className="hover:text-slate-900 transition-colors">About Us</Link>
              <Link href="/contact" className="hover:text-slate-900 transition-colors">Contact Us</Link>
              <Link href="/faq" className="hover:text-slate-900 transition-colors">FAQ</Link>
            </nav>
            <p className="text-xs text-slate-500">
              &copy; {new Date().getFullYear()} InTubeMedia. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
