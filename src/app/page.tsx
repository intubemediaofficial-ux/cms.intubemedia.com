"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Play,
  ChevronRight,
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
  Award,
  Eye,
  Clock,
  ArrowRight,
  Heart,
  Volume2,
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
function JioSaavnIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" strokeWidth="2" />
      <text x="12" y="16" textAnchor="middle" fontSize="10" fill="currentColor" fontWeight="bold">J</text>
    </svg>
  );
}
function AppleMusicIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M23.994 6.124a9.23 9.23 0 00-.24-2.19c-.317-1.31-1.062-2.31-2.18-3.043a5.022 5.022 0 00-1.877-.726 10.496 10.496 0 00-1.564-.15c-.04-.003-.083-.01-.124-.013H5.986c-.152.01-.303.017-.455.026-.747.043-1.49.123-2.193.4-1.336.53-2.3 1.452-2.865 2.78-.192.448-.292.925-.363 1.408-.056.392-.088.785-.1 1.18 0 .032-.007.062-.01.093v12.223c.01.14.017.283.027.424.05.815.154 1.624.497 2.373.65 1.42 1.738 2.353 3.234 2.801.42.127.856.187 1.293.228.555.053 1.11.06 1.667.06h11.03c.525 0 1.048-.034 1.57-.1.823-.107 1.597-.35 2.296-.81a5.046 5.046 0 001.88-2.207c.186-.42.293-.87.37-1.324.113-.675.138-1.358.137-2.04-.002-3.8 0-7.595-.003-11.393zm-6.423 3.99v5.712c0 .417-.058.827-.244 1.206-.29.59-.76.962-1.388 1.14-.35.1-.706.157-1.07.173-.95.042-1.8-.6-1.965-1.483-.18-.965.46-1.97 1.442-2.17.293-.06.59-.11.886-.16.39-.066.674-.272.795-.66.04-.13.06-.27.06-.406V9.873c0-.34-.14-.523-.48-.56-.478-.05-.958-.09-1.436-.14-.7-.074-1.4-.15-2.1-.226-.266-.03-.376.07-.376.34v6.17c0 .39-.05.77-.214 1.126-.283.612-.762 1.003-1.406 1.188-.34.098-.69.154-1.04.172-.97.046-1.846-.577-2.02-1.49-.185-.97.43-1.99 1.395-2.2.29-.063.587-.11.88-.16.4-.068.684-.28.803-.68.036-.12.053-.25.053-.38V7.03c0-.39.143-.603.527-.657.455-.065.91-.125 1.366-.187l2.452-.332 1.727-.234c.26-.035.52-.067.78-.1.296-.038.464.1.465.4.003 1.396.002 2.794.002 4.192z" />
    </svg>
  );
}
function WynkIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" strokeWidth="2" />
      <text x="12" y="16" textAnchor="middle" fontSize="9" fill="currentColor" fontWeight="bold">W</text>
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

/* ───── Data Constants ───── */
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
  { id: 1, image: "https://img.youtube.com/vi/mu8M7Nk8ywU/maxresdefault.jpg" },
  { id: 2, image: "https://img.youtube.com/vi/S7VZLHubP4c/maxresdefault.jpg" },
  { id: 3, image: "https://img.youtube.com/vi/3ELgvab96VQ/maxresdefault.jpg" },
  { id: 4, image: "https://img.youtube.com/vi/8XKjIjWs6Ak/maxresdefault.jpg" },
];

const RELEASES = [
  { title: "श्याम तेरी बंसी पागल कर जाती है", subtitle: "Shyam Teri Bansi Pagaal Kar Jaati Hai", artist: "Bainsla Music", image: "https://img.youtube.com/vi/mu8M7Nk8ywU/hqdefault.jpg", url: "https://www.youtube.com/watch?v=mu8M7Nk8ywU" },
  { title: "राधा रानी मेरी है", subtitle: "Radha Rani Meri Hai", artist: "Bainsla Music", image: "https://img.youtube.com/vi/S7VZLHubP4c/hqdefault.jpg", url: "https://www.youtube.com/watch?v=S7VZLHubP4c" },
  { title: "हनुमान चालीसा", subtitle: "Hanuman Chalisa", artist: "Bainsla Music", image: "https://img.youtube.com/vi/3ELgvab96VQ/hqdefault.jpg", url: "https://www.youtube.com/watch?v=3ELgvab96VQ" },
  { title: "राम नाम की महिमा", subtitle: "Ram Naam Ki Mahima", artist: "Bainsla Music", image: "https://img.youtube.com/vi/8XKjIjWs6Ak/hqdefault.jpg", url: "https://www.youtube.com/watch?v=8XKjIjWs6Ak" },
  { title: "गुर्जर रसिया", subtitle: "Gurjar Rasiya", artist: "Bainsla Music", image: "https://img.youtube.com/vi/DFJYVn39dHE/hqdefault.jpg", url: "https://www.youtube.com/watch?v=DFJYVn39dHE" },
  { title: "डीजे रसिया 2024", subtitle: "DJ Rasiya 2024", artist: "Bainsla Music", image: "https://img.youtube.com/vi/GwQnIPL68y8/hqdefault.jpg", url: "https://www.youtube.com/watch?v=GwQnIPL68y8" },
];

const ARTISTS = [
  { name: "Bhumika Sharma", role: "Singer", genre: "Devotional, Folk", image: "https://img.youtube.com/vi/mu8M7Nk8ywU/hqdefault.jpg" },
  { name: "DG Mawai", role: "Singer", genre: "Rasiya, Folk", image: "https://img.youtube.com/vi/S7VZLHubP4c/hqdefault.jpg" },
  { name: "Rashmi Nishad", role: "Singer", genre: "Devotional, Bhajan", image: "https://img.youtube.com/vi/3ELgvab96VQ/hqdefault.jpg" },
  { name: "Ajeet Bainsla", role: "Producer", genre: "Music Producer", image: "https://img.youtube.com/vi/8XKjIjWs6Ak/hqdefault.jpg" },
];

