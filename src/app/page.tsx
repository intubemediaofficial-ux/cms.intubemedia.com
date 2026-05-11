"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  Music2,
  Play,
  ChevronRight,
  Phone,
  Mail,
  MapPin,
  Menu,
  X,
  Headphones,
  Radio,
  Mic2,
  Share2,
  Bell,
  Users,
  TrendingUp,
  Award,
  Star,
  ArrowRight,
  ExternalLink,
} from "lucide-react";

function YoutubeIcon({ className }: { className?: string; [key: string]: unknown }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
    </svg>
  );
}

/* ───────── constants ───────── */

const NAV_LINKS = [
  { label: "Home", href: "#home" },
  { label: "About", href: "#about" },
  { label: "Services", href: "#services" },
  { label: "Videos", href: "#videos" },
  { label: "Artists", href: "#artists" },
  { label: "Contact", href: "#contact" },
];

const STATS = [
  { value: 9, suffix: "+", label: "Years Experience", icon: Award },
  { value: 669, suffix: "+", label: "Videos Published", icon: Play },
  { value: 50, suffix: "+", label: "Artists & Channels", icon: Users },
  { value: 150, suffix: "M+", label: "Total Views", icon: TrendingUp },
];

const SERVICES = [
  {
    icon: YoutubeIcon,
    title: "YouTube CMS/MCN Services",
    description:
      "Complete YouTube channel management, content ID, monetization & rights management for artists and labels.",
    color: "from-red-500 to-rose-600",
  },
  {
    icon: Radio,
    title: "Channel Promotion & Management",
    description:
      "Strategic channel growth, audience engagement, and brand building to maximize your reach and revenue.",
    color: "from-purple-500 to-violet-600",
  },
  {
    icon: Headphones,
    title: "Audio Video Distribution",
    description:
      "Distribute your music across 150+ digital platforms including Spotify, JioSaavn, Gaana, Wynk & more.",
    color: "from-blue-500 to-cyan-600",
  },
  {
    icon: Share2,
    title: "Social Media Management",
    description:
      "Professional social media strategy, content creation & management across Instagram, Facebook & more.",
    color: "from-pink-500 to-fuchsia-600",
  },
  {
    icon: Bell,
    title: "Caller Tunes & CRBT",
    description:
      "Set up caller tunes across Jio, Airtel, Vi & BSNL. Maximize revenue from your music catalog.",
    color: "from-amber-500 to-orange-600",
  },
  {
    icon: Mic2,
    title: "Music Production",
    description:
      "End-to-end music production from recording and mixing to mastering. Professional studio quality output.",
    color: "from-emerald-500 to-teal-600",
  },
];

const CHANNELS = [
  { name: "Bainsla Music", handle: "bainslaofficial", subscribers: "1.51M" },
  { name: "Bainsla Studio", handle: "bainslastudio", subscribers: "500K+" },
  { name: "Buteri Music", handle: "buterimusic", subscribers: "300K+" },
  { name: "Godwad Music", handle: "godwadmusic", subscribers: "200K+" },
  { name: "Panghat", handle: "panghat", subscribers: "150K+" },
];

const VIDEOS = [
  {
    id: "mu8M7Nk8ywU",
    title: "कबूतर बोले गुटर गू | Kabutar Bole Gutar Gu | New Dj Dance",
    artist: "DG Mawai",
    views: "20M+ Views",
  },
  {
    id: "S7VZLHubP4c",
    title: "इन दोनों कहनी ने DJ के आगे धूम मचा दी | Ajeet Katara & Balli",
    artist: "Ajeet Katara, Balli",
    views: "18M+ Views",
  },
  {
    id: "3ELgvab96VQ",
    title: "छोरी तेरी चाल मोरनी की ढाल | Chori Teri Chal Morni Ki Dhal",
    artist: "DG Mawai",
    views: "16M+ Views",
  },
  {
    id: "8XKjIjWs6Ak",
    title: "अलवर की इस मुस्कान नाम की डांसर | New Gurjar Girl Dance",
    artist: "DG Mawai",
    views: "15M+ Views",
  },
];

