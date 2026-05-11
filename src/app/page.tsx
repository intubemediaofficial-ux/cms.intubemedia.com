"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { motion, useScroll, useTransform, useInView, AnimatePresence } from "framer-motion";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import {
  Play,
  ChevronRight,
  ChevronLeft,
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
  Volume2,
} from "lucide-react";

function YoutubeIcon({ className }: { className?: string; [key: string]: unknown }) {
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

/* ───────── constants ───────── */

const NAV_LINKS = [
  { label: "Home", href: "#home" },
  { label: "About", href: "#about" },
  { label: "Services", href: "#services" },
  { label: "Videos", href: "#videos" },
  { label: "Artists", href: "#artists" },
  { label: "Contact", href: "#contact" },
];

const HERO_SLIDES = [
  {
    title: "Rajasthan's No.1 Music Production Company",
    subtitle: "10,000+ Songs | 1.5M+ Subscribers | 150M+ Views",
    video: "mu8M7Nk8ywU",
  },
  {
    title: "YouTube CMS & MCN Services",
    subtitle: "Complete channel management, monetization & rights protection",
    video: "S7VZLHubP4c",
  },
  {
    title: "Music Distribution on 150+ Platforms",
    subtitle: "Spotify, JioSaavn, Gaana, Apple Music & more",
    video: "3ELgvab96VQ",
  },
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
    title: "YouTube CMS/MCN",
    description: "Complete channel management, content ID, monetization & rights management.",
    color: "from-red-500/20 to-rose-600/20",
    border: "hover:border-red-500/50",
    iconColor: "text-red-400",
  },
  {
    icon: Radio,
    title: "Channel Promotion",
    description: "Strategic growth, audience engagement & brand building for maximum reach.",
    color: "from-purple-500/20 to-violet-600/20",
    border: "hover:border-purple-500/50",
    iconColor: "text-purple-400",
  },
  {
    icon: Headphones,
    title: "Audio Video Distribution",
    description: "Distribute across 150+ platforms — Spotify, JioSaavn, Gaana, Wynk & more.",
    color: "from-blue-500/20 to-cyan-600/20",
    border: "hover:border-blue-500/50",
    iconColor: "text-blue-400",
  },
  {
    icon: Share2,
    title: "Social Media Management",
    description: "Professional strategy & content management across Instagram, Facebook & more.",
    color: "from-pink-500/20 to-fuchsia-600/20",
    border: "hover:border-pink-500/50",
    iconColor: "text-pink-400",
  },
  {
    icon: Bell,
    title: "Caller Tunes & CRBT",
    description: "Set up caller tunes across Jio, Airtel, Vi & BSNL. Maximize catalog revenue.",
    color: "from-amber-500/20 to-orange-600/20",
    border: "hover:border-amber-500/50",
    iconColor: "text-amber-400",
  },
  {
    icon: Mic2,
    title: "Music Production",
    description: "End-to-end production from recording & mixing to mastering. Studio quality.",
    color: "from-emerald-500/20 to-teal-600/20",
    border: "hover:border-emerald-500/50",
    iconColor: "text-emerald-400",
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
  { id: "mu8M7Nk8ywU", title: "कबूतर बोले गुटर गू | Kabutar Bole Gutar Gu", artist: "DG Mawai", views: "20M+" },
  { id: "S7VZLHubP4c", title: "इन दोनों कहनी ने DJ के आगे धूम मचा दी", artist: "Ajeet Katara, Balli", views: "18M+" },
  { id: "3ELgvab96VQ", title: "छोरी तेरी चाल मोरनी की ढाल", artist: "DG Mawai", views: "16M+" },
  { id: "8XKjIjWs6Ak", title: "अलवर की इस मुस्कान नाम की डांसर", artist: "DG Mawai", views: "15M+" },
  { id: "DFJYVn39dHE", title: "New Rajasthani DJ Song 2025", artist: "Bainsla Music", views: "12M+" },
  { id: "GwQnIPL68y8", title: "Desi Chore Dance Video", artist: "Bainsla Music", views: "10M+" },
];

const DIRECTORS = [
  { name: "Ajeet Bainsla", role: "Founder & Director", desc: "Born in Soorgarh, Sawai Madhopur. Passionate advocate for Rajasthani folk music since 2016." },
  { name: "Shivlal Bainsla", role: "Director", desc: "Driving business growth and artist partnerships across Rajasthan and beyond." },
  { name: "Aman Bainsla", role: "Director", desc: "Co-founder managing operations, technology and digital distribution." },
];

const TESTIMONIALS = [
  { name: "Rakesh Meena", role: "YouTube Artist", text: "Bainsla Music ने मेरे channel को एक नई ऊँचाई दी। उनकी team बहुत professional है। मेरे subscribers 10x बढ़ गए!", rating: 5 },
  { name: "Sunita Khatana", role: "Folk Singer", text: "Music distribution में Bainsla Music सबसे बेहतर है। मेरे गाने अब Spotify, JioSaavn सब पर available हैं!", rating: 5 },
  { name: "Mahendra Gurjar", role: "Channel Owner", text: "CMS service बहुत शानदार है। Copyright issues solve हो गए और revenue भी बढ़ गया। Highly recommended!", rating: 5 },
  { name: "DG Mawai", role: "Rasiya Singer", text: "Bainsla Music ke saath kaam karke 20M+ views aaye mere gaano pe. Best music company in Rajasthan!", rating: 5 },
];

const PLATFORMS = ["Spotify", "JioSaavn", "Gaana", "Wynk Music", "YouTube Music", "Apple Music", "Amazon Music", "Hungama", "Resso", "Instagram Reels"];

/* ───────── hooks ───────── */

function useCountUp(target: number, trigger: boolean) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!trigger) return;
    let start = 0;
    const duration = 2000;
    const step = (ts: number) => {
      if (!start) start = ts;
      const progress = Math.min((ts - start) / duration, 1);
      setCount(Math.floor(progress * target));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [target, trigger]);
  return count;
}

