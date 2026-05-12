"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

/* ───── Scroll-triggered animation hook ───── */
function useScrollReveal() {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setIsVisible(true); obs.unobserve(el); } },
      { threshold: 0.15 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return { ref, isVisible };
}
import {
  Play,
  Phone,
  Mail,
  MapPin,
  Menu,
  X,
  Music,
  Mic2,
  Send,
  Users,
  Shield,
  Globe,
  ArrowRight,
  Headphones,
} from "lucide-react";

/* ───── SVG Icons ───── */
function YoutubeIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
    </svg>
  );
}
function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
    </svg>
  );
}
function FacebookIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  );
}
function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}
function SpotifyIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z" />
    </svg>
  );
}
function MusicNote({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
    </svg>
  );
}

/* ───── Data — EXACT content from reference photos ───── */

const NAV_LINKS = [
  { label: "HOME", href: "#home" },
  { label: "ABOUT", href: "#about" },
  { label: "ARTISTS", href: "#artists" },
  { label: "RELEASES", href: "#releases" },
  { label: "VIDEOS", href: "#videos" },
  { label: "CATALOGUE", href: "#catalogue" },
  { label: "LICENSING", href: "#licensing" },
  { label: "CONTACT", href: "#contact" },
];

const HERO_SLIDES = [
  { id: 1, image: "/images/hero/krishna-hero.png" },
  { id: 2, image: "/images/songs/shyam-teri-bansi.jpg" },
  { id: 3, image: "/images/songs/radha-rani.jpg" },
  { id: 4, image: "/images/songs/hanuman-chalisa.jpg" },
];

const RELEASES = [
  { hindiTitle: "श्याम तेरी बंसी पागल कर जाती है", engTitle: "Shyam Teri Bansi Pagaal Kar Jaati Hai", artist: "Bhumika Sharma", label: "Bainsla Music", image: "/images/songs/shyam-teri-bansi.jpg", url: "https://www.youtube.com/watch?v=mu8M7Nk8ywU" },
  { hindiTitle: "राधा रानी मेरी है", engTitle: "Radha Rani Meri Hai", artist: "Rashmi Nishad", label: "Bainsla Music", image: "/images/songs/radha-rani.jpg", url: "https://www.youtube.com/watch?v=S7VZLHubP4c" },
  { hindiTitle: "हनुमान चालीसा", engTitle: "Hanuman Chalisa", artist: "Bainsla Music", label: "Bainsla Music", image: "/images/songs/hanuman-chalisa.jpg", url: "https://www.youtube.com/watch?v=3ELgvab96VQ" },
  { hindiTitle: "राम नाम की महिमा", engTitle: "Ram Naam Ki Mahima", artist: "DG Mawai", label: "Bainsla Music", image: "/images/songs/ram-naam.jpg", url: "https://www.youtube.com/watch?v=8XKjIjWs6Ak" },
  { hindiTitle: "गुर्जर रसिया", engTitle: "Gurjar Rasiya", artist: "Gurjar Rasiya", label: "Bainsla Music", image: "/images/songs/gurjar-rasiya.jpg", url: "https://www.youtube.com/watch?v=DFJYVn39dHE" },
  { hindiTitle: "डीजे रसिया 2024", engTitle: "DJ Rasiya 2024", artist: "DJ Rasiya 2024", label: "Bainsla Music", image: "/images/songs/dj-rasiya.jpg", url: "https://www.youtube.com/watch?v=GwQnIPL68y8" },
];

const ARTISTS = [
  { name: "Bhumika Sharma", role: "Singer", genre: "Devotional, Folk", image: "/images/artists/bhumika-sharma.jpg" },
  { name: "DG Mawai", role: "Singer", genre: "Rasiya, Folk", image: "/images/artists/dg-mawai.jpg" },
  { name: "Rashmi Nishad", role: "Singer", genre: "Devotional, Bhajan", image: "/images/artists/rashmi-nishad.jpg" },
  { name: "Ajeet Bainsla", role: "Producer", genre: "Music Producer", image: "/images/artists/ajeet-bainsla.jpg" },
];

const VIDEOS = [
  { hindiTitle: "श्याम तेरी बंसी", engTitle: "Shyam Teri Bansi Pagaal Kar Jaati Hai", category: "Krishna Bhajan", duration: "04:35", views: "1.2M", id: "mu8M7Nk8ywU", thumbnail: "/images/songs/shyam-teri-bansi.jpg" },
  { hindiTitle: "राधा रानी मेरी है", engTitle: "Radha Rani Meri Hai", category: "Radha Bhajan", duration: "04:12", views: "856K", id: "S7VZLHubP4c", thumbnail: "/images/songs/radha-rani.jpg" },
  { hindiTitle: "हनुमान चालीसा", engTitle: "Hanuman Chalisa", category: "Hanuman Bhajan", duration: "06:21", views: "2.4M", id: "3ELgvab96VQ", thumbnail: "/images/songs/hanuman-chalisa.jpg" },
  { hindiTitle: "गुरु चरणों में", engTitle: "Guru Charno Mein", category: "Guru Bhajan", duration: "05:08", views: "452K", id: "8XKjIjWs6Ak", thumbnail: "/images/songs/guru-charno.jpg" },
  { hindiTitle: "मेरे बांके बिहारी", engTitle: "Mere Banke Bihari", category: "Krishna Bhajan", duration: "04:50", views: "789K", id: "DFJYVn39dHE", thumbnail: "/images/songs/banke-bihari.jpg" },
  { hindiTitle: "जय श्री राम", engTitle: "Jai Shri Ram", category: "Ram Bhajan", duration: "03:58", views: "1.5M", id: "GwQnIPL68y8", thumbnail: "/images/songs/jai-shri-ram.jpg" },
];