const DIRECTORS = [
  {
    name: "Ajeet Bainsla",
    role: "Founder & Director",
    desc: "Born in Soorgarh, Sawai Madhopur. Passionate advocate for Rajasthani folk music since 2016.",
  },
  {
    name: "Shivlal Bainsla",
    role: "Director",
    desc: "Driving business growth and artist partnerships across Rajasthan and beyond.",
  },
  {
    name: "Aman Bainsla",
    role: "Director",
    desc: "Co-founder managing operations, technology and digital distribution.",
  },
];

const PLATFORMS = [
  "Spotify",
  "JioSaavn",
  "Gaana",
  "Wynk Music",
  "YouTube Music",
  "Apple Music",
  "Amazon Music",
  "Hungama",
  "Resso",
  "Instagram",
];

const TESTIMONIALS = [
  {
    name: "Rakesh Meena",
    role: "YouTube Artist",
    text: "Bainsla Music ने मेरे channel को एक नई ऊँचाई दी। उनकी team बहुत professional है और हमेशा support करती है। मेरे subscribers 10x बढ़ गए!",
    rating: 5,
  },
  {
    name: "Sunita Khatana",
    role: "Folk Singer",
    text: "Music distribution और promotion में Bainsla Music सबसे बेहतर है। मेरे गाने अब Spotify, JioSaavn सब पर available हैं। बहुत अच्छी service!",
    rating: 5,
  },
  {
    name: "Mahendra Gurjar",
    role: "Channel Owner",
    text: "CMS service बहुत शानदार है। Copyright issues solve हो गए और revenue भी बढ़ गया। Highly recommended for all Rajasthani artists!",
    rating: 5,
  },
];

/* ───────── animated counter hook ───────── */

function useCountUp(end: number, duration = 2000) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const counted = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !counted.current) {
          counted.current = true;
          const start = performance.now();
          const step = (now: number) => {
            const progress = Math.min((now - start) / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            setCount(Math.floor(eased * end));
            if (progress < 1) requestAnimationFrame(step);
          };
          requestAnimationFrame(step);
        }
      },
      { threshold: 0.3 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [end, duration]);

  return { count, ref };
}

/* ───────── section wrapper ───────── */

function Section({
  id,
  className = "",
  children,
}: {
  id?: string;
  className?: string;
  children: React.ReactNode;
}) {
  const ref = useRef<HTMLElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setVisible(true);
      },
      { threshold: 0.1 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      id={id}
      ref={ref}
      className={`transition-all duration-700 ${
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
      } ${className}`}
    >
      {children}
    </section>
  );
}

/* ───────── stat card ───────── */

function StatCard({
  value,
  suffix,
  label,
  icon: Icon,
}: (typeof STATS)[number]) {
  const { count, ref } = useCountUp(value);
  return (
    <div ref={ref} className="text-center group">
      <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-white/10 mb-4 group-hover:bg-white/20 transition-colors">
        <Icon className="w-7 h-7 text-primary" />
      </div>
      <div className="text-4xl md:text-5xl font-bold text-white mb-1">
        {count}
        <span className="text-primary">{suffix}</span>
      </div>
      <p className="text-white/70 text-sm">{label}</p>
    </div>
  );
}

/* ═══════════════════ MAIN PAGE ═══════════════════ */