const VIDEOS = [
  { title: "श्याम तेरी बंसी", subtitle: "Shyam Teri Bansi Pagaal Kar Jaati Hai", duration: "4:35", views: "1.2M", id: "mu8M7Nk8ywU" },
  { title: "राधा रानी मेरी है", subtitle: "Radha Rani Meri Hai", duration: "4:12", views: "856K", id: "S7VZLHubP4c" },
  { title: "हनुमान चालीसा", subtitle: "Hanuman Chalisa", duration: "6:21", views: "2.4M", id: "3ELgvab96VQ" },
];

const CATALOGUE_CATEGORIES = [
  { name: "Krishna Bhajan", hindi: "कृष्ण भजन", count: 128, icon: "🙏" },
  { name: "Radha Bhajan", hindi: "राधा भजन", count: 102, icon: "💐" },
  { name: "Hanuman Bhajan", hindi: "हनुमान भजन", count: 96, icon: "🙏" },
  { name: "Ram Bhajan", hindi: "राम भजन", count: 88, icon: "🙏" },
  { name: "Shiv Bhajan", hindi: "शिव भजन", count: 74, icon: "🙏" },
  { name: "Gurjar Rasiya", hindi: "गुर्जर रसिया", count: 111, icon: "🎵" },
  { name: "DJ Rasiya", hindi: "डीजे रसिया", count: 67, icon: "🎧" },
  { name: "Folk Songs", hindi: "लोकगीत", count: 139, icon: "🎶" },
];

const QUICK_LINKS_CARDS = [
  { icon: Music, title: "MUSIC CATALOGUE", desc: "Explore our wide range of Devotional, Folk & Rasiya songs.", btn: "EXPLORE CATALOGUE", href: "#catalogue" },
  { icon: Play, title: "YOUTUBE VIDEOS", desc: "Watch our latest videos and subscribe to our official YouTube channel.", btn: "WATCH NOW", href: "https://www.youtube.com/@bainslaofficial" },
  { icon: Shield, title: "LICENSING / COPYRIGHT", desc: "For music licensing, copyright claims, YouTube CMS and other inquiries.", btn: "LEARN MORE", href: "#licensing" },
  { icon: Globe, title: "DISTRIBUTION", desc: "We provide digital music distribution across all major platforms.", btn: "DISTRIBUTE NOW", href: "#contact" },
];

const PLATFORMS = [
  { name: "YouTube", icon: YoutubeIcon, color: "text-red-500" },
  { name: "Spotify", icon: SpotifyIcon, color: "text-green-500" },
  { name: "JioSaavn", icon: JioSaavnIcon, color: "text-green-400" },
  { name: "Apple Music", icon: AppleMusicIcon, color: "text-red-400" },
  { name: "Wynk Music", icon: WynkIcon, color: "text-blue-400" },
];

const DISTRIBUTION_PLATFORMS = [
  "Spotify", "Apple Music", "JioSaavn", "YouTube Music", "Amazon Music",
  "Wynk Music", "Hungama", "Resso", "Gaana", "Tidal",
  "Deezer", "Shazam",
];

const GENRES = [
  "Devotional", "Krishna Bhajan", "Radha Rani Bhajan", "Hanuman Bhajan",
  "Ram Bhajan", "Shiv Bhajan", "Gurjar Rasiya", "DJ Rasiya",
  "Folk Music", "Rajasthani Folk", "Bhakti Sangeet", "Naam Jap",
  "Live Bhajan", "Aarti", "Chalisa", "Stuti",
];