const CATALOGUE_CATEGORIES = [
  { name: "Krishna Bhajan", hindi: "कृष्ण भजन", count: 128 },
  { name: "Radha Bhajan", hindi: "राधा भजन", count: 102 },
  { name: "Hanuman Bhajan", hindi: "हनुमान भजन", count: 96 },
  { name: "Ram Bhajan", hindi: "राम भजन", count: 88 },
  { name: "Shiv Bhajan", hindi: "शिव भजन", count: 74 },
  { name: "Gurjar Rasiya", hindi: "गुर्जर रसिया", count: 111 },
  { name: "DJ Rasiya", hindi: "डीजे रसिया", count: 67 },
  { name: "Folk Songs", hindi: "लोकगीत", count: 139 },
];

const QUICK_LINKS_CARDS = [
  { icon: Music, title: "MUSIC CATALOGUE", desc: "Explore our wide range of Devotional, Folk & Rasiya songs.", btn: "EXPLORE CATALOGUE", href: "#catalogue" },
  { icon: Play, title: "YOUTUBE VIDEOS", desc: "Watch our latest videos and subscribe to our official YouTube channel.", btn: "WATCH NOW", href: "https://www.youtube.com/@bainslaofficial" },
  { icon: Shield, title: "LICENSING / COPYRIGHT", desc: "For music licensing, copyright claims, YouTube CMS and other inquiries.", btn: "LEARN MORE", href: "#licensing" },
  { icon: Headphones, title: "DISTRIBUTION", desc: "We provide digital music distribution across all major platforms.", btn: "DISTRIBUTE NOW", href: "#contact" },
];

const PLATFORMS = [
  { name: "YouTube", icon: YoutubeIcon, color: "text-red-500" },
  { name: "Spotify", icon: SpotifyIcon, color: "text-green-500" },
  { name: "JioSaavn", color: "text-green-400" },
  { name: "Apple Music", color: "text-red-400" },
  { name: "Wynk Music", color: "text-blue-400" },
];

const DISTRIBUTION_PLATFORMS = [
  "Spotify", "Apple Music", "JioSaavn", "YouTube", "Amazon Music",
  "Wynk Music", "Hungama", "Resso", "Gaana",
];

const GENRE_MARQUEE = [
  "Krishna Bhajan", "Radha Bhajan", "Hanuman Bhajan", "Ram Bhajan",
  "Shiv Bhajan", "Gurjar Rasiya", "DJ Rasiya", "Folk Songs",
  "Devotional Music", "Bhakti Sangeet", "Rasiya Music", "Lok Geet",
];

/* ───── Section heading with decorative lines (exactly like reference) ───── */
function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-center gap-4 mb-10">
      <div className="flex items-center gap-1">
        <div className="w-8 h-[1px] bg-amber-700" />
        <div className="w-2 h-2 rounded-full bg-amber-500" />
        <div className="w-16 h-[1px] bg-gradient-to-r from-amber-500 to-amber-700" />
      </div>
      <h2 className="text-2xl md:text-3xl font-bold tracking-wider text-white">{children}</h2>
      <div className="flex items-center gap-1">
        <div className="w-16 h-[1px] bg-gradient-to-l from-amber-500 to-amber-700" />
        <div className="w-2 h-2 rounded-full bg-amber-500" />
        <div className="w-8 h-[1px] bg-amber-700" />
      </div>
    </div>
  );
}

/* ───── Scroll-triggered section wrapper ───── */
function ScrollSection({ children, className = "", direction = "up" }: { children: React.ReactNode; className?: string; direction?: "up" | "left" | "right" }) {
  const { ref, isVisible } = useScrollReveal();
  const transforms = {
    up: "translateY(60px)",
    left: "translateX(-60px)",
    right: "translateX(60px)",
  };
  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? "translate(0,0)" : transforms[direction],
        transition: "opacity 0.8s ease-out, transform 0.8s ease-out",
      }}
    >
      {children}
    </div>
  );
}