/* ───────── components ───────── */

function AudioVisualizer() {
  return (
    <div className="flex items-end gap-[3px] h-8">
      {[...Array(5)].map((_, i) => (
        <motion.div
          key={i}
          className="w-1 bg-gradient-to-t from-primary to-amber-300 rounded-full"
          animate={{ height: ["8px", "32px", "16px", "28px", "8px"] }}
          transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.15, ease: "easeInOut" }}
        />
      ))}
    </div>
  );
}

function ParticleField() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {[...Array(30)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 rounded-full bg-primary/30"
          style={{ left: `${Math.random() * 100}%`, top: `${Math.random() * 100}%` }}
          animate={{
            y: [0, -100, 0],
            opacity: [0, 1, 0],
            scale: [0, 1.5, 0],
          }}
          transition={{ duration: 4 + Math.random() * 4, repeat: Infinity, delay: Math.random() * 4 }}
        />
      ))}
    </div>
  );
}

function GradientOrb({ className }: { className?: string }) {
  return (
    <motion.div
      className={`absolute rounded-full blur-[120px] opacity-20 ${className}`}
      animate={{ scale: [1, 1.2, 1], rotate: [0, 180, 360] }}
      transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
    />
  );
}

function StatCard({ stat, index }: { stat: typeof STATS[0]; index: number }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });
  const count = useCountUp(stat.value, isInView);
  const Icon = stat.icon;

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: index * 0.1 }}
      viewport={{ once: true }}
      className="group relative text-center p-8 rounded-3xl bg-white/[0.03] backdrop-blur-sm border border-white/[0.06] hover:border-primary/30 transition-all duration-500 hover:-translate-y-2"
    >
      <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      <Icon className="w-8 h-8 text-primary/60 mx-auto mb-4 group-hover:text-primary transition-colors" />
      <div className="text-4xl md:text-5xl font-black text-white">
        {count}<span className="text-primary">{stat.suffix}</span>
      </div>
      <p className="text-sm text-white/40 mt-2 font-medium">{stat.label}</p>
    </motion.div>
  );
}