/* ───── Component ───── */
export default function HomePage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [scrolled, setScrolled] = useState(false);
  const [email, setEmail] = useState("");
  const [activeNav, setActiveNav] = useState("HOME");

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
    <div className="min-h-screen bg-[#060606] text-white overflow-x-hidden">

      {/* ───── NAVBAR ───── */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled
          ? "bg-[#060606]/95 backdrop-blur-xl shadow-[0_4px_30px_rgba(245,158,11,0.08)] border-b border-amber-500/10"
          : "bg-gradient-to-b from-black/80 to-transparent"
      }`}>
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 md:h-20">
            <Link href="#home" className="flex items-center gap-2.5 group">
              <div className="relative">
                <MusicNote className="w-9 h-9 text-amber-500 group-hover:text-amber-400 transition-colors" />
                <div className="absolute inset-0 bg-amber-500/20 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <div className="leading-tight">
                <span className="text-xl font-extrabold tracking-wider text-white">BAINSLA</span>
                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] tracking-[0.25em] text-amber-500 font-semibold">MUSIC</span>
                  <span className="text-[8px] text-gray-500 tracking-[0.15em] font-medium">PRIVATE LIMITED</span>
                </div>
              </div>
            </Link>

            <div className="hidden xl:flex items-center gap-1">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  className={`relative text-[11px] tracking-[0.15em] px-3 py-2 rounded-lg transition-all duration-300 font-semibold ${
                    activeNav === link.label
                      ? "text-amber-500"
                      : "text-gray-400 hover:text-white hover:bg-white/5"
                  }`}
                  onClick={() => setActiveNav(link.label)}
                >
                  {link.label}
                  {activeNav === link.label && (
                    <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-0.5 bg-amber-500 rounded-full" />
                  )}
                </Link>
              ))}
            </div>

            <div className="flex items-center gap-3">
              <div className="hidden md:flex items-center gap-2">
                {[
                  { href: "https://www.youtube.com/@bainslaofficial", icon: YoutubeIcon, bg: "bg-red-600/90 hover:bg-red-600" },
                  { href: "https://www.instagram.com/bainslamusic", icon: InstagramIcon, bg: "bg-gradient-to-tr from-purple-600 to-pink-500 hover:from-purple-500 hover:to-pink-400" },
                  { href: "https://facebook.com/bainslamusic", icon: FacebookIcon, bg: "bg-blue-600/90 hover:bg-blue-600" },
                  { href: "https://wa.me/917297897628", icon: WhatsAppIcon, bg: "bg-green-600/90 hover:bg-green-600" },
                ].map((s) => (
                  <a key={s.href} href={s.href} target="_blank" rel="noopener noreferrer" className={`w-8 h-8 rounded-full ${s.bg} flex items-center justify-center hover:scale-110 transition-all duration-300 shadow-lg`}>
                    <s.icon className="w-3.5 h-3.5" />
                  </a>
                ))}
              </div>
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="xl:hidden w-10 h-10 flex items-center justify-center rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ height: 0, opacity: 1 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 1 }}
              className="xl:hidden bg-[#060606]/98 border-t border-amber-500/10 overflow-hidden"
            >
              <div className="px-4 py-4 space-y-1">
                {NAV_LINKS.map((link) => (
                  <Link
                    key={link.label}
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3 py-3 px-4 text-sm text-gray-300 hover:text-amber-500 hover:bg-amber-500/5 rounded-lg transition-all"
                  >
                    <ChevronRight className="w-4 h-4 text-amber-500/50" />
                    {link.label}
                  </Link>
                ))}
                <div className="flex items-center gap-3 pt-4 px-4">
                  {[
                    { href: "https://www.youtube.com/@bainslaofficial", icon: YoutubeIcon, bg: "bg-red-600" },
                    { href: "https://www.instagram.com/bainslamusic", icon: InstagramIcon, bg: "bg-gradient-to-tr from-purple-600 to-pink-500" },
                    { href: "https://facebook.com/bainslamusic", icon: FacebookIcon, bg: "bg-blue-600" },
                    { href: "https://wa.me/917297897628", icon: WhatsAppIcon, bg: "bg-green-600" },
                  ].map((s) => (
                    <a key={s.href} href={s.href} target="_blank" rel="noopener noreferrer" className={`w-9 h-9 rounded-full ${s.bg} flex items-center justify-center`}>
                      <s.icon className="w-4 h-4" />
                    </a>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* ───── HERO SECTION ───── */}
      <section id="home" className="relative min-h-screen overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide}
            initial={{ opacity: 1, scale: 1 }}
            animate={{ opacity: 1, scale: 1.05 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 6, ease: "linear" }}
            className="absolute inset-0"
          >
            <img
              src={HERO_SLIDES[currentSlide].image}
              alt="Bainsla Music"
              className="absolute inset-0 w-full h-full object-cover"
            />
          </motion.div>
        </AnimatePresence>

        {/* Overlays */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#060606] via-[#060606]/85 to-[#060606]/40 z-10" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#060606] via-transparent to-[#060606]/30 z-10" />
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#060606] to-transparent z-10" />

        <div className="relative z-20 min-h-screen flex items-center pt-20">
          <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 w-full">
            <div className="max-w-2xl">
              <motion.div
                initial={{ opacity: 1, y: 0 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6"
              >
                <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-amber-500/10 border border-amber-500/20 rounded-full mb-6">
                  <Volume2 className="w-3.5 h-3.5 text-amber-500" />
                  <span className="text-[11px] text-amber-500 font-semibold tracking-wider">NOW STREAMING ON ALL PLATFORMS</span>
                </div>
              </motion.div>

              <motion.h1
                initial={{ opacity: 1, y: 0 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black leading-[0.9] tracking-tight mb-3"
              >
                <span className="block bg-gradient-to-r from-white via-white to-gray-400 bg-clip-text text-transparent">BAINSLA</span>
              </motion.h1>
              <motion.p
                initial={{ opacity: 1, y: 0 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-200 mb-4 tracking-wide"
              >
                MUSIC PRIVATE LIMITED
              </motion.p>
              <motion.p
                initial={{ opacity: 1, y: 0 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-amber-500 text-base sm:text-lg md:text-xl italic mb-4 font-medium"
              >
                India&apos;s Devotional, Folk &amp; Rasiya Music Label
              </motion.p>
              <motion.p
                initial={{ opacity: 1 }}
                animate={{ opacity: 1 }}
                className="text-gray-400 text-sm md:text-base mb-8 max-w-lg leading-relaxed"
              >
                Devotional Bhajans, Gurjar Rasiya, Folk Songs<br />and Digital Music Distribution.
              </motion.p>

              <motion.div
                initial={{ opacity: 1, y: 0 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-wrap gap-4 mb-10"
              >
                <a
                  href="https://www.youtube.com/@bainslaofficial"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group inline-flex items-center gap-2.5 px-7 py-3.5 bg-amber-500 text-black rounded-xl font-bold text-sm tracking-wider hover:bg-amber-400 transition-all duration-300 shadow-lg shadow-amber-500/25"
                >
                  <Play className="w-4 h-4 fill-black" />
                  LISTEN NOW
                </a>
                <a
                  href="#releases"
                  className="inline-flex items-center gap-2.5 px-7 py-3.5 bg-white/5 border border-white/15 rounded-xl text-sm font-bold tracking-wider hover:bg-white/10 hover:border-amber-500/30 transition-all duration-300"
                >
                  VIEW RELEASES
                  <ArrowRight className="w-4 h-4" />
                </a>
              </motion.div>

              <div className="flex items-center gap-5 flex-wrap">
                {PLATFORMS.map((p) => (
                  <div key={p.name} className="flex items-center gap-2 text-xs text-gray-400 hover:text-white transition-colors cursor-pointer">
                    <p.icon className={`w-5 h-5 ${p.color}`} />
                    <span className="font-medium">{p.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Slide dots */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-20 flex gap-2.5">
          {HERO_SLIDES.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentSlide(i)}
              className={`transition-all duration-500 rounded-full ${
                i === currentSlide
                  ? "w-8 h-2.5 bg-amber-500"
                  : "w-2.5 h-2.5 bg-white/25 hover:bg-white/40"
              }`}
            />
          ))}
        </div>
      </section>

      {/* ───── GENRE MARQUEE ───── */}
      <div className="relative py-4 bg-[#0a0a0a] border-y border-amber-500/10 overflow-hidden">
        <div className="flex animate-[marquee_30s_linear_infinite] whitespace-nowrap">
          {[...GENRES, ...GENRES].map((g, i) => (
            <span key={i} className="inline-flex items-center gap-2 mx-4 text-xs font-semibold tracking-wider text-gray-500">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500/50" />
              {g.toUpperCase()}
            </span>
          ))}
        </div>
      </div>

      {/* ───── LATEST RELEASES ───── */}
      <section id="releases" className="py-20 md:py-28 bg-[#060606]">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-12">
            <div className="flex items-center gap-4">
              <div className="w-1 h-8 bg-gradient-to-b from-amber-500 to-amber-700 rounded-full" />
              <div>
                <p className="text-amber-500 text-[11px] tracking-[0.3em] font-semibold mb-1">OUR MUSIC</p>
                <h2 className="text-2xl md:text-4xl font-black tracking-tight">LATEST RELEASES</h2>
              </div>
            </div>
            <a
              href="https://www.youtube.com/@bainslaofficial"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden md:inline-flex items-center gap-2 px-5 py-2.5 border border-gray-800 text-sm text-gray-300 rounded-xl hover:border-amber-500/50 hover:text-amber-500 hover:bg-amber-500/5 transition-all duration-300 font-semibold"
            >
              VIEW ALL <ChevronRight className="w-4 h-4" />
            </a>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-5">
            {RELEASES.map((r, i) => (
              <a key={i} href={r.url} target="_blank" rel="noopener noreferrer" className="group">
                <div className="relative overflow-hidden rounded-2xl aspect-square mb-3 shadow-lg shadow-black/40">
                  <img
                    src={r.image}
                    alt={r.subtitle}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-500">
                    <div className="w-12 h-12 rounded-full bg-amber-500 flex items-center justify-center shadow-xl shadow-amber-500/30">
                      <Play className="w-5 h-5 text-black fill-black ml-0.5" />
                    </div>
                  </div>
                </div>
                <h3 className="text-sm font-bold text-white truncate group-hover:text-amber-500 transition-colors">{r.title}</h3>
                <p className="text-xs text-gray-500 truncate mt-0.5">{r.subtitle}</p>
                <p className="text-[10px] text-gray-600 mt-0.5">{r.artist}</p>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* ───── OUR ARTISTS ───── */}
      <section id="artists" className="py-20 md:py-28 bg-[#0a0a0a]">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-12">
            <div className="flex items-center gap-4">
              <div className="w-1 h-8 bg-gradient-to-b from-amber-500 to-amber-700 rounded-full" />
              <div>
                <p className="text-amber-500 text-[11px] tracking-[0.3em] font-semibold mb-1">MEET THE TALENT</p>
                <h2 className="text-2xl md:text-4xl font-black tracking-tight">OUR ARTISTS</h2>
              </div>
            </div>
            <Link
              href="#artists"
              className="hidden md:inline-flex items-center gap-2 px-5 py-2.5 border border-gray-800 text-sm text-gray-300 rounded-xl hover:border-amber-500/50 hover:text-amber-500 hover:bg-amber-500/5 transition-all duration-300 font-semibold"
            >
              VIEW ALL ARTISTS <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-6 md:gap-8">
            {ARTISTS.map((a, i) => (
              <div key={i} className="text-center group">
                <div className="relative w-32 h-32 md:w-40 md:h-40 mx-auto mb-4">
                  <div className="absolute inset-0 rounded-full bg-gradient-to-br from-amber-500 to-amber-700 p-[2px]">
                    <div className="w-full h-full rounded-full overflow-hidden bg-[#0a0a0a]">
                      <img
                        src={a.image}
                        alt={a.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                      />
                    </div>
                  </div>
                  <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 px-3 py-0.5 bg-amber-500 rounded-full text-[9px] font-bold text-black tracking-wider">
                    {a.role.toUpperCase()}
                  </div>
                </div>
                <h4 className="font-bold text-sm md:text-base text-white group-hover:text-amber-500 transition-colors">{a.name}</h4>
                <p className="text-[11px] text-gray-500 mt-0.5">{a.genre}</p>
              </div>
            ))}
            <div className="text-center group cursor-pointer">
              <div className="relative w-32 h-32 md:w-40 md:h-40 mx-auto mb-4">
                <div className="absolute inset-0 rounded-full border-2 border-dashed border-gray-700 group-hover:border-amber-500 transition-colors duration-500 flex items-center justify-center bg-[#0a0a0a]">
                  <Mic2 className="w-14 h-14 text-amber-500/30 group-hover:text-amber-500 transition-all duration-500" />
                </div>
                <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 px-3 py-0.5 bg-gray-800 group-hover:bg-amber-500 rounded-full text-[9px] font-bold text-gray-400 group-hover:text-black tracking-wider transition-all">
                  ARTIST / SINGER
                </div>
              </div>
              <h4 className="font-bold text-sm md:text-base text-white group-hover:text-amber-500 transition-colors">Join Our Team</h4>
              <p className="text-[11px] text-gray-500 mt-0.5">Submit Your Song</p>
            </div>
          </div>
        </div>
      </section>

      {/* ───── QUICK LINKS ───── */}
      <section className="py-16 bg-[#060606]">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {QUICK_LINKS_CARDS.map((card, i) => (
              <div
                key={i}
                className="relative bg-gradient-to-br from-[#0f0f0f] to-[#0a0a0a] border border-gray-800/60 rounded-2xl p-6 hover:border-amber-500/30 transition-all duration-500 group overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/3 rounded-full -translate-y-1/2 translate-x-1/2 group-hover:bg-amber-500/8 transition-all duration-500" />
                <div className="relative">
                  <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center mb-4 group-hover:bg-amber-500/20 transition-colors">
                    <card.icon className="w-6 h-6 text-amber-500" />
                  </div>
                  <h3 className="font-extrabold text-sm tracking-wider text-white mb-2">{card.title}</h3>
                  <p className="text-xs text-gray-500 mb-5 leading-relaxed">{card.desc}</p>
                  <a
                    href={card.href}
                    className="inline-flex items-center gap-2 text-[11px] font-bold border border-gray-800 px-4 py-2 rounded-lg hover:border-amber-500 hover:text-amber-500 hover:bg-amber-500/5 transition-all duration-300 text-gray-400 tracking-wider"
                  >
                    {card.btn}
                    <ArrowRight className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ───── LATEST VIDEOS ───── */}
      <section id="videos" className="py-20 md:py-28 bg-[#0a0a0a]">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-12">
            <div className="flex items-center gap-4">
              <div className="w-1 h-8 bg-gradient-to-b from-amber-500 to-amber-700 rounded-full" />
              <div>
                <p className="text-amber-500 text-[11px] tracking-[0.3em] font-semibold mb-1">WATCH & LISTEN</p>
                <h2 className="text-2xl md:text-4xl font-black tracking-tight">LATEST VIDEOS</h2>
              </div>
            </div>
            <a
              href="https://www.youtube.com/@bainslaofficial"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden md:inline-flex items-center gap-2 px-5 py-2.5 border border-gray-800 text-sm text-gray-300 rounded-xl hover:border-amber-500/50 hover:text-amber-500 hover:bg-amber-500/5 transition-all duration-300 font-semibold"
            >
              VIEW ALL <ChevronRight className="w-4 h-4" />
            </a>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {VIDEOS.map((v, i) => (
              <a key={i} href={`https://www.youtube.com/watch?v=${v.id}`} target="_blank" rel="noopener noreferrer" className="group">
                <div className="relative overflow-hidden rounded-2xl aspect-video mb-4 shadow-xl shadow-black/40">
                  <img
                    src={`https://img.youtube.com/vi/${v.id}/hqdefault.jpg`}
                    alt={v.subtitle}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-16 h-16 rounded-full bg-amber-500/90 flex items-center justify-center group-hover:scale-110 group-hover:bg-amber-500 transition-all duration-500 shadow-xl shadow-amber-500/30">
                      <Play className="w-7 h-7 text-black fill-black ml-1" />
                    </div>
                  </div>
                  <div className="absolute bottom-3 right-3 px-2 py-1 bg-black/80 text-[11px] font-semibold rounded-lg flex items-center gap-1">
                    <Clock className="w-3 h-3" /> {v.duration}
                  </div>
                  <div className="absolute bottom-3 left-3 px-2 py-1 bg-black/80 text-[11px] font-semibold rounded-lg flex items-center gap-1">
                    <Eye className="w-3 h-3" /> {v.views}
                  </div>
                </div>
                <h3 className="font-bold text-base text-white group-hover:text-amber-500 transition-colors">{v.title}</h3>
                <p className="text-xs text-gray-500 mt-1">{v.subtitle}</p>
                <p className="text-[11px] text-gray-600 mt-1">Bainsla Music</p>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* ───── MUSIC CATALOGUE ───── */}
      <section id="catalogue" className="py-20 md:py-28 bg-[#060606]">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <p className="text-amber-500 text-[11px] tracking-[0.3em] font-semibold mb-3">EXPLORE BY CATEGORY</p>
            <h2 className="text-2xl md:text-4xl font-black tracking-tight mb-4">MUSIC CATALOGUE</h2>
            <p className="text-gray-500 text-sm max-w-xl mx-auto">Browse our extensive collection of Devotional Bhajans, Rasiya, Folk Songs and more across 800+ songs.</p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {CATALOGUE_CATEGORIES.map((cat, i) => (
              <div
                key={i}
                className="group relative bg-gradient-to-br from-[#111] to-[#0a0a0a] border border-gray-800/50 rounded-2xl p-6 hover:border-amber-500/40 transition-all duration-500 cursor-pointer overflow-hidden"
              >
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-500/0 via-amber-500/50 to-amber-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="text-3xl mb-3">{cat.icon}</div>
                <h3 className="font-bold text-sm text-white group-hover:text-amber-500 transition-colors mb-1">{cat.name}</h3>
                <p className="text-[11px] text-gray-600 mb-3">{cat.hindi}</p>
                <div className="flex items-center gap-1.5">
                  <Music className="w-3 h-3 text-amber-500/50" />
                  <span className="text-xs text-amber-500 font-semibold">{cat.count} Songs</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ───── ABOUT SECTION ───── */}
      <section id="about" className="py-20 md:py-28 bg-[#0a0a0a]">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 lg:gap-20 items-center">
            <div>
              <p className="text-amber-500 text-[11px] tracking-[0.3em] font-semibold mb-3">ABOUT US</p>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-black mb-6 leading-tight">
                About <span className="bg-gradient-to-r from-amber-500 to-amber-300 bg-clip-text text-transparent">Bainsla Music</span>
              </h2>
              <p className="text-gray-400 leading-relaxed mb-4 text-sm md:text-base">
                <strong className="text-white font-semibold">Bainsla Music Private Limited</strong> is India&apos;s leading Devotional, Folk &amp; Rasiya music label dedicated to preserving and promoting Indian cultural music.
              </p>
              <p className="text-gray-400 leading-relaxed mb-4 text-sm md:text-base">
                Under the visionary leadership of <strong className="text-white font-semibold">Ajeet Bainsla</strong>, our company specializes in Devotional Bhajans, Gurjar Rasiya, Folk Songs and Digital Music Distribution across 150+ platforms worldwide.
              </p>
              <p className="text-gray-400 leading-relaxed mb-8 text-sm md:text-base">
                With 256+ songs, 42+ artists, and millions of views across platforms, we are committed to bringing the finest devotional and folk music to audiences globally.
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[
                  { n: "256+", l: "Total Songs", icon: Music },
                  { n: "42+", l: "Artists", icon: Users },
                  { n: "178+", l: "YouTube Videos", icon: Play },
                  { n: "12.8M+", l: "Total Views", icon: Eye },
                ].map((s) => (
                  <div key={s.l} className="text-center p-4 bg-gradient-to-br from-[#111] to-[#0a0a0a] rounded-2xl border border-gray-800/50 group hover:border-amber-500/30 transition-all duration-300">
                    <s.icon className="w-5 h-5 text-amber-500/50 mx-auto mb-2" />
                    <div className="text-xl md:text-2xl font-black text-amber-500">{s.n}</div>
                    <div className="text-[10px] text-gray-500 font-semibold tracking-wider mt-1">{s.l.toUpperCase()}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative">
              <div className="rounded-3xl overflow-hidden border border-gray-800/50 shadow-2xl shadow-black/50">
                <img
                  src="https://img.youtube.com/vi/mu8M7Nk8ywU/maxresdefault.jpg"
                  alt="Bainsla Music"
                  className="w-full h-auto"
                />
              </div>
              <div className="absolute -bottom-5 -left-5 md:-bottom-6 md:-left-6 bg-gradient-to-r from-amber-500 to-amber-600 text-black px-6 py-4 rounded-2xl font-black text-sm shadow-xl shadow-amber-500/20">
                <div className="text-2xl">9+</div>
                <div className="text-[10px] tracking-wider font-semibold">YEARS OF EXCELLENCE</div>
              </div>
              <div className="absolute -top-4 -right-4 md:-top-5 md:-right-5 bg-[#111] border border-amber-500/20 px-4 py-3 rounded-2xl shadow-xl">
                <Award className="w-6 h-6 text-amber-500 mx-auto mb-1" />
                <div className="text-[10px] text-amber-500 font-bold tracking-wider">PREMIUM LABEL</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ───── LICENSING SECTION ───── */}
      <section id="licensing" className="py-20 md:py-28 bg-[#060606]">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <p className="text-amber-500 text-[11px] tracking-[0.3em] font-semibold mb-3">BUSINESS INQUIRIES</p>
            <h2 className="text-2xl md:text-4xl font-black tracking-tight mb-4">
              LICENSING <span className="bg-gradient-to-r from-amber-500 to-amber-300 bg-clip-text text-transparent">&amp; COPYRIGHT</span>
            </h2>
            <p className="text-gray-500 text-sm max-w-2xl mx-auto">For music licensing, copyright claims, YouTube CMS and other business inquiries.</p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              { title: "Song Licensing", desc: "License our music for films, TV, events, web series and commercial use.", icon: Music },
              { title: "Copyright Claims", desc: "Submit or release YouTube copyright claims. Fast resolution for content creators.", icon: Shield },
              { title: "Cover Song Permission", desc: "Get permission to cover our songs on YouTube, Spotify and other platforms.", icon: Mic2 },
              { title: "Business Collaboration", desc: "Partner with us for music production, distribution and brand collaborations.", icon: Users },
              { title: "CMS / Distribution", desc: "YouTube CMS services and digital music distribution across 150+ platforms.", icon: Globe },
              { title: "Submit Your Song", desc: "Independent artist? Submit your song to be released under Bainsla Music.", icon: Send },
            ].map((item, i) => (
              <div
                key={i}
                className="group relative bg-gradient-to-br from-[#0f0f0f] to-[#080808] border border-gray-800/50 rounded-2xl p-7 hover:border-amber-500/30 transition-all duration-500 overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/3 rounded-full -translate-y-1/2 translate-x-1/2 group-hover:bg-amber-500/8 transition-all duration-700" />
                <div className="relative">
                  <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center mb-5 group-hover:bg-amber-500/20 transition-colors duration-300">
                    <item.icon className="w-6 h-6 text-amber-500" />
                  </div>
                  <h3 className="font-bold text-base mb-2 group-hover:text-amber-500 transition-colors">{item.title}</h3>
                  <p className="text-xs text-gray-500 leading-relaxed mb-5">{item.desc}</p>
                  <a href="#contact" className="inline-flex items-center gap-1.5 text-amber-500 text-[11px] font-bold tracking-wider hover:gap-3 transition-all">
                    INQUIRE NOW <ArrowRight className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ───── DISTRIBUTION PARTNERS ───── */}
      <section className="py-16 bg-[#0a0a0a] border-y border-gray-800/30">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-10 items-start">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
                  <Shield className="w-5 h-5 text-amber-500" />
                </div>
                <h3 className="text-amber-500 font-extrabold text-sm tracking-wider">LICENSING & INQUIRIES</h3>
              </div>
              <p className="text-xs text-gray-500 mb-4 leading-relaxed">For music licensing, copyright, YouTube CMS claims and business inquiries.</p>
              <a href="#contact" className="inline-flex items-center gap-2 text-[11px] font-bold border border-amber-500/50 text-amber-500 px-5 py-2.5 rounded-xl hover:bg-amber-500 hover:text-black transition-all duration-300 tracking-wider">
                SUBMIT INQUIRY
              </a>
            </div>

            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
                  <Globe className="w-5 h-5 text-amber-500" />
                </div>
                <h3 className="text-amber-500 font-extrabold text-sm tracking-wider">DISTRIBUTION PARTNERS</h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {DISTRIBUTION_PLATFORMS.map((p) => (
                  <span key={p} className="text-[10px] text-gray-400 bg-[#111] border border-gray-800/50 px-3 py-1.5 rounded-lg font-medium hover:border-amber-500/30 hover:text-amber-500 transition-all cursor-default">
                    {p}
                  </span>
                ))}
                <span className="text-[10px] text-amber-500 bg-amber-500/10 border border-amber-500/20 px-3 py-1.5 rounded-lg font-bold">150+ More</span>
              </div>
            </div>

            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
                  <Mail className="w-5 h-5 text-amber-500" />
                </div>
                <h3 className="text-amber-500 font-extrabold text-sm tracking-wider">STAY CONNECTED</h3>
              </div>
              <p className="text-xs text-gray-500 mb-4 leading-relaxed">Subscribe to get the latest updates on new releases and exclusive content.</p>
              <div className="flex gap-2">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="flex-1 bg-[#111] border border-gray-800/50 rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-amber-500/50 transition-colors"
                />
                <button className="px-5 py-2.5 bg-amber-500 text-black text-[11px] font-bold rounded-xl hover:bg-amber-400 transition-colors tracking-wider shadow-lg shadow-amber-500/20">
                  SUBSCRIBE
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ───── CONTACT SECTION ───── */}
      <section id="contact" className="py-20 md:py-28 bg-[#060606]">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <p className="text-amber-500 text-[11px] tracking-[0.3em] font-semibold mb-3">GET IN TOUCH</p>
            <h2 className="text-2xl md:text-4xl font-black tracking-tight mb-4">
              Contact <span className="bg-gradient-to-r from-amber-500 to-amber-300 bg-clip-text text-transparent">Us</span>
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-12 lg:gap-20">
            <div>
              <div className="space-y-6">
                {[
                  { icon: MapPin, label: "Address", value: "Bainsla Music Private Limited\nJaipur, Rajasthan, India" },
                  { icon: Phone, label: "Phone", value: "+91 72978 97628" },
                  { icon: Mail, label: "Email", value: "bainslamusiccompany@gmail.com" },
                ].map((c, i) => (
                  <div key={i} className="flex items-start gap-4 group">
                    <div className="w-12 h-12 rounded-2xl bg-amber-500/10 flex items-center justify-center flex-shrink-0 group-hover:bg-amber-500/20 transition-colors">
                      <c.icon className="w-5 h-5 text-amber-500" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-white mb-0.5">{c.label}</p>
                      <p className="text-xs text-gray-400 whitespace-pre-line leading-relaxed">{c.value}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-10">
                <p className="text-sm font-bold mb-4 text-white">Follow Us</p>
                <div className="flex gap-3">
                  {[
                    { href: "https://www.youtube.com/@bainslaofficial", icon: YoutubeIcon, bg: "bg-red-600 hover:bg-red-500", label: "YouTube" },
                    { href: "https://www.instagram.com/bainslamusic", icon: InstagramIcon, bg: "bg-gradient-to-tr from-purple-600 to-pink-500", label: "Instagram" },
                    { href: "https://facebook.com/bainslamusic", icon: FacebookIcon, bg: "bg-blue-600 hover:bg-blue-500", label: "Facebook" },
                    { href: "https://wa.me/917297897628", icon: WhatsAppIcon, bg: "bg-green-600 hover:bg-green-500", label: "WhatsApp" },
                  ].map((s) => (
                    <a key={s.href} href={s.href} target="_blank" rel="noopener noreferrer" className={`w-11 h-11 rounded-xl ${s.bg} flex items-center justify-center hover:scale-110 transition-all duration-300 shadow-lg`} aria-label={s.label}>
                      <s.icon className="w-5 h-5" />
                    </a>
                  ))}
                </div>
              </div>
            </div>

            <form
              className="space-y-4 bg-gradient-to-br from-[#0f0f0f] to-[#080808] border border-gray-800/50 rounded-3xl p-8"
              onSubmit={(e) => {
                e.preventDefault();
                const data = new FormData(e.currentTarget);
                const msg = `Name: ${data.get("name")}\nPhone: ${data.get("phone")}\nType: ${data.get("type")}\nMessage: ${data.get("message")}`;
                window.open(`https://wa.me/917297897628?text=${encodeURIComponent(msg)}`);
              }}
            >
              <div className="grid sm:grid-cols-2 gap-4">
                <input name="name" placeholder="Your Name" required className="w-full bg-[#0a0a0a] border border-gray-800/50 rounded-xl px-4 py-3.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-amber-500/50 transition-colors" />
                <input name="phone" type="tel" placeholder="Phone Number" required className="w-full bg-[#0a0a0a] border border-gray-800/50 rounded-xl px-4 py-3.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-amber-500/50 transition-colors" />
              </div>
              <select name="type" required className="w-full bg-[#0a0a0a] border border-gray-800/50 rounded-xl px-4 py-3.5 text-sm text-gray-500 focus:outline-none focus:border-amber-500/50 transition-colors">
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
              <input name="email" type="email" placeholder="Email Address" className="w-full bg-[#0a0a0a] border border-gray-800/50 rounded-xl px-4 py-3.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-amber-500/50 transition-colors" />
              <textarea name="message" rows={4} placeholder="Your Message" required className="w-full bg-[#0a0a0a] border border-gray-800/50 rounded-xl px-4 py-3.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-amber-500/50 transition-colors resize-none" />
              <button
                type="submit"
                className="w-full bg-gradient-to-r from-amber-500 to-amber-600 text-black font-extrabold py-4 rounded-xl hover:from-amber-400 hover:to-amber-500 transition-all duration-300 text-sm tracking-wider shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2"
              >
                <WhatsAppIcon className="w-4 h-4" />
                SEND MESSAGE VIA WHATSAPP
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* ───── FOOTER ───── */}
      <footer className="bg-[#030303] border-t border-gray-800/30 pt-16 pb-6">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-14">
            {/* Logo */}
            <div className="col-span-2 md:col-span-1">
              <div className="flex items-center gap-2.5 mb-5">
                <MusicNote className="w-9 h-9 text-amber-500" />
                <div className="leading-tight">
                  <span className="text-xl font-extrabold text-white">BAINSLA</span>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[11px] tracking-[0.25em] text-amber-500 font-semibold">MUSIC</span>
                    <span className="text-[8px] text-gray-600 tracking-[0.15em]">PRIVATE LIMITED</span>
                  </div>
                </div>
              </div>
              <p className="text-xs text-gray-600 leading-relaxed">
                Bainsla Music Private Limited is India&apos;s leading Devotional, Folk &amp; Rasiya music label dedicated to preserving and promoting Indian cultural music.
              </p>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="text-amber-500 font-extrabold text-[11px] tracking-[0.2em] mb-5">QUICK LINKS</h4>
              <ul className="space-y-2.5">
                {["Home", "About Us", "Artists", "Releases", "Videos", "Catalogue", "Contact"].map((l) => (
                  <li key={l}>
                    <Link
                      href={`#${l.toLowerCase().replace(" ", "")}`}
                      className="text-xs text-gray-500 hover:text-amber-500 transition-colors flex items-center gap-1.5 group"
                    >
                      <ChevronRight className="w-3 h-3 text-gray-700 group-hover:text-amber-500 transition-colors" />
                      {l}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Services */}
            <div>
              <h4 className="text-amber-500 font-extrabold text-[11px] tracking-[0.2em] mb-5">SERVICES</h4>
              <ul className="space-y-2.5">
                {["Music Distribution", "YouTube CMS", "Song Licensing", "Copyright Claims", "Artist Management", "Music Production"].map((l) => (
                  <li key={l}>
                    <Link href="#licensing" className="text-xs text-gray-500 hover:text-amber-500 transition-colors flex items-center gap-1.5 group">
                      <ChevronRight className="w-3 h-3 text-gray-700 group-hover:text-amber-500 transition-colors" />
                      {l}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Company */}
            <div>
              <h4 className="text-amber-500 font-extrabold text-[11px] tracking-[0.2em] mb-5">COMPANY</h4>
              <ul className="space-y-2.5">
                {["About Bainsla Music", "Our Mission", "Privacy Policy", "Terms & Conditions"].map((l) => (
                  <li key={l}>
                    <Link href="#" className="text-xs text-gray-500 hover:text-amber-500 transition-colors flex items-center gap-1.5 group">
                      <ChevronRight className="w-3 h-3 text-gray-700 group-hover:text-amber-500 transition-colors" />
                      {l}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h4 className="text-amber-500 font-extrabold text-[11px] tracking-[0.2em] mb-5">CONTACT US</h4>
              <ul className="space-y-3">
                <li className="flex items-start gap-2.5 text-xs text-gray-500">
                  <MapPin className="w-4 h-4 text-amber-500/60 flex-shrink-0 mt-0.5" />
                  <span>Jaipur, Rajasthan, India</span>
                </li>
                <li className="flex items-center gap-2.5 text-xs text-gray-500">
                  <Phone className="w-4 h-4 text-amber-500/60 flex-shrink-0" />
                  +91 72978 97628
                </li>
                <li className="flex items-center gap-2.5 text-xs text-gray-500">
                  <Mail className="w-4 h-4 text-amber-500/60 flex-shrink-0" />
                  bainslamusiccompany@gmail.com
                </li>
              </ul>
              <div className="flex gap-2 mt-5">
                {[
                  { href: "https://www.youtube.com/@bainslaofficial", icon: YoutubeIcon, bg: "bg-red-600" },
                  { href: "https://www.instagram.com/bainslamusic", icon: InstagramIcon, bg: "bg-gradient-to-tr from-purple-600 to-pink-500" },
                  { href: "https://facebook.com/bainslamusic", icon: FacebookIcon, bg: "bg-blue-600" },
                  { href: "https://wa.me/917297897628", icon: WhatsAppIcon, bg: "bg-green-600" },
                ].map((s) => (
                  <a key={s.href} href={s.href} target="_blank" rel="noopener noreferrer" className={`w-9 h-9 rounded-xl ${s.bg} flex items-center justify-center hover:scale-110 transition-transform`}>
                    <s.icon className="w-4 h-4" />
                  </a>
                ))}
              </div>
            </div>
          </div>

          <div className="border-t border-gray-800/30 pt-6 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-[11px] text-gray-700">&copy; 2024 Bainsla Music Private Limited. All Rights Reserved.</p>
            <p className="text-[11px] text-gray-700">Made with <Heart className="w-3 h-3 inline text-amber-500/50" /> for Devotional Music</p>
          </div>
        </div>
      </footer>

      {/* ───── WHATSAPP FAB ───── */}
      <a
        href="https://wa.me/917297897628?text=Hi%2C%20I%20want%20to%20know%20about%20your%20services"
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-green-500 rounded-2xl flex items-center justify-center shadow-xl shadow-green-500/30 hover:scale-110 hover:shadow-green-500/40 transition-all duration-300"
        aria-label="Chat on WhatsApp"
      >
        <WhatsAppIcon className="w-7 h-7 text-white" />
      </a>

      {/* ───── Marquee Animation CSS ───── */}
      <style jsx global>{`
        @keyframes marquee {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
      `}</style>
    </div>
  );
}