export default function HomePage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white overflow-x-hidden">
      {/* ─── NAVBAR ─── */}
      <nav
        className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
          scrolled
            ? "bg-[#0a0a0a]/90 backdrop-blur-xl shadow-lg shadow-black/20 py-3"
            : "bg-transparent py-5"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between">
          {/* Logo */}
          <Link href="#home" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center group-hover:scale-110 transition-transform">
              <Music2 className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="text-lg font-bold tracking-tight">Bainsla</span>
              <span className="block text-[10px] font-semibold tracking-[0.25em] text-primary uppercase leading-none">
                Music
              </span>
            </div>
          </Link>

          {/* Desktop links */}
          <div className="hidden md:flex items-center gap-8">
            {NAV_LINKS.map((l) => (
              <a
                key={l.href}
                href={l.href}
                className="text-sm text-white/70 hover:text-primary transition-colors relative after:absolute after:bottom-[-4px] after:left-0 after:w-0 after:h-0.5 after:bg-primary after:transition-all hover:after:w-full"
              >
                {l.label}
              </a>
            ))}
            <Link
              href="/login"
              className="ml-2 px-5 py-2 text-sm font-medium rounded-full bg-gradient-to-r from-primary to-primary-dark text-white hover:shadow-lg hover:shadow-primary/25 transition-all hover:-translate-y-0.5"
            >
              Dashboard Login
            </Link>
          </div>

          {/* Mobile toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-white/70 hover:text-white"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-[#0a0a0a]/95 backdrop-blur-xl border-t border-white/10 mt-2">
            <div className="px-4 py-4 space-y-3">
              {NAV_LINKS.map((l) => (
                <a
                  key={l.href}
                  href={l.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="block text-sm text-white/70 hover:text-primary py-2"
                >
                  {l.label}
                </a>
              ))}
              <Link
                href="/login"
                className="block text-center px-5 py-2.5 text-sm font-medium rounded-full bg-gradient-to-r from-primary to-primary-dark text-white mt-2"
              >
                Dashboard Login
              </Link>
            </div>
          </div>
        )}
      </nav>

      {/* ─── HERO ─── */}
      <header
        id="home"
        className="relative min-h-screen flex items-center justify-center overflow-hidden"
      >
        {/* Animated background */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-[#0a0a0a] via-[#1a0a00] to-[#0a0a0a]" />
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-[120px] animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-orange-600/10 rounded-full blur-[100px] animate-pulse delay-1000" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] border border-white/[0.03] rounded-full" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] border border-white/[0.02] rounded-full" />
        </div>

        <div className="relative z-10 max-w-5xl mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/30 bg-primary/10 mb-8 animate-fadeIn">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            <span className="text-xs text-primary font-medium">
              Rajasthan&apos;s No.1 Music Production Company
            </span>
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold leading-tight mb-6 animate-fadeInUp">
            Best Music &amp; Video
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-amber-400 to-orange-500">
              Company in India
            </span>
          </h1>

          <p className="text-base sm:text-lg text-white/60 max-w-2xl mx-auto mb-10 animate-fadeInUp delay-200">
            &ldquo;Music can change the world&rdquo; — With 10,000+ songs and 1.5M+
            YouTube subscribers, Bainsla Music preserves the rich heritage of
            Rajasthani &apos;Rasiya&apos; songs, connecting the world through music since 2016.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fadeInUp delay-300">
            <a
              href="#services"
              className="group inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-gradient-to-r from-primary to-primary-dark text-white font-medium hover:shadow-xl hover:shadow-primary/25 transition-all hover:-translate-y-0.5"
            >
              Explore Services
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </a>
            <a
              href="https://www.youtube.com/@bainslaofficial"
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex items-center gap-2 px-8 py-3.5 rounded-full border border-white/20 text-white font-medium hover:bg-white/5 transition-all"
            >
              <Play className="w-4 h-4 text-red-500" />
              Watch on YouTube
            </a>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 rounded-full border-2 border-white/20 flex items-start justify-center p-1.5">
            <div className="w-1.5 h-3 bg-primary rounded-full animate-scrollDown" />
          </div>
        </div>
      </header>

      {/* ─── STATS ─── */}
      <Section className="relative py-20 bg-gradient-to-r from-[#111] via-[#1a1000] to-[#111]">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
            {STATS.map((s) => (
              <StatCard key={s.label} {...s} />
            ))}
          </div>
        </div>
      </Section>

      {/* ─── ABOUT ─── */}
      <Section id="about" className="py-20 md:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid md:grid-cols-2 gap-12 md:gap-16 items-center">
            {/* Left: visual */}
            <div className="relative">
              <div className="aspect-square rounded-3xl bg-gradient-to-br from-primary/20 to-orange-600/10 p-8 flex items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_40%,rgba(245,158,11,0.15),transparent_60%)]" />
                <div className="relative text-center space-y-6">
                  <div className="w-24 h-24 mx-auto rounded-full bg-gradient-to-br from-primary to-orange-600 flex items-center justify-center">
                    <Music2 className="w-12 h-12 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-white">Since 2015</h3>
                  <p className="text-white/50 text-sm max-w-xs mx-auto">
                    Rooted in Jaipur, Rajasthan — Preserving the cultural heritage of Rasiya music
                  </p>
                  <div className="flex justify-center gap-3">
                    {["Rasiya", "Folk", "DJ", "Devotional"].map((g) => (
                      <span
                        key={g}
                        className="px-3 py-1 rounded-full text-xs bg-white/10 text-white/70"
                      >
                        {g}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Right: text */}
            <div>
              <span className="text-primary text-sm font-semibold uppercase tracking-wider">
                About Us
              </span>
              <h2 className="text-3xl md:text-4xl font-bold mt-3 mb-6">
                Rajasthan&apos;s Premier
                <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-amber-400">
                  Music Production House
                </span>
              </h2>
              <p className="text-white/60 mb-6 leading-relaxed">
                <strong className="text-white">Bainsla Music</strong> is a
                distinguished music production company rooted in the vibrant
                culture of Rajasthan, India. Specializing in the traditional
                Rajasthani genre of &apos;Rasiya&apos; songs, our company has been
                dedicated to preserving and promoting the rich musical heritage of
                Rajasthan for the past 9 years.
              </p>
              <p className="text-white/60 mb-8 leading-relaxed">
                Located at 59A Chanchan Nagar, Gokulpura, Jhotwara, Jaipur-302012,
                under the visionary leadership of directors{" "}
                <strong className="text-white">Ajeet Bainsla</strong> and{" "}
                <strong className="text-white">Aman Bainsla</strong>, we strive to
                blend the old with the new, ensuring that the soulful melodies of
                Rasiya songs continue to thrive globally.
              </p>

              <div className="grid grid-cols-2 gap-4">
                {[
                  { num: "150+", desc: "Distribution Platforms" },
                  { num: "50+", desc: "Partner Channels" },
                  { num: "10M+", desc: "YouTube Views" },
                  { num: "24/7", desc: "Artist Support" },
                ].map((item) => (
                  <div
                    key={item.desc}
                    className="p-4 rounded-xl bg-white/5 border border-white/10"
                  >
                    <div className="text-xl font-bold text-primary">
                      {item.num}
                    </div>
                    <div className="text-xs text-white/50 mt-1">{item.desc}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </Section>

      {/* ─── SERVICES ─── */}
      <Section id="services" className="py-20 md:py-28 bg-[#0f0f0f]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-16">
            <span className="text-primary text-sm font-semibold uppercase tracking-wider">
              What We Do
            </span>
            <h2 className="text-3xl md:text-4xl font-bold mt-3">
              Our{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-amber-400">
                Services
              </span>
            </h2>
            <p className="text-white/50 mt-4 max-w-xl mx-auto">
              Complete music industry solutions — from production to distribution,
              promotion to monetization.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {SERVICES.map((s) => (
              <div
                key={s.title}
                className="group relative p-6 rounded-2xl bg-white/[0.03] border border-white/[0.06] hover:border-primary/30 transition-all duration-300 hover:-translate-y-1"
              >
                <div
                  className={`w-12 h-12 rounded-xl bg-gradient-to-br ${s.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}
                >
                  <s.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{s.title}</h3>
                <p className="text-sm text-white/50 leading-relaxed">
                  {s.description}
                </p>
                <div className="mt-4 inline-flex items-center text-primary text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                  Learn More <ArrowRight className="w-3.5 h-3.5 ml-1" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* ─── VIDEOS ─── */}
      <Section id="videos" className="py-20 md:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between mb-12">
            <div>
              <span className="text-primary text-sm font-semibold uppercase tracking-wider">
                Latest Releases
              </span>
              <h2 className="text-3xl md:text-4xl font-bold mt-3">
                Trending{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-amber-400">
                  Videos
                </span>
              </h2>
            </div>
            <a
              href="https://www.youtube.com/@bainslaofficial"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 sm:mt-0 inline-flex items-center gap-2 text-sm text-primary hover:underline"
            >
              View All on YouTube <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {VIDEOS.map((v) => (
              <a
                key={v.id}
                href={`https://www.youtube.com/watch?v=${v.id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="group rounded-2xl overflow-hidden bg-white/[0.03] border border-white/[0.06] hover:border-primary/30 transition-all duration-300"
              >
                <div className="relative aspect-video overflow-hidden">
                  <img
                    src={`https://img.youtube.com/vi/${v.id}/hqdefault.jpg`}
                    alt={v.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-black/30 group-hover:bg-black/10 transition-colors" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-14 h-14 rounded-full bg-red-600/90 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Play className="w-6 h-6 text-white ml-0.5" />
                    </div>
                  </div>
                  <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded bg-black/60 text-[10px] text-white/80">
                    {v.views}
                  </div>
                </div>
                <div className="p-4">
                  <h4 className="text-sm font-medium line-clamp-2 group-hover:text-primary transition-colors">
                    {v.title}
                  </h4>
                  <p className="text-xs text-white/40 mt-1">{v.artist}</p>
                </div>
              </a>
            ))}
          </div>
        </div>
      </Section>

      {/* ─── CHANNELS / ARTISTS ─── */}
      <Section id="artists" className="py-20 md:py-28 bg-[#0f0f0f]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-16">
            <span className="text-primary text-sm font-semibold uppercase tracking-wider">
              Our Network
            </span>
            <h2 className="text-3xl md:text-4xl font-bold mt-3">
              Partner{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-amber-400">
                Channels
              </span>
            </h2>
            <p className="text-white/50 mt-4 max-w-xl mx-auto">
              We manage and grow some of the biggest Rajasthani music channels on YouTube.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-6">
            {CHANNELS.map((ch) => (
              <a
                key={ch.handle}
                href={`https://www.youtube.com/@${ch.handle}`}
                target="_blank"
                rel="noopener noreferrer"
                className="group text-center p-6 rounded-2xl bg-white/[0.03] border border-white/[0.06] hover:border-primary/30 transition-all duration-300 hover:-translate-y-1"
              >
                <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-primary/30 to-orange-600/20 flex items-center justify-center mb-4 group-hover:from-primary/50 transition-all">
                  <YoutubeIcon className="w-8 h-8 text-red-500" />
                </div>
                <h4 className="font-semibold text-sm">{ch.name}</h4>
                <p className="text-xs text-primary mt-1">{ch.subscribers} Subscribers</p>
              </a>
            ))}
          </div>
        </div>
      </Section>

      {/* ─── DIRECTORS / TEAM ─── */}
      <Section className="py-20 md:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-16">
            <span className="text-primary text-sm font-semibold uppercase tracking-wider">
              Leadership
            </span>
            <h2 className="text-3xl md:text-4xl font-bold mt-3">
              Our{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-amber-400">
                Directors
              </span>
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {DIRECTORS.map((d) => (
              <div
                key={d.name}
                className="text-center p-8 rounded-2xl bg-white/[0.03] border border-white/[0.06] hover:border-primary/20 transition-all"
              >
                <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-primary to-orange-600 flex items-center justify-center text-white text-2xl font-bold mb-4">
                  {d.name.split(" ").map((n) => n[0]).join("")}
                </div>
                <h4 className="text-lg font-semibold">{d.name}</h4>
                <p className="text-primary text-sm mt-1">{d.role}</p>
                <p className="text-white/50 text-sm mt-3">{d.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* ─── DISTRIBUTION PLATFORMS ─── */}
      <Section className="py-16 bg-[#0f0f0f]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-10">
            <span className="text-primary text-sm font-semibold uppercase tracking-wider">
              Available On
            </span>
            <h2 className="text-2xl md:text-3xl font-bold mt-3">
              150+{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-amber-400">
                Platforms
              </span>
            </h2>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-4 md:gap-6">
            {PLATFORMS.map((p) => (
              <div
                key={p}
                className="px-6 py-3 rounded-full bg-white/[0.05] border border-white/[0.08] text-sm text-white/60 hover:text-primary hover:border-primary/30 transition-all"
              >
                {p}
              </div>
            ))}
          </div>
          <p className="text-center text-white/30 text-xs mt-6">
            ...and 140+ more digital music platforms worldwide
          </p>
        </div>
      </Section>

      {/* ─── PRESS / FEATURED IN ─── */}
      <Section className="py-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 text-center">
          <span className="text-primary text-sm font-semibold uppercase tracking-wider">
            Featured In
          </span>
          <div className="flex flex-wrap items-center justify-center gap-8 mt-8">
            {["Firstpost", "Republic Bharat", "Dainik Jagran", "Deezer", "Gaana", "JioSaavn"].map(
              (name) => (
                <div
                  key={name}
                  className="text-lg font-semibold text-white/20 hover:text-white/40 transition-colors"
                >
                  {name}
                </div>
              )
            )}
          </div>
        </div>
      </Section>

      {/* ─── TESTIMONIALS ─── */}
      <Section className="py-20 md:py-28 bg-[#0f0f0f]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-16">
            <span className="text-primary text-sm font-semibold uppercase tracking-wider">
              Testimonials
            </span>
            <h2 className="text-3xl md:text-4xl font-bold mt-3">
              What Our{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-amber-400">
                Artists Say
              </span>
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {TESTIMONIALS.map((t, i) => (
              <div
                key={i}
                className="p-6 rounded-2xl bg-white/[0.03] border border-white/[0.06] hover:border-primary/20 transition-all"
              >
                <div className="flex gap-1 mb-4">
                  {Array.from({ length: t.rating }).map((_, j) => (
                    <Star
                      key={j}
                      className="w-4 h-4 text-primary fill-primary"
                    />
                  ))}
                </div>
                <p className="text-sm text-white/60 leading-relaxed mb-6">
                  &ldquo;{t.text}&rdquo;
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-orange-600 flex items-center justify-center text-white font-bold text-sm">
                    {t.name[0]}
                  </div>
                  <div>
                    <div className="text-sm font-medium">{t.name}</div>
                    <div className="text-xs text-white/40">{t.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* ─── CTA ─── */}
      <Section className="py-20 md:py-28 bg-[#0f0f0f]">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <div className="relative p-12 md:p-16 rounded-3xl bg-gradient-to-br from-primary/20 via-orange-600/10 to-transparent border border-primary/20 overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-[80px]" />
            <div className="relative z-10">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Ready to Grow Your Music?
              </h2>
              <p className="text-white/60 mb-8 max-w-lg mx-auto">
                Join 50+ artists and channels who trust Bainsla Music for their
                music production, distribution and channel management needs.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a
                  href="#contact"
                  className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-full bg-gradient-to-r from-primary to-primary-dark text-white font-medium hover:shadow-xl hover:shadow-primary/25 transition-all hover:-translate-y-0.5"
                >
                  Get Started Today
                  <ArrowRight className="w-4 h-4" />
                </a>
                <a
                  href="tel:+918696761606"
                  className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-full border border-white/20 text-white font-medium hover:bg-white/5 transition-all"
                >
                  <Phone className="w-4 h-4" />
                  Call Now
                </a>
              </div>
            </div>
          </div>
        </div>
      </Section>

      {/* ─── CONTACT ─── */}
      <Section id="contact" className="py-20 md:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid md:grid-cols-2 gap-12 md:gap-16">
            {/* Info */}
            <div>
              <span className="text-primary text-sm font-semibold uppercase tracking-wider">
                Get In Touch
              </span>
              <h2 className="text-3xl md:text-4xl font-bold mt-3 mb-6">
                Contact{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-amber-400">
                  Us
                </span>
              </h2>
              <p className="text-white/60 mb-10">
                Have questions about our services? Want to distribute your music or
                manage your YouTube channel? Get in touch — we&apos;d love to hear
                from you.
              </p>

              <div className="space-y-6">
                {[
                  {
                    icon: Phone,
                    label: "Phone",
                    value: "+91-8696761606",
                    href: "tel:+918696761606",
                  },
                  {
                    icon: Mail,
                    label: "Email",
                    value: "ajeet@bainslamusic.com",
                    href: "mailto:ajeet@bainslamusic.com",
                  },
                  {
                    icon: MapPin,
                    label: "Address",
                    value:
                      "59A Chanchan Nagar, Gokulpura, Jhotwara, Jaipur-302012, Rajasthan",
                    href: "https://maps.google.com/?q=59A+Chanchan+Nagar+Gokulpura+Jhotwara+Jaipur",
                  },
                ].map((c) => (
                  <a
                    key={c.label}
                    href={c.href}
                    target={c.label === "Address" ? "_blank" : undefined}
                    rel={c.label === "Address" ? "noopener noreferrer" : undefined}
                    className="flex items-start gap-4 group"
                  >
                    <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0 group-hover:border-primary/30 transition-colors">
                      <c.icon className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <div className="text-xs text-white/40 mb-0.5">
                        {c.label}
                      </div>
                      <div className="text-sm text-white/80 group-hover:text-primary transition-colors">
                        {c.value}
                      </div>
                    </div>
                  </a>
                ))}
              </div>

              {/* Social */}
              <div className="mt-10">
                <p className="text-sm text-white/40 mb-3">Follow Us</p>
                <div className="flex gap-3">
                  <a
                    href="https://www.youtube.com/@bainslaofficial"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-11 h-11 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white/60 hover:text-primary hover:border-primary/30 transition-all"
                  >
                    <YoutubeIcon className="w-5 h-5" />
                  </a>
                  <a
                    href="https://www.instagram.com/bainslamusic"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-11 h-11 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white/60 hover:text-primary hover:border-primary/30 transition-all"
                  >
                    <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
                    </svg>
                  </a>
                </div>
              </div>
            </div>

            {/* Form */}
            <div className="p-8 rounded-2xl bg-white/[0.03] border border-white/[0.06]">
              <h3 className="text-xl font-semibold mb-6">Send us a Message</h3>
              <form
                className="space-y-5"
                onSubmit={(e) => {
                  e.preventDefault();
                  const data = new FormData(e.currentTarget);
                  const name = data.get("name");
                  const phone = data.get("phone");
                  const message = data.get("message");
                  window.open(
                    `https://wa.me/918696761606?text=${encodeURIComponent(
                      `Hi, I'm ${name}. ${message} (Phone: ${phone})`
                    )}`,
                    "_blank"
                  );
                }}
              >
                <div>
                  <label className="block text-sm text-white/60 mb-1.5">
                    Your Name
                  </label>
                  <input
                    name="name"
                    required
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-primary/50 transition-colors"
                    placeholder="Enter your name"
                  />
                </div>
                <div>
                  <label className="block text-sm text-white/60 mb-1.5">
                    Phone Number
                  </label>
                  <input
                    name="phone"
                    type="tel"
                    required
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-primary/50 transition-colors"
                    placeholder="+91 XXXXX XXXXX"
                  />
                </div>
                <div>
                  <label className="block text-sm text-white/60 mb-1.5">
                    Service Interested In
                  </label>
                  <select
                    name="service"
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-sm text-white/70 focus:outline-none focus:border-primary/50 transition-colors"
                  >
                    <option value="">Select a service</option>
                    <option value="cms">YouTube CMS/MCN</option>
                    <option value="promotion">Channel Promotion</option>
                    <option value="distribution">Music Distribution</option>
                    <option value="social">Social Media Management</option>
                    <option value="caller">Caller Tunes</option>
                    <option value="production">Music Production</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-white/60 mb-1.5">
                    Message
                  </label>
                  <textarea
                    name="message"
                    rows={4}
                    required
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-primary/50 transition-colors resize-none"
                    placeholder="Tell us about your requirements..."
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-3.5 rounded-xl bg-gradient-to-r from-primary to-primary-dark text-white font-medium hover:shadow-lg hover:shadow-primary/25 transition-all"
                >
                  Send via WhatsApp
                </button>
              </form>
            </div>
          </div>
        </div>
      </Section>

      {/* ─── FOOTER ─── */}
      <footer className="py-12 border-t border-white/[0.06] bg-[#050505]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
            {/* Brand */}
            <div>
              <div className="flex items-center gap-2.5 mb-4">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center">
                  <Music2 className="w-5 h-5 text-white" />
                </div>
                <div>
                  <span className="text-lg font-bold">Bainsla</span>
                  <span className="block text-[10px] font-semibold tracking-[0.25em] text-primary uppercase leading-none">
                    Music
                  </span>
                </div>
              </div>
              <p className="text-sm text-white/40 leading-relaxed">
                Stay connected for the latest updates, releases, and
                behind-the-scenes glimpses of our music production journey.
              </p>
            </div>

            {/* Company */}
            <div>
              <h4 className="font-semibold text-sm mb-4 text-white/80">
                Company
              </h4>
              <ul className="space-y-2.5">
                {["Home", "About Us", "Services", "Videos", "Contact"].map(
                  (l) => (
                    <li key={l}>
                      <a
                        href={`#${l.toLowerCase().replace(" ", "")}`}
                        className="text-sm text-white/40 hover:text-primary transition-colors"
                      >
                        {l}
                      </a>
                    </li>
                  )
                )}
              </ul>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="font-semibold text-sm mb-4 text-white/80">
                Quick Links
              </h4>
              <ul className="space-y-2.5">
                {[
                  "Privacy Policy",
                  "Terms & Conditions",
                  "Dashboard Login",
                ].map((l) => (
                  <li key={l}>
                    {l === "Dashboard Login" ? (
                      <Link
                        href="/login"
                        className="text-sm text-white/40 hover:text-primary transition-colors"
                      >
                        {l}
                      </Link>
                    ) : (
                      <a
                        href="#"
                        className="text-sm text-white/40 hover:text-primary transition-colors"
                      >
                        {l}
                      </a>
                    )}
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h4 className="font-semibold text-sm mb-4 text-white/80">
                Contact
              </h4>
              <ul className="space-y-3">
                <li className="flex items-center gap-2 text-sm text-white/40">
                  <Phone className="w-4 h-4 text-primary" />
                  +91-8696761606
                </li>
                <li className="flex items-center gap-2 text-sm text-white/40">
                  <Mail className="w-4 h-4 text-primary" />
                  ajeet@bainslamusic.com
                </li>
                <li className="flex items-start gap-2 text-sm text-white/40">
                  <MapPin className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                  Jaipur, Rajasthan, India
                </li>
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-white/[0.06] flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs text-white/30">
              &copy; {new Date().getFullYear()} Bainsla Music. All rights reserved.
            </p>
            <div className="flex items-center gap-4">
              {[
                {
                  label: "YouTube",
                  href: "https://www.youtube.com/@bainslaofficial",
                },
                {
                  label: "Instagram",
                  href: "https://www.instagram.com/bainslamusic",
                },
              ].map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-white/30 hover:text-primary transition-colors"
                >
                  {s.label}
                </a>
              ))}
            </div>
          </div>
        </div>
      </footer>

      {/* ─── WhatsApp Floating Button ─── */}
      <a
        href="https://wa.me/918696761606?text=Hi%2C%20I%20want%20to%20know%20about%20Bainsla%20Music%20services"
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-[#25D366] flex items-center justify-center shadow-lg shadow-[#25D366]/30 hover:scale-110 transition-transform"
        aria-label="Chat on WhatsApp"
      >
        <svg viewBox="0 0 24 24" fill="white" className="w-7 h-7">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
        </svg>
      </a>

      {/* ─── Global CSS animations ─── */}
      <style jsx global>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes scrollDown {
          0%, 100% { opacity: 1; transform: translateY(0); }
          50% { opacity: 0.3; transform: translateY(6px); }
        }
        .animate-fadeIn { animation: fadeIn 0.8s ease-out both; }
        .animate-fadeInUp { animation: fadeInUp 0.8s ease-out both; }
        .animate-scrollDown { animation: scrollDown 1.5s ease-in-out infinite; }
        .delay-200 { animation-delay: 200ms; }
        .delay-300 { animation-delay: 300ms; }
        .delay-1000 { animation-delay: 1000ms; }
        html { scroll-behavior: smooth; }
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </div>
  );
}