function VideoCarousel() {
  const [emblaRef, emblaApi] = useEmblaCarousel(
    { loop: true, align: "start", slidesToScroll: 1 },
    [Autoplay({ delay: 4000, stopOnInteraction: true })]
  );

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);

  return (
    <div className="relative">
      <div ref={emblaRef} className="overflow-hidden rounded-2xl">
        <div className="flex gap-4">
          {VIDEOS.map((v) => (
            <a
              key={v.id}
              href={`https://www.youtube.com/watch?v=${v.id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex-[0_0_280px] sm:flex-[0_0_320px] lg:flex-[0_0_380px]"
            >
              <div className="relative aspect-video rounded-2xl overflow-hidden">
                <img
                  src={`https://img.youtube.com/vi/${v.id}/hqdefault.jpg`}
                  alt={v.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="w-16 h-16 rounded-full bg-primary/90 flex items-center justify-center backdrop-blur-sm">
                    <Play className="w-7 h-7 text-white ml-1" />
                  </div>
                </div>
                <div className="absolute bottom-3 left-3 right-3">
                  <p className="text-white text-sm font-semibold line-clamp-1">{v.title}</p>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-white/60 text-xs">{v.artist}</span>
                    <span className="text-primary text-xs font-bold">{v.views} Views</span>
                  </div>
                </div>
              </div>
            </a>
          ))}
        </div>
      </div>
      <button onClick={scrollPrev} className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/60 backdrop-blur-sm border border-white/10 flex items-center justify-center text-white hover:bg-primary/80 transition-all z-10">
        <ChevronLeft className="w-5 h-5" />
      </button>
      <button onClick={scrollNext} className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/60 backdrop-blur-sm border border-white/10 flex items-center justify-center text-white hover:bg-primary/80 transition-all z-10">
        <ChevronRight className="w-5 h-5" />
      </button>
    </div>
  );
}

function Marquee({ children, direction = "left" }: { children: React.ReactNode; direction?: "left" | "right" }) {
  return (
    <div className="overflow-hidden whitespace-nowrap">
      <motion.div
        className="inline-flex gap-8"
        animate={{ x: direction === "left" ? ["0%", "-50%"] : ["-50%", "0%"] }}
        transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
      >
        {children}
        {children}
      </motion.div>
    </div>
  );
}

/* ───────── main page ───────── */

export default function HomePage() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [heroSlide, setHeroSlide] = useState(0);
  const [formData, setFormData] = useState({ name: "", phone: "", service: "", message: "" });
  const heroRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const heroOpacity = useTransform(scrollYProgress, [0, 1], [1, 0]);
  const heroScale = useTransform(scrollYProgress, [0, 1], [1, 1.1]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setHeroSlide((p) => (p + 1) % HERO_SLIDES.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const msg = `Name: ${formData.name}%0APhone: ${formData.phone}%0AService: ${formData.service}%0AMessage: ${formData.message}`;
    window.open(`https://wa.me/918696761606?text=${msg}`, "_blank");
  };

  return (
    <div className="bg-[#030303] text-white min-h-screen overflow-x-hidden">
      {/* ─── NAVBAR ─── */}
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          scrolled ? "bg-black/80 backdrop-blur-xl border-b border-white/[0.05] py-3" : "bg-transparent py-5"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between">
          <Link href="#home" className="flex items-center gap-2 group">
            <div className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-orange-600 flex items-center justify-center overflow-hidden">
              <Volume2 className="w-5 h-5 text-white" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
            </div>
            <div>
              <span className="font-bold text-lg leading-none">Bainsla</span>
              <span className="block text-[9px] font-bold tracking-[0.3em] text-primary leading-none">MUSIC</span>
            </div>
          </Link>

          <div className="hidden md:flex items-center gap-1">
            {NAV_LINKS.map((l) => (
              <a key={l.href} href={l.href} className="px-4 py-2 text-sm text-white/60 hover:text-white rounded-lg hover:bg-white/5 transition-all">
                {l.label}
              </a>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <AudioVisualizer />
            <Link href="/login" className="hidden sm:inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-primary to-orange-600 text-sm font-semibold text-black hover:shadow-lg hover:shadow-primary/25 transition-all hover:scale-105">
              Dashboard
            </Link>
            <button onClick={() => setMobileOpen(true)} className="md:hidden p-2 text-white/60 hover:text-white">
              <Menu className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ opacity: 0, x: "100%" }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: "100%" }}
              transition={{ type: "spring", damping: 25 }}
              className="fixed inset-0 bg-black/95 backdrop-blur-xl z-50 flex flex-col items-center justify-center gap-6"
            >
              <button onClick={() => setMobileOpen(false)} className="absolute top-6 right-6 text-white/60 hover:text-white">
                <X className="w-8 h-8" />
              </button>
              {NAV_LINKS.map((l) => (
                <a key={l.href} href={l.href} onClick={() => setMobileOpen(false)} className="text-2xl font-semibold text-white/80 hover:text-primary transition-colors">
                  {l.label}
                </a>
              ))}
              <Link href="/login" className="mt-4 px-8 py-3 rounded-full bg-gradient-to-r from-primary to-orange-600 font-semibold text-black">
                Dashboard Login
              </Link>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>

      {/* ─── HERO ─── */}
      <motion.section ref={heroRef} id="home" className="relative h-screen flex items-center justify-center overflow-hidden" style={{ opacity: heroOpacity }}>
        <motion.div className="absolute inset-0" style={{ scale: heroScale }}>
          <AnimatePresence mode="wait">
            <motion.div
              key={heroSlide}
              initial={{ opacity: 0, scale: 1.1 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 1.2 }}
              className="absolute inset-0"
            >
              <img
                src={`https://img.youtube.com/vi/${HERO_SLIDES[heroSlide].video}/maxresdefault.jpg`}
                alt=""
                className="w-full h-full object-cover"
              />
            </motion.div>
          </AnimatePresence>
          <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-[#030303]" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-transparent to-black/60" />
        </motion.div>

        <ParticleField />
        <GradientOrb className="w-[600px] h-[600px] bg-primary/40 -top-40 -left-40" />
        <GradientOrb className="w-[400px] h-[400px] bg-purple-500/30 bottom-20 right-0" />

        <div className="relative z-10 max-w-5xl mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm mb-8"
          >
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            <span className="text-sm text-white/70">Since 2016 — Rajasthan, India</span>
          </motion.div>

          <AnimatePresence mode="wait">
            <motion.h1
              key={heroSlide}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
              transition={{ duration: 0.8 }}
              className="text-4xl sm:text-6xl lg:text-7xl font-black leading-tight"
            >
              {HERO_SLIDES[heroSlide].title.split(" ").map((word, i) => (
                <span key={i} className={i >= HERO_SLIDES[heroSlide].title.split(" ").length - 2 ? "text-transparent bg-clip-text bg-gradient-to-r from-primary via-amber-400 to-orange-500" : ""}>
                  {word}{" "}
                </span>
              ))}
            </motion.h1>
          </AnimatePresence>

          <AnimatePresence mode="wait">
            <motion.p
              key={`sub-${heroSlide}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-lg sm:text-xl text-white/50 mt-6 max-w-2xl mx-auto"
            >
              {HERO_SLIDES[heroSlide].subtitle}
            </motion.p>
          </AnimatePresence>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 }} className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-10">
            <a href="#services" className="group relative px-8 py-4 rounded-full bg-gradient-to-r from-primary to-orange-600 font-bold text-black overflow-hidden transition-all hover:shadow-2xl hover:shadow-primary/30 hover:scale-105">
              <span className="relative z-10 flex items-center gap-2">
                Explore Services <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </span>
            </a>
            <a href="https://www.youtube.com/@bainslaofficial" target="_blank" rel="noopener noreferrer" className="group flex items-center gap-3 px-8 py-4 rounded-full border border-white/10 bg-white/5 backdrop-blur-sm hover:bg-white/10 transition-all">
              <Play className="w-5 h-5 text-red-500" />
              <span className="font-medium">Watch on YouTube</span>
            </a>
          </motion.div>

          {/* Slide indicators */}
          <div className="flex items-center justify-center gap-2 mt-12">
            {HERO_SLIDES.map((_, i) => (
              <button
                key={i}
                onClick={() => setHeroSlide(i)}
                className={`h-1.5 rounded-full transition-all duration-500 ${i === heroSlide ? "w-8 bg-primary" : "w-3 bg-white/20 hover:bg-white/40"}`}
              />
            ))}
          </div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
        >
          <div className="w-6 h-10 rounded-full border-2 border-white/20 flex items-start justify-center p-1.5">
            <motion.div animate={{ y: [0, 12, 0] }} transition={{ duration: 2, repeat: Infinity }} className="w-1.5 h-1.5 rounded-full bg-primary" />
          </div>
        </motion.div>
      </motion.section>

      {/* ─── MARQUEE ─── */}
      <div className="py-6 bg-gradient-to-r from-primary/5 via-transparent to-primary/5 border-y border-white/[0.03]">
        <Marquee>
          {["Rasiya", "Folk Music", "DJ Remix", "Devotional", "Rajasthani", "Gurjar Song", "Dance", "Haryanvi", "Wedding Songs", "Love Songs"].map((t) => (
            <span key={t} className="text-2xl font-black text-white/[0.07] uppercase tracking-wider">{t}</span>
          ))}
        </Marquee>
      </div>

      {/* ─── STATS ─── */}
      <section className="py-24 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {STATS.map((s, i) => (
              <StatCard key={s.label} stat={s} index={i} />
            ))}
          </div>
        </div>
      </section>

      {/* ─── ABOUT ─── */}
      <section id="about" className="py-24 relative overflow-hidden">
        <GradientOrb className="w-[500px] h-[500px] bg-purple-500/20 -right-40 top-0" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div initial={{ opacity: 0, x: -50 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.8 }}>
              <div className="relative">
                <div className="aspect-[4/3] rounded-3xl overflow-hidden bg-gradient-to-br from-primary/20 to-orange-600/10 border border-white/[0.06]">
                  <img
                    src="https://img.youtube.com/vi/mu8M7Nk8ywU/maxresdefault.jpg"
                    alt="Bainsla Music"
                    className="w-full h-full object-cover opacity-80"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                  <div className="absolute bottom-6 left-6 right-6">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-orange-600 flex items-center justify-center">
                        <Play className="w-5 h-5 text-white ml-0.5" />
                      </div>
                      <div>
                        <p className="font-semibold text-sm">Most Popular</p>
                        <p className="text-xs text-white/60">20M+ Views</p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="absolute -bottom-4 -right-4 px-6 py-3 rounded-2xl bg-primary/10 border border-primary/20 backdrop-blur-sm">
                  <p className="text-3xl font-black text-primary">9+</p>
                  <p className="text-xs text-white/60">Years</p>
                </div>
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, x: 50 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.8 }}>
              <span className="text-primary text-sm font-bold uppercase tracking-wider">About Us</span>
              <h2 className="text-3xl md:text-5xl font-black mt-4 leading-tight">
                Rajasthan&apos;s Premier{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-amber-400">Music House</span>
              </h2>
              <p className="text-white/50 mt-6 leading-relaxed">
                <strong className="text-white/80">Bainsla Music</strong> is a distinguished music production company rooted in the vibrant culture of Rajasthan, India. Specializing in traditional &apos;Rasiya&apos; songs, we&apos;ve been preserving and promoting the rich musical heritage for 9+ years.
              </p>
              <p className="text-white/50 mt-4 leading-relaxed">
                Under the visionary leadership of <strong className="text-white/80">Ajeet Bainsla</strong> and <strong className="text-white/80">Aman Bainsla</strong>, with over 10,000 songs across genres — Rasiya, Folk, DJ, Devotional — connecting audiences globally.
              </p>
              <div className="flex flex-wrap gap-2 mt-6">
                {["Rasiya", "Folk", "DJ Remix", "Devotional", "Dance", "Wedding"].map((g) => (
                  <span key={g} className="px-4 py-1.5 rounded-full text-xs font-medium bg-white/5 border border-white/10 text-white/60">{g}</span>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ─── SERVICES ─── */}
      <section id="services" className="py-24 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
            <span className="text-primary text-sm font-bold uppercase tracking-wider">What We Do</span>
            <h2 className="text-3xl md:text-5xl font-black mt-4">
              Our <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-amber-400">Services</span>
            </h2>
            <p className="text-white/40 mt-4 max-w-xl mx-auto">Complete music industry solutions — from production to distribution, promotion to monetization.</p>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {SERVICES.map((s, i) => {
              const Icon = s.icon;
              return (
                <motion.div
                  key={s.title}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  whileHover={{ y: -8, scale: 1.02 }}
                  className={`group relative p-7 rounded-3xl bg-white/[0.02] border border-white/[0.06] ${s.border} transition-all duration-500 overflow-hidden`}
                >
                  <div className={`absolute inset-0 bg-gradient-to-br ${s.color} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
                  <div className="relative z-10">
                    <div className={`w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-5 ${s.iconColor} group-hover:scale-110 transition-transform`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <h3 className="text-lg font-bold mb-2">{s.title}</h3>
                    <p className="text-sm text-white/40 leading-relaxed">{s.description}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ─── VIDEOS ─── */}
      <section id="videos" className="py-24 relative overflow-hidden">
        <GradientOrb className="w-[500px] h-[500px] bg-red-500/10 -left-40 top-20" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="flex flex-col sm:flex-row items-start sm:items-end justify-between mb-12">
            <div>
              <span className="text-primary text-sm font-bold uppercase tracking-wider">Trending Now</span>
              <h2 className="text-3xl md:text-5xl font-black mt-4">
                Hit <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-primary">Videos</span>
              </h2>
            </div>
            <a href="https://www.youtube.com/@bainslaofficial" target="_blank" rel="noopener noreferrer" className="mt-4 sm:mt-0 inline-flex items-center gap-2 text-sm text-primary hover:underline font-medium">
              View All <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </motion.div>

          <VideoCarousel />
        </div>
      </section>

      {/* ─── CHANNELS / ARTISTS ─── */}
      <section id="artists" className="py-24 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
            <span className="text-primary text-sm font-bold uppercase tracking-wider">Our Network</span>
            <h2 className="text-3xl md:text-5xl font-black mt-4">
              Partner <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-amber-400">Channels</span>
            </h2>
            <p className="text-white/40 mt-4 max-w-xl mx-auto">We manage and grow some of the biggest Rajasthani music channels on YouTube.</p>
          </motion.div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-5">
            {CHANNELS.map((ch, i) => (
              <motion.a
                key={ch.handle}
                href={`https://www.youtube.com/@${ch.handle}`}
                target="_blank"
                rel="noopener noreferrer"
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ y: -8, scale: 1.05 }}
                className="group text-center p-6 rounded-3xl bg-white/[0.02] border border-white/[0.06] hover:border-red-500/30 transition-all duration-500"
              >
                <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-red-500/20 to-primary/20 flex items-center justify-center mb-4 group-hover:from-red-500/40 group-hover:to-primary/40 transition-all">
                  <YoutubeIcon className="w-7 h-7 text-red-500" />
                </div>
                <h4 className="font-bold text-sm">{ch.name}</h4>
                <p className="text-xs text-primary mt-1 font-medium">{ch.subscribers}</p>
              </motion.a>
            ))}
          </div>
        </div>
      </section>

      {/* ─── DIRECTORS ─── */}
      <section className="py-24 relative overflow-hidden">
        <GradientOrb className="w-[400px] h-[400px] bg-amber-500/15 left-1/2 top-0" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
            <span className="text-primary text-sm font-bold uppercase tracking-wider">Leadership</span>
            <h2 className="text-3xl md:text-5xl font-black mt-4">
              Our <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-amber-400">Directors</span>
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            {DIRECTORS.map((d, i) => (
              <motion.div
                key={d.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                whileHover={{ y: -5 }}
                className="group text-center p-10 rounded-3xl bg-white/[0.02] border border-white/[0.06] hover:border-primary/20 transition-all duration-500"
              >
                <div className="w-24 h-24 mx-auto rounded-full bg-gradient-to-br from-primary to-orange-600 flex items-center justify-center text-3xl font-black text-black mb-6 group-hover:scale-110 transition-transform">
                  {d.name.split(" ").map((n) => n[0]).join("")}
                </div>
                <h4 className="text-xl font-bold">{d.name}</h4>
                <p className="text-primary text-sm mt-1 font-medium">{d.role}</p>
                <p className="text-white/40 text-sm mt-4 leading-relaxed">{d.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── PLATFORMS MARQUEE ─── */}
      <section className="py-16 border-y border-white/[0.03]">
        <div className="text-center mb-8">
          <span className="text-primary text-sm font-bold uppercase tracking-wider">Available On 150+ Platforms</span>
        </div>
        <Marquee direction="right">
          {PLATFORMS.map((p) => (
            <span key={p} className="px-8 py-3 rounded-full border border-white/[0.06] text-sm text-white/30 font-medium">{p}</span>
          ))}
        </Marquee>
      </section>

      {/* ─── TESTIMONIALS ─── */}
      <section className="py-24 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
            <span className="text-primary text-sm font-bold uppercase tracking-wider">Testimonials</span>
            <h2 className="text-3xl md:text-5xl font-black mt-4">
              What Artists <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-amber-400">Say</span>
            </h2>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {TESTIMONIALS.map((t, i) => (
              <motion.div
                key={t.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="p-6 rounded-3xl bg-white/[0.02] border border-white/[0.06] hover:border-primary/20 transition-all duration-500"
              >
                <div className="flex gap-0.5 mb-4">
                  {[...Array(t.rating)].map((_, j) => (
                    <Star key={j} className="w-4 h-4 text-primary fill-primary" />
                  ))}
                </div>
                <p className="text-sm text-white/60 leading-relaxed mb-6">&ldquo;{t.text}&rdquo;</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/30 to-orange-600/20 flex items-center justify-center text-sm font-bold text-primary">
                    {t.name[0]}
                  </div>
                  <div>
                    <p className="text-sm font-semibold">{t.name}</p>
                    <p className="text-xs text-white/40">{t.role}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── FEATURED IN ─── */}
      <section className="py-12 border-y border-white/[0.03]">
        <div className="max-w-5xl mx-auto px-4 text-center">
          <span className="text-xs text-white/30 uppercase tracking-wider font-medium">Featured In</span>
          <div className="flex flex-wrap items-center justify-center gap-8 mt-6">
            {["Firstpost", "Republic Bharat", "Dainik Jagran", "Deezer", "Gaana", "JioSaavn"].map((n) => (
              <span key={n} className="text-lg font-bold text-white/[0.12] hover:text-white/30 transition-colors cursor-default">{n}</span>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA ─── */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-orange-600/10" />
        <GradientOrb className="w-[600px] h-[600px] bg-primary/20 left-1/2 -translate-x-1/2 top-0" />
        <div className="relative max-w-4xl mx-auto px-4 text-center">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }}>
            <h2 className="text-3xl md:text-6xl font-black">
              Ready to Grow Your{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-amber-400">Music?</span>
            </h2>
            <p className="text-white/40 mt-6 text-lg max-w-xl mx-auto">Join 50+ artists and channels who trust Bainsla Music for their music journey. Let&apos;s make your music reach millions.</p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-10">
              <a href="tel:+918696761606" className="group px-8 py-4 rounded-full bg-gradient-to-r from-primary to-orange-600 font-bold text-black hover:shadow-2xl hover:shadow-primary/30 hover:scale-105 transition-all">
                <span className="flex items-center gap-2">
                  <Phone className="w-4 h-4" /> Call Now
                </span>
              </a>
              <a href="#contact" className="px-8 py-4 rounded-full border border-white/10 bg-white/5 backdrop-blur-sm hover:bg-white/10 font-medium transition-all">
                Send Message <ChevronRight className="w-4 h-4 inline ml-1" />
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ─── CONTACT ─── */}
      <section id="contact" className="py-24 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid lg:grid-cols-2 gap-16">
            <motion.div initial={{ opacity: 0, x: -50 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
              <span className="text-primary text-sm font-bold uppercase tracking-wider">Get In Touch</span>
              <h2 className="text-3xl md:text-5xl font-black mt-4">
                Let&apos;s <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-amber-400">Connect</span>
              </h2>
              <p className="text-white/40 mt-6">Ready to take your music to the next level? Contact us today and let&apos;s discuss how we can help you grow.</p>

              <div className="space-y-6 mt-10">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                    <Phone className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs text-white/40">Phone</p>
                    <a href="tel:+918696761606" className="font-semibold hover:text-primary transition-colors">+91-8696761606</a>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                    <Mail className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs text-white/40">Email</p>
                    <a href="mailto:ajeet@bainslamusic.com" className="font-semibold hover:text-primary transition-colors">ajeet@bainslamusic.com</a>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                    <MapPin className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs text-white/40">Address</p>
                    <p className="font-semibold text-sm">59A Chanchan Nagar, Gokulpura, Jhotwara, Jaipur-302012</p>
                  </div>
                </div>
              </div>

              <div className="mt-10">
                <p className="text-sm text-white/40 mb-4">Follow Us</p>
                <div className="flex gap-3">
                  <a href="https://www.youtube.com/@bainslaofficial" target="_blank" rel="noopener noreferrer" className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-white/60 hover:text-red-500 hover:border-red-500/30 transition-all hover:scale-110">
                    <YoutubeIcon className="w-5 h-5" />
                  </a>
                  <a href="https://www.instagram.com/bainslamusic" target="_blank" rel="noopener noreferrer" className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-white/60 hover:text-pink-500 hover:border-pink-500/30 transition-all hover:scale-110">
                    <InstagramIcon className="w-5 h-5" />
                  </a>
                </div>
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, x: 50 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
              <form onSubmit={handleSubmit} className="p-8 rounded-3xl bg-white/[0.02] border border-white/[0.06] backdrop-blur-sm space-y-5">
                <div>
                  <label className="text-xs text-white/40 uppercase tracking-wider font-medium">Your Name</label>
                  <input type="text" required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="mt-2 w-full px-5 py-3.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/20 outline-none focus:border-primary/50 transition-colors" placeholder="Enter your name" />
                </div>
                <div>
                  <label className="text-xs text-white/40 uppercase tracking-wider font-medium">Phone Number</label>
                  <input type="tel" required value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} className="mt-2 w-full px-5 py-3.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/20 outline-none focus:border-primary/50 transition-colors" placeholder="+91 XXXXX XXXXX" />
                </div>
                <div>
                  <label className="text-xs text-white/40 uppercase tracking-wider font-medium">Service</label>
                  <select required value={formData.service} onChange={(e) => setFormData({ ...formData, service: e.target.value })} className="mt-2 w-full px-5 py-3.5 rounded-xl bg-white/5 border border-white/10 text-white outline-none focus:border-primary/50 transition-colors appearance-none">
                    <option value="" className="bg-[#111]">Select a service</option>
                    <option value="YouTube CMS" className="bg-[#111]">YouTube CMS/MCN</option>
                    <option value="Channel Promotion" className="bg-[#111]">Channel Promotion</option>
                    <option value="Music Distribution" className="bg-[#111]">Music Distribution</option>
                    <option value="Social Media" className="bg-[#111]">Social Media Management</option>
                    <option value="Music Production" className="bg-[#111]">Music Production</option>
                    <option value="Other" className="bg-[#111]">Other</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-white/40 uppercase tracking-wider font-medium">Message</label>
                  <textarea rows={4} value={formData.message} onChange={(e) => setFormData({ ...formData, message: e.target.value })} className="mt-2 w-full px-5 py-3.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/20 outline-none focus:border-primary/50 transition-colors resize-none" placeholder="Tell us about your requirements..." />
                </div>
                <button type="submit" className="w-full py-4 rounded-xl bg-gradient-to-r from-primary to-orange-600 font-bold text-black hover:shadow-lg hover:shadow-primary/25 transition-all hover:scale-[1.02]">
                  Send via WhatsApp
                </button>
              </form>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ─── FOOTER ─── */}
      <footer className="py-16 border-t border-white/[0.05]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-10">
            <div>
              <Link href="#home" className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-orange-600 flex items-center justify-center">
                  <Volume2 className="w-5 h-5 text-white" />
                </div>
                <div>
                  <span className="font-bold text-lg leading-none">Bainsla</span>
                  <span className="block text-[9px] font-bold tracking-[0.3em] text-primary leading-none">MUSIC</span>
                </div>
              </Link>
              <p className="text-sm text-white/30 mt-4 leading-relaxed">Rajasthan&apos;s No.1 Music Production Company. Preserving & promoting Rasiya folk music since 2016.</p>
            </div>

            <div>
              <h4 className="font-bold text-sm mb-4 text-white/60">Company</h4>
              <ul className="space-y-2.5">
                {["Home", "About Us", "Services", "Videos", "Contact"].map((l) => (
                  <li key={l}><a href={`#${l.toLowerCase().replace(" ", "")}`} className="text-sm text-white/30 hover:text-primary transition-colors">{l}</a></li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-sm mb-4 text-white/60">Quick Links</h4>
              <ul className="space-y-2.5">
                {[{ label: "Privacy Policy", href: "#" }, { label: "Terms & Conditions", href: "#" }, { label: "Dashboard Login", href: "/login" }].map((l) => (
                  <li key={l.label}>
                    {l.href.startsWith("/") ? (
                      <Link href={l.href} className="text-sm text-white/30 hover:text-primary transition-colors">{l.label}</Link>
                    ) : (
                      <a href={l.href} className="text-sm text-white/30 hover:text-primary transition-colors">{l.label}</a>
                    )}
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-sm mb-4 text-white/60">Contact</h4>
              <ul className="space-y-3">
                <li className="flex items-center gap-2 text-sm text-white/30">
                  <Phone className="w-4 h-4 text-primary shrink-0" /> +91-8696761606
                </li>
                <li className="flex items-center gap-2 text-sm text-white/30">
                  <Mail className="w-4 h-4 text-primary shrink-0" /> ajeet@bainslamusic.com
                </li>
                <li className="flex items-start gap-2 text-sm text-white/30">
                  <MapPin className="w-4 h-4 text-primary shrink-0 mt-0.5" /> Jaipur, Rajasthan, India
                </li>
              </ul>
            </div>
          </div>

          <div className="pt-10 mt-10 border-t border-white/[0.05] flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs text-white/20">&copy; {new Date().getFullYear()} Bainsla Music Pvt. Ltd. All rights reserved.</p>
            <div className="flex items-center gap-4">
              <a href="https://www.youtube.com/@bainslaofficial" target="_blank" rel="noopener noreferrer" className="text-xs text-white/20 hover:text-primary transition-colors">YouTube</a>
              <a href="https://www.instagram.com/bainslamusic" target="_blank" rel="noopener noreferrer" className="text-xs text-white/20 hover:text-primary transition-colors">Instagram</a>
            </div>
          </div>
        </div>
      </footer>

      {/* ─── WhatsApp Floating Button ─── */}
      <motion.a
        href="https://wa.me/918696761606?text=Hi%2C%20I%20want%20to%20know%20about%20Bainsla%20Music%20services"
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-[#25D366] flex items-center justify-center shadow-lg shadow-[#25D366]/30"
        whileHover={{ scale: 1.15 }}
        whileTap={{ scale: 0.95 }}
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 2, type: "spring" }}
        aria-label="Chat on WhatsApp"
      >
        <svg viewBox="0 0 24 24" fill="white" className="w-7 h-7">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
        </svg>
      </motion.a>

      {/* ─── Global Styles ─── */}
      <style jsx global>{`
        html { scroll-behavior: smooth; }
        .line-clamp-1 { display: -webkit-box; -webkit-line-clamp: 1; -webkit-box-orient: vertical; overflow: hidden; }
      `}</style>
    </div>
  );
}