/* ───── Component ───── */
export default function HomePage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [scrolled, setScrolled] = useState(false);
  const [email, setEmail] = useState("");

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % HERO_SLIDES.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white overflow-x-hidden">

      {/* ═══════ NAVBAR ═══════ */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled
          ? "bg-[#0a0a0a]/95 backdrop-blur-xl shadow-lg shadow-black/20 border-b border-amber-500/10"
          : "bg-gradient-to-b from-black/90 to-transparent"
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 md:h-20">
            {/* Logo */}
            <Link href="#home" className="flex items-center gap-2 group">
              <MusicNote className="w-8 h-8 text-amber-500" />
              <div className="leading-tight">
                <span className="text-lg font-extrabold tracking-wider text-white">BAINSLA</span>
                <div className="flex items-center gap-1">
                  <span className="text-[10px] tracking-[0.2em] text-amber-500 font-semibold">MUSIC</span>
                  <span className="text-[8px] text-gray-500 tracking-wider">PRIVATE LIMITED</span>
                </div>
              </div>
            </Link>

            {/* Desktop Nav */}
            <div className="hidden lg:flex items-center gap-1">
              {NAV_LINKS.map((link, i) => (
                <Link
                  key={link.label}
                  href={link.href}
                  className={`text-[11px] tracking-[0.12em] px-3 py-2 font-semibold transition-all duration-300 ${
                    i === 0
                      ? "text-amber-500 border-b-2 border-amber-500"
                      : "text-gray-400 hover:text-amber-500 border-b-2 border-transparent hover:border-amber-500/50"
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </div>

            {/* Dashboard Button + Mobile Menu */}
            <div className="flex items-center gap-3">
              <a href="/admin/" className="hidden md:inline-flex items-center gap-2 px-4 py-2 bg-amber-500 text-black text-xs font-bold tracking-wider rounded-lg hover:bg-amber-600 transition-all">
                DASHBOARD
              </a>
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden w-10 h-10 flex items-center justify-center"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ height: 0, opacity: 1 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 1 }}
              className="lg:hidden bg-[#0a0a0a]/98 border-t border-amber-500/10 overflow-hidden"
            >
              <div className="px-4 py-3 space-y-1">
                {NAV_LINKS.map((link) => (
                  <Link key={link.label} href={link.href} onClick={() => setMobileMenuOpen(false)} className="block py-2.5 px-4 text-sm text-gray-300 hover:text-amber-500 transition-colors">
                    {link.label}
                  </Link>
                ))}
                <a href="/admin/" className="block py-2.5 px-4 text-sm font-bold text-amber-500 hover:text-amber-400 transition-colors">
                  DASHBOARD
                </a>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* ═══════ HERO SECTION — exactly like reference photo ═══════ */}
      <section id="home" className="relative min-h-screen overflow-hidden">
        {/* Background Slideshow */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide}
            initial={{ opacity: 1, scale: 1 }}
            animate={{ opacity: 1, scale: 1.05 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 6, ease: "linear" }}
            className="absolute inset-0"
          >
            <img src={HERO_SLIDES[currentSlide].image} alt="Bainsla Music" className="absolute inset-0 w-full h-full object-cover" />
          </motion.div>
        </AnimatePresence>

        {/* Dark overlay — stronger on left for text readability */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#0a0a0a] via-[#0a0a0a]/80 to-[#0a0a0a]/30 z-10" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-transparent to-[#0a0a0a]/20 z-10" />
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#0a0a0a] to-transparent z-10" />

        {/* Hero Content */}
        <div className="relative z-20 min-h-screen flex items-center pt-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
            <div className="max-w-xl">
              <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black leading-[0.9] tracking-tight mb-2">
                <span className="block text-white">BAINSLA</span>
              </h1>
              <p className="text-xl sm:text-2xl md:text-3xl font-bold text-white mb-4 tracking-wide">
                MUSIC PRIVATE LIMITED
              </p>
              <p className="text-amber-500 text-base sm:text-lg md:text-xl italic mb-4 font-medium">
                India&apos;s Devotional, Folk &amp; Rasiya Music Label
              </p>
              <p className="text-gray-400 text-sm md:text-base mb-8 leading-relaxed">
                Devotional Bhajans, Gurjar Rasiya, Folk Songs<br />and Digital Music Distribution.
              </p>

              <a
                href="https://www.youtube.com/@bainslaofficial"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2.5 px-6 py-3 border border-amber-500 text-amber-500 rounded-lg font-bold text-sm tracking-wider hover:bg-amber-500 hover:text-black transition-all duration-300 mb-8"
              >
                <Play className="w-4 h-4 fill-current" />
                LISTEN NOW
              </a>

              {/* Platform Icons */}
              <div className="flex items-center gap-6 flex-wrap">
                <div className="flex items-center gap-2 text-xs text-gray-300">
                  <YoutubeIcon className="w-5 h-5 text-red-500" />
                  <span>YouTube</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-300">
                  <SpotifyIcon className="w-5 h-5 text-green-500" />
                  <span>Spotify</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-300">
                  <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center text-[8px] font-bold text-white">J</div>
                  <span>JioSaavn</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-300">
                  <div className="w-5 h-5 rounded-full bg-red-500 flex items-center justify-center">
                    <Music className="w-3 h-3 text-white" />
                  </div>
                  <span>Apple Music</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-300">
                  <div className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center text-[8px] font-bold text-white">W</div>
                  <span>Wynk Music</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Slide indicator dots */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex gap-2">
          {HERO_SLIDES.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentSlide(i)}
              className={`w-3 h-3 rounded-full transition-all duration-500 ${
                i === currentSlide ? "bg-amber-500 scale-110" : "bg-gray-600 hover:bg-gray-400"
              }`}
            />
          ))}
        </div>
      </section>

      {/* ═══════ GENRE MARQUEE — scrolling genres below hero ═══════ */}
      <div className="bg-[#0a0a0a] border-y border-amber-500/10 py-4 overflow-hidden">
        <div className="flex animate-marquee whitespace-nowrap">
          {[...GENRE_MARQUEE, ...GENRE_MARQUEE].map((genre, i) => (
            <span key={i} className="inline-flex items-center mx-4 text-sm font-semibold tracking-wider">
              <span className="text-amber-500 mr-2">♪</span>
              <span className="text-gray-300">{genre}</span>
            </span>
          ))}
        </div>
      </div>

      {/* ═══════ LATEST RELEASES — 6 cards exactly like reference ═══════ */}
      <section id="releases" className="py-16 md:py-24 bg-[#0d0d0d]">
        <ScrollSection>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-10">
              <SectionHeading>LATEST RELEASES</SectionHeading>
              <a href="https://www.youtube.com/@bainslaofficial" target="_blank" rel="noopener noreferrer" className="hidden md:inline-flex items-center gap-2 px-4 py-2 border border-gray-700 text-sm text-gray-300 rounded hover:border-amber-500 hover:text-amber-500 transition-all">
                VIEW ALL
              </a>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
              {RELEASES.map((r, i) => (
                <a key={i} href={r.url} target="_blank" rel="noopener noreferrer" className="group">
                  <div className="relative overflow-hidden rounded-lg aspect-square mb-2">
                    <img src={r.image} alt={r.engTitle} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <Play className="w-10 h-10 text-white fill-white" />
                    </div>
                  </div>
                  <h3 className="text-sm font-bold text-amber-500 truncate">{r.hindiTitle}</h3>
                  <p className="text-xs text-gray-400 truncate">{r.engTitle}</p>
                  <p className="text-[10px] text-gray-600">{r.label}</p>
                </a>
              ))}
            </div>
          </div>
        </ScrollSection>
      </section>

      {/* ═══════ OUR ARTISTS — circular photos like reference ═══════ */}
      <section id="artists" className="py-16 md:py-24 bg-[#0a0a0a]">
        <ScrollSection direction="left">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-10">
            <SectionHeading>OUR ARTISTS</SectionHeading>
            <Link href="#artists" className="hidden md:inline-flex items-center gap-2 px-4 py-2 border border-gray-700 text-sm text-gray-300 rounded hover:border-amber-500 hover:text-amber-500 transition-all">
              VIEW ALL ARTISTS
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-8">
            {ARTISTS.map((a, i) => (
              <div key={i} className="text-center group">
                <div className="w-28 h-28 md:w-36 md:h-36 mx-auto rounded-full overflow-hidden mb-3 border-2 border-gray-700 group-hover:border-amber-500 transition-colors duration-500">
                  <img src={a.image} alt={a.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                </div>
                <h4 className="font-bold text-sm md:text-base text-white">{a.name}</h4>
                <p className="text-xs text-gray-500">{a.role}</p>
              </div>
            ))}
            {/* Join Our Team */}
            <div className="text-center group cursor-pointer">
              <div className="w-28 h-28 md:w-36 md:h-36 mx-auto rounded-full overflow-hidden mb-3 border-2 border-dashed border-gray-600 group-hover:border-amber-500 transition-colors flex items-center justify-center bg-gray-900/50">
                <Mic2 className="w-12 h-12 text-amber-500/40 group-hover:text-amber-500 transition-colors" />
              </div>
              <h4 className="font-bold text-sm md:text-base text-white">Join Our Team</h4>
              <p className="text-xs text-gray-500">Artist / Singer</p>
            </div>
          </div>
        </div>
        </ScrollSection>
      </section>

      {/* ═══════ QUICK LINKS — 4 cards exactly like reference ═══════ */}
      <section className="py-12 bg-[#0d0d0d]">
        <ScrollSection direction="right">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {QUICK_LINKS_CARDS.map((card, i) => (
                <div key={i} className="bg-[#111] border border-gray-800 rounded-xl p-5 hover:border-amber-500/30 transition-all group">
                  <card.icon className="w-8 h-8 text-amber-500 mb-3" />
                  <h3 className="font-extrabold text-xs tracking-wider text-amber-500 mb-2">{card.title}</h3>
                  <p className="text-xs text-gray-400 mb-4 leading-relaxed">{card.desc}</p>
                  <a href={card.href} className="inline-flex items-center gap-1 text-[11px] font-semibold border border-gray-700 px-4 py-2 rounded hover:border-amber-500 hover:text-amber-500 transition-all text-gray-300">
                    {card.btn}
                  </a>
                </div>
              ))}
            </div>
          </div>
        </ScrollSection>
      </section>

      {/* ═══════ LATEST VIDEOS — 3 or 6 cards with thumbnails ═══════ */}
      <section id="videos" className="py-16 md:py-24 bg-[#0a0a0a]">
        <ScrollSection>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-10">
            <SectionHeading>LATEST VIDEOS</SectionHeading>
            <a href="https://www.youtube.com/@bainslaofficial" target="_blank" rel="noopener noreferrer" className="hidden md:inline-flex items-center gap-2 px-4 py-2 border border-gray-700 text-sm text-gray-300 rounded hover:border-amber-500 hover:text-amber-500 transition-all">
              VIEW ALL
            </a>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {VIDEOS.slice(0, 3).map((v, i) => (
              <a key={i} href={`https://www.youtube.com/watch?v=${v.id}`} target="_blank" rel="noopener noreferrer" className="group">
                <div className="relative overflow-hidden rounded-xl aspect-video mb-3">
                  <img src={v.thumbnail} alt={v.engTitle} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  <div className="absolute inset-0 bg-black/30 group-hover:bg-black/50 transition-colors flex items-center justify-center">
                    <div className="w-14 h-14 rounded-full bg-amber-500/80 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Play className="w-6 h-6 text-black fill-black ml-1" />
                    </div>
                  </div>
                  <span className="absolute bottom-2 right-2 bg-black/80 text-xs px-2 py-0.5 rounded font-semibold">{v.duration}</span>
                  <span className="absolute bottom-2 left-2 bg-black/80 text-xs px-2 py-0.5 rounded">{v.views} views</span>
                </div>
                <h3 className="font-bold text-sm text-white group-hover:text-amber-500 transition-colors">{v.hindiTitle}</h3>
                <p className="text-xs text-gray-500 mt-0.5">{v.engTitle}</p>
                <p className="text-[11px] text-gray-600 mt-0.5">Bainsla Music</p>
              </a>
            ))}
          </div>

          {/* Additional videos row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
            {VIDEOS.slice(3).map((v, i) => (
              <a key={i} href={`https://www.youtube.com/watch?v=${v.id}`} target="_blank" rel="noopener noreferrer" className="group">
                <div className="relative overflow-hidden rounded-xl aspect-video mb-3">
                  <img src={v.thumbnail} alt={v.engTitle} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  <div className="absolute inset-0 bg-black/30 group-hover:bg-black/50 transition-colors flex items-center justify-center">
                    <div className="w-14 h-14 rounded-full bg-amber-500/80 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Play className="w-6 h-6 text-black fill-black ml-1" />
                    </div>
                  </div>
                  <span className="absolute bottom-2 right-2 bg-black/80 text-xs px-2 py-0.5 rounded font-semibold">{v.duration}</span>
                  <span className="absolute bottom-2 left-2 bg-black/80 text-xs px-2 py-0.5 rounded">{v.views} views</span>
                </div>
                <h3 className="font-bold text-sm text-white group-hover:text-amber-500 transition-colors">{v.hindiTitle}</h3>
                <p className="text-xs text-gray-500 mt-0.5">{v.engTitle}</p>
                <p className="text-[11px] text-gray-600 mt-0.5">Bainsla Music</p>
              </a>
            ))}
          </div>
        </div>
        </ScrollSection>
      </section>

      {/* ═══════ MUSIC CATALOGUE — 8 categories like admin reference ═══════ */}
      <section id="catalogue" className="py-16 md:py-24 bg-[#0d0d0d]">
        <ScrollSection direction="left">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeading>MUSIC CATALOGUE</SectionHeading>
          <p className="text-center text-gray-500 text-sm mb-10 -mt-4">Browse our extensive collection of 725+ songs across 8 categories</p>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {CATALOGUE_CATEGORIES.map((cat, i) => (
              <div key={i} className="bg-[#111] border border-gray-800 rounded-xl p-5 hover:border-amber-500/30 transition-all group cursor-pointer">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
                    <Music className="w-5 h-5 text-amber-500" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-white group-hover:text-amber-500 transition-colors">{cat.name}</h3>
                    <p className="text-[10px] text-gray-600">{cat.hindi}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-amber-500 font-bold text-lg">{cat.count}</span>
                  <span className="text-[10px] text-gray-500">Songs</span>
                </div>
              </div>
            ))}
          </div>
        </div>
        </ScrollSection>
      </section>

      {/* ═══════ ABOUT SECTION ═══════ */}
      <section id="about" className="py-16 md:py-24 bg-[#0a0a0a]">
        <ScrollSection direction="right">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <p className="text-amber-500 text-sm tracking-widest mb-2">ABOUT US</p>
              <h2 className="text-3xl md:text-4xl font-bold mb-6">About <span className="text-amber-500">Bainsla Music</span></h2>
              <p className="text-gray-400 leading-relaxed mb-4">
                <strong className="text-white">Bainsla Music Private Limited</strong> is India&apos;s leading Devotional, Folk &amp; Rasiya music label dedicated to preserving and promoting Indian cultural music.
              </p>
              <p className="text-gray-400 leading-relaxed mb-4">
                Under the visionary leadership of <strong className="text-white">Ajeet Bainsla</strong>, our company specializes in Devotional Bhajans, Gurjar Rasiya, Folk Songs and Digital Music Distribution across 150+ platforms worldwide.
              </p>
              <p className="text-gray-400 leading-relaxed mb-6">
                With 256+ songs, 42+ artists, and millions of views across platforms, we are committed to bringing the finest devotional and folk music to audiences globally.
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[
                  { n: "256+", l: "Total Songs" },
                  { n: "42+", l: "Artists" },
                  { n: "178+", l: "YouTube Videos" },
                  { n: "12.8M+", l: "Total Views" },
                ].map((s) => (
                  <div key={s.l} className="text-center p-3 bg-[#111] rounded-lg border border-gray-800">
                    <div className="text-xl md:text-2xl font-bold text-amber-500">{s.n}</div>
                    <div className="text-[10px] text-gray-500">{s.l}</div>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative">
              <div className="rounded-2xl overflow-hidden border border-gray-800">
                <img src="/images/hero/krishna-hero.png" alt="Bainsla Music" className="w-full h-auto" />
              </div>
              <div className="absolute -bottom-4 -right-4 bg-amber-500 text-black px-6 py-3 rounded-xl font-bold text-sm">
                Since 2016
              </div>
            </div>
          </div>
        </div>
        </ScrollSection>
      </section>

      {/* ═══════ LICENSING SECTION — 6 cards exactly like reference ═══════ */}
      <section id="licensing" className="py-16 md:py-24 bg-[#0d0d0d]">
        <ScrollSection>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <p className="text-amber-500 text-sm tracking-widest mb-2">LICENSING &amp; COPYRIGHT</p>
            <h2 className="text-3xl md:text-4xl font-bold">Music <span className="text-amber-500">Licensing</span></h2>
            <p className="text-gray-400 mt-3 max-w-2xl mx-auto text-sm">For music licensing, copyright claims, YouTube CMS and other business inquiries.</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { title: "Song Licensing", desc: "License our music for films, TV, events, web series and commercial use.", icon: Music },
              { title: "Copyright Claims", desc: "Submit or release YouTube copyright claims. Fast resolution for content creators.", icon: Shield },
              { title: "Cover Song Permission", desc: "Get permission to cover our songs on YouTube, Spotify and other platforms.", icon: Mic2 },
              { title: "Business Collaboration", desc: "Partner with us for music production, distribution and brand collaborations.", icon: Users },
              { title: "CMS / Distribution", desc: "YouTube CMS services and digital music distribution across 150+ platforms.", icon: Globe },
              { title: "Submit Your Song", desc: "Independent artist? Submit your song to be released under Bainsla Music.", icon: Send },
            ].map((item, i) => (
              <div key={i} className="bg-[#111] border border-gray-800 rounded-xl p-6 hover:border-amber-500/30 transition-all">
                <item.icon className="w-8 h-8 text-amber-500 mb-4" />
                <h3 className="font-bold text-base mb-2">{item.title}</h3>
                <p className="text-xs text-gray-400 leading-relaxed mb-4">{item.desc}</p>
                <a href="#contact" className="text-amber-500 text-xs font-semibold hover:underline inline-flex items-center gap-1">INQUIRE NOW <ArrowRight className="w-3 h-3" /></a>
              </div>
            ))}
          </div>
        </div>
        </ScrollSection>
      </section>

      {/* ═══════ DISTRIBUTION + LICENSING + STAY CONNECTED row ═══════ */}
      <section className="py-12 bg-[#0a0a0a] border-y border-gray-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8 items-start">
            {/* Licensing & Inquiries */}
            <div>
              <p className="text-amber-500 text-sm tracking-widest font-bold mb-2">LICENSING &amp; INQUIRIES</p>
              <p className="text-xs text-gray-400 mb-3">For music licensing, copyright, YouTube CMS claims and business inquiries.</p>
              <a href="#contact" className="inline-flex items-center gap-2 text-xs font-semibold border border-amber-500 text-amber-500 px-4 py-2 rounded hover:bg-amber-500 hover:text-black transition-all">
                SUBMIT INQUIRY
              </a>
            </div>
            {/* Distribution Partners */}
            <div>
              <p className="text-amber-500 text-sm tracking-widest font-bold mb-2">DISTRIBUTION PARTNERS</p>
              <div className="flex flex-wrap gap-2">
                {DISTRIBUTION_PLATFORMS.map((p) => (
                  <span key={p} className="text-[10px] text-gray-400 bg-gray-800/50 px-2 py-1 rounded">{p}</span>
                ))}
                <span className="text-[10px] text-amber-500 bg-gray-800/50 px-2 py-1 rounded font-bold">••• More</span>
              </div>
            </div>
            {/* Stay Connected */}
            <div>
              <p className="text-amber-500 text-sm tracking-widest font-bold mb-2">STAY CONNECTED</p>
              <p className="text-xs text-gray-400 mb-3">Subscribe to get the latest updates on new releases and exclusive content.</p>
              <div className="flex gap-2">
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Enter your email" className="flex-1 bg-gray-900 border border-gray-700 rounded px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-amber-500" />
                <button className="px-4 py-2 bg-amber-500 text-black text-sm font-semibold rounded hover:bg-amber-600 transition-colors">
                  SUBSCRIBE
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════ CONTACT SECTION ═══════ */}
      <section id="contact" className="py-16 md:py-24 bg-[#0d0d0d]">
        <ScrollSection direction="left">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <p className="text-amber-500 text-sm tracking-widest mb-2">GET IN TOUCH</p>
            <h2 className="text-3xl md:text-4xl font-bold">Contact <span className="text-amber-500">Us</span></h2>
          </div>
          <div className="grid md:grid-cols-2 gap-12">
            <div>
              <div className="space-y-6">
                {[
                  { icon: MapPin, label: "Address", value: "Bainsla Music Private Limited\nJaipur, Rajasthan, India" },
                  { icon: Phone, label: "Phone", value: "+91 72978 97628" },
                  { icon: Mail, label: "Email", value: "bainslamusiccompany@gmail.com" },
                ].map((c, i) => (
                  <div key={i} className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-amber-500/10 flex items-center justify-center flex-shrink-0">
                      <c.icon className="w-5 h-5 text-amber-500" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-white">{c.label}</p>
                      <p className="text-xs text-gray-400 whitespace-pre-line">{c.value}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-8">
                <p className="text-sm font-semibold mb-3">Follow Us</p>
                <div className="flex gap-3">
                  <a href="https://www.youtube.com/@bainslaofficial" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-red-600 flex items-center justify-center hover:scale-110 transition-transform"><YoutubeIcon className="w-5 h-5" /></a>
                  <a href="https://www.instagram.com/bainslamusic" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-gradient-to-tr from-purple-600 to-pink-500 flex items-center justify-center hover:scale-110 transition-transform"><InstagramIcon className="w-5 h-5" /></a>
                  <a href="https://facebook.com/bainslamusic" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center hover:scale-110 transition-transform"><FacebookIcon className="w-5 h-5" /></a>
                  <a href="https://wa.me/917297897628" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-green-600 flex items-center justify-center hover:scale-110 transition-transform"><WhatsAppIcon className="w-5 h-5" /></a>
                </div>
              </div>
            </div>
            <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); const data = new FormData(e.currentTarget); const msg = `Name: ${data.get("name")}\nPhone: ${data.get("phone")}\nType: ${data.get("type")}\nMessage: ${data.get("message")}`; window.open(`https://wa.me/917297897628?text=${encodeURIComponent(msg)}`); }}>
              <div className="grid sm:grid-cols-2 gap-4">
                <input name="name" placeholder="Your Name" required className="w-full bg-[#111] border border-gray-800 rounded-lg px-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-amber-500" />
                <input name="phone" type="tel" placeholder="Phone Number" required className="w-full bg-[#111] border border-gray-800 rounded-lg px-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-amber-500" />
              </div>
              <select name="type" required className="w-full bg-[#111] border border-gray-800 rounded-lg px-4 py-3 text-sm text-gray-400 focus:outline-none focus:border-amber-500">
                <option value="">Select Inquiry Type</option>
                <option value="Music Licensing">Music Licensing</option>
                <option value="Copyright Claim">Copyright Claim Release</option>
                <option value="Artist Collaboration">Artist Collaboration</option>
                <option value="Distribution">Distribution Inquiry</option>
                <option value="YouTube CMS">YouTube CMS Inquiry</option>
                <option value="Cover Permission">Cover Song Permission</option>
                <option value="Submit Song">Submit Your Song</option>
                <option value="General">General Contact</option>
              </select>
              <input name="email" type="email" placeholder="Email Address" className="w-full bg-[#111] border border-gray-800 rounded-lg px-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-amber-500" />
              <textarea name="message" rows={4} placeholder="Your Message" required className="w-full bg-[#111] border border-gray-800 rounded-lg px-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-amber-500 resize-none" />
              <button type="submit" className="w-full bg-amber-500 text-black font-bold py-3 rounded-lg hover:bg-amber-600 transition-colors text-sm tracking-wider">
                SEND MESSAGE VIA WHATSAPP
              </button>
            </form>
          </div>
        </div>
        </ScrollSection>
      </section>

      {/* ═══════ FOOTER — exactly like reference photo ═══════ */}
      <footer className="bg-[#050505] border-t border-gray-800/50 pt-16 pb-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-12">
            {/* Logo */}
            <div className="col-span-2 md:col-span-1">
              <div className="flex items-center gap-2 mb-4">
                <MusicNote className="w-8 h-8 text-amber-500" />
                <div className="leading-tight">
                  <span className="text-lg font-bold text-white">BAINSLA</span>
                  <div className="flex items-center gap-1">
                    <span className="text-[10px] tracking-[0.2em] text-amber-500">MUSIC</span>
                    <span className="text-[8px] text-gray-500 tracking-wider">PRIVATE LIMITED</span>
                  </div>
                </div>
              </div>
              <p className="text-xs text-gray-500 leading-relaxed">
                Bainsla Music Private Limited is India&apos;s leading Devotional, Folk &amp; Rasiya music label dedicated to preserving and promoting Indian cultural music.
              </p>
            </div>

            {/* Quick Links Col 1 */}
            <div>
              <h4 className="text-amber-500 font-bold text-sm tracking-wider mb-4">QUICK LINKS</h4>
              <ul className="space-y-2">
                {["Home", "About Us", "Artists", "Releases"].map((l) => (
                  <li key={l}><Link href={`#${l.toLowerCase().replace(" ", "")}`} className="text-xs text-gray-400 hover:text-amber-500 transition-colors">{l}</Link></li>
                ))}
              </ul>
            </div>

            {/* Quick Links Col 2 */}
            <div>
              <h4 className="text-amber-500 font-bold text-sm tracking-wider mb-4">&nbsp;</h4>
              <ul className="space-y-2">
                {["Videos", "Catalogue", "Licensing", "Distribution", "Contact"].map((l) => (
                  <li key={l}><Link href={`#${l.toLowerCase()}`} className="text-xs text-gray-400 hover:text-amber-500 transition-colors">{l}</Link></li>
                ))}
              </ul>
            </div>

            {/* Contact Us */}
            <div>
              <h4 className="text-amber-500 font-bold text-sm tracking-wider mb-4">CONTACT US</h4>
              <ul className="space-y-3">
                <li className="flex items-start gap-2 text-xs text-gray-400">
                  <MapPin className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                  Bainsla Music Private Limited<br />Jaipur, Rajasthan, India
                </li>
                <li className="flex items-center gap-2 text-xs text-gray-400">
                  <Phone className="w-4 h-4 text-amber-500 flex-shrink-0" />
                  +91 72978 97628
                </li>
                <li className="flex items-center gap-2 text-xs text-gray-400">
                  <Mail className="w-4 h-4 text-amber-500 flex-shrink-0" />
                  bainslamusiccompany@gmail.com
                </li>
              </ul>
            </div>

            {/* Follow Us */}
            <div>
              <h4 className="text-amber-500 font-bold text-sm tracking-wider mb-4">FOLLOW US</h4>
              <div className="flex gap-2">
                <a href="https://www.youtube.com/@bainslaofficial" target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-full bg-red-600 flex items-center justify-center hover:scale-110 transition-transform"><YoutubeIcon className="w-4 h-4" /></a>
                <a href="https://www.instagram.com/bainslamusic" target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-full bg-gradient-to-tr from-purple-600 to-pink-500 flex items-center justify-center hover:scale-110 transition-transform"><InstagramIcon className="w-4 h-4" /></a>
                <a href="https://facebook.com/bainslamusic" target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-full bg-blue-600 flex items-center justify-center hover:scale-110 transition-transform"><FacebookIcon className="w-4 h-4" /></a>
                <a href="https://wa.me/917297897628" target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-full bg-green-600 flex items-center justify-center hover:scale-110 transition-transform"><WhatsAppIcon className="w-4 h-4" /></a>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-6 text-center">
            <p className="text-xs text-gray-600">&copy; 2024 Bainsla Music Private Limited. All Rights Reserved.</p>
          </div>
        </div>
      </footer>

      {/* ═══════ SOCIAL ICONS — fixed bottom-left ═══════ */}
      <div className="fixed bottom-6 left-6 z-50 flex flex-col gap-2">
        <a href="https://www.youtube.com/@bainslaofficial" target="_blank" rel="noopener noreferrer" className="w-11 h-11 rounded-full bg-red-600 flex items-center justify-center shadow-lg hover:scale-110 transition-transform" aria-label="YouTube"><YoutubeIcon className="w-5 h-5 text-white" /></a>
        <a href="https://www.instagram.com/bainslamusic" target="_blank" rel="noopener noreferrer" className="w-11 h-11 rounded-full bg-gradient-to-tr from-purple-600 to-pink-500 flex items-center justify-center shadow-lg hover:scale-110 transition-transform" aria-label="Instagram"><InstagramIcon className="w-5 h-5 text-white" /></a>
        <a href="https://facebook.com/bainslamusic" target="_blank" rel="noopener noreferrer" className="w-11 h-11 rounded-full bg-blue-600 flex items-center justify-center shadow-lg hover:scale-110 transition-transform" aria-label="Facebook"><FacebookIcon className="w-5 h-5 text-white" /></a>
      </div>

      {/* ═══════ WHATSAPP FAB — fixed bottom-right ═══════ */}
      <a href="https://wa.me/917297897628?text=Hi%2C%20I%20want%20to%20know%20about%20your%20services" target="_blank" rel="noopener noreferrer" className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-green-500 rounded-full flex items-center justify-center shadow-lg shadow-green-500/30 hover:scale-110 transition-transform" aria-label="Chat on WhatsApp">
        <WhatsAppIcon className="w-7 h-7 text-white" />
      </a>
    </div>
  );
}
