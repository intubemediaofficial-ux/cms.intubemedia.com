"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { signIn, useSession } from "next-auth/react";
import { Loader2 } from "lucide-react";

export default function LoginPage() {
  const [mode, setMode] = useState<"login" | "register" | "forgot">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [forgotStep, setForgotStep] = useState<"email" | "otp">("email");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [otpSending, setOtpSending] = useState(false);
  const router = useRouter();
  const { data: session } = useSession();

  useEffect(() => {
    if (session) {
      router.push(session.user?.role === "admin" ? "/admin-dashboard" : "/dashboard");
    }
  }, [session, router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Email and password are required");
      return;
    }
    setLoading(true);
    setError(null);
    setSuccess(null);
    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });
    setLoading(false);
    if (result?.error) {
      setError("Invalid email or password. If you signed up with Google, please use 'Sign in with Google' or create an account to set a password.");
    } else {
      router.push("/dashboard");
      router.refresh();
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password) {
      setError("Name, email, and password are required");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, phone }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Registration failed");
      } else {
        setSuccess(data.message || "Account created! Admin will verify your account. You can login after approval.");
        setMode("login");
        setName("");
        setPhone("");
      }
    } catch {
      setError("Something went wrong. Please try again.");
    }
    setLoading(false);
  };

  const handleGoogleLogin = async () => {
    setGoogleLoading(true);
    await signIn("google", { callbackUrl: "/dashboard" });
  };

  const handleSendResetOtp = async () => {
    if (!email) {
      setError("Email is required");
      return;
    }
    setOtpSending(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to send OTP");
      } else {
        setForgotStep("otp");
        setSuccess("OTP sent to your email! Check your inbox.");
      }
    } catch {
      setError("Something went wrong. Please try again.");
    }
    setOtpSending(false);
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp || !newPassword) {
      setError("OTP and new password are required");
      return;
    }
    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp, newPassword }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to reset password");
      } else {
        setSuccess("Password reset successfully! You can now login.");
        setMode("login");
        setForgotStep("email");
        setOtp("");
        setNewPassword("");
      }
    } catch {
      setError("Something went wrong. Please try again.");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex relative overflow-hidden">
      {/* CSS Animations */}
      <style jsx>{`
        @keyframes float1 {
          0%, 100% { transform: translate(0, 0) rotate(0deg) scale(1); }
          25% { transform: translate(100px, -80px) rotate(90deg) scale(1.1); }
          50% { transform: translate(200px, 50px) rotate(180deg) scale(0.9); }
          75% { transform: translate(-50px, 100px) rotate(270deg) scale(1.05); }
        }
        @keyframes float2 {
          0%, 100% { transform: translate(0, 0) rotate(0deg); }
          33% { transform: translate(-120px, 80px) rotate(120deg); }
          66% { transform: translate(80px, -60px) rotate(240deg); }
        }
        @keyframes float3 {
          0%, 100% { transform: translate(0, 0) rotate(0deg) scale(1); }
          20% { transform: translate(60px, -100px) rotate(72deg) scale(1.15); }
          40% { transform: translate(-80px, -40px) rotate(144deg) scale(0.85); }
          60% { transform: translate(100px, 80px) rotate(216deg) scale(1.1); }
          80% { transform: translate(-40px, 60px) rotate(288deg) scale(0.95); }
        }
        @keyframes float4 {
          0%, 100% { transform: translate(0, 0) rotate(0deg); }
          50% { transform: translate(-150px, -100px) rotate(180deg); }
        }
        @keyframes orbMove1 {
          0%, 100% { transform: translate(0, 0); }
          25% { transform: translate(80px, -60px); }
          50% { transform: translate(-40px, 80px); }
          75% { transform: translate(60px, 40px); }
        }
        @keyframes orbMove2 {
          0%, 100% { transform: translate(0, 0); }
          33% { transform: translate(-100px, 60px); }
          66% { transform: translate(50px, -80px); }
        }
        @keyframes orbMove3 {
          0%, 100% { transform: translate(0, 0); }
          50% { transform: translate(120px, -40px); }
        }
        @keyframes slideRight {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100vw); }
        }
        @keyframes spinSlow {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes gradientShift {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        @keyframes waveMove {
          0% { transform: translateX(0) scaleY(1); }
          50% { transform: translateX(-25%) scaleY(0.8); }
          100% { transform: translateX(-50%) scaleY(1); }
        }
      `}</style>

      {/* Animated Background */}
      <div className="absolute inset-0" style={{
        background: "linear-gradient(135deg, #0a0a0a 0%, #1a0a1e 25%, #0d1b2a 50%, #1a0a1e 75%, #0a0a0a 100%)",
        backgroundSize: "400% 400%",
        animation: "gradientShift 15s ease infinite"
      }}>

        {/* Moving Gradient Orbs */}
        <div className="absolute top-[10%] left-[10%] w-[600px] h-[600px] rounded-full bg-red-600/15 blur-[150px]" style={{ animation: "orbMove1 20s ease-in-out infinite" }} />
        <div className="absolute bottom-[10%] right-[10%] w-[500px] h-[500px] rounded-full bg-blue-500/12 blur-[130px]" style={{ animation: "orbMove2 25s ease-in-out infinite" }} />
        <div className="absolute top-[50%] left-[40%] w-[400px] h-[400px] rounded-full bg-purple-500/10 blur-[120px]" style={{ animation: "orbMove3 18s ease-in-out infinite" }} />
        <div className="absolute top-[20%] right-[30%] w-[350px] h-[350px] rounded-full bg-pink-500/8 blur-[100px]" style={{ animation: "orbMove1 22s ease-in-out infinite reverse" }} />

        {/* Animated Wave Lines at bottom */}
        <div className="absolute bottom-0 left-0 right-0 h-[200px] overflow-hidden opacity-[0.06]">
          <svg className="absolute bottom-0 w-[200%]" style={{ animation: "waveMove 8s linear infinite" }} height="200" viewBox="0 0 2880 200" fill="none">
            <path d="M0 80C480 20 960 140 1440 80C1920 20 2400 140 2880 80V200H0Z" fill="url(#wave1)"/>
            <defs><linearGradient id="wave1" x1="0" y1="0" x2="2880" y2="0"><stop stopColor="#ff0000"/><stop offset="0.5" stopColor="#ff4444"/><stop offset="1" stopColor="#ff0000"/></linearGradient></defs>
          </svg>
          <svg className="absolute bottom-0 w-[200%]" style={{ animation: "waveMove 12s linear infinite", animationDelay: "-3s" }} height="200" viewBox="0 0 2880 200" fill="none">
            <path d="M0 120C480 60 960 180 1440 120C1920 60 2400 180 2880 120V200H0Z" fill="url(#wave2)" opacity="0.5"/>
            <defs><linearGradient id="wave2" x1="0" y1="0" x2="2880" y2="0"><stop stopColor="#4444ff"/><stop offset="0.5" stopColor="#6666ff"/><stop offset="1" stopColor="#4444ff"/></linearGradient></defs>
          </svg>
        </div>

        {/* Rotating Ring */}
        <div className="absolute top-[15%] right-[15%] w-[200px] h-[200px] opacity-[0.04]" style={{ animation: "spinSlow 30s linear infinite" }}>
          <svg viewBox="0 0 200 200" fill="none" stroke="white" strokeWidth="1">
            <circle cx="100" cy="100" r="90"/><circle cx="100" cy="100" r="70"/><circle cx="100" cy="100" r="50"/>
          </svg>
        </div>
        <div className="absolute bottom-[25%] left-[10%] w-[160px] h-[160px] opacity-[0.04]" style={{ animation: "spinSlow 25s linear infinite reverse" }}>
          <svg viewBox="0 0 200 200" fill="none" stroke="white" strokeWidth="1">
            <circle cx="100" cy="100" r="90"/><circle cx="100" cy="100" r="60"/><circle cx="100" cy="100" r="30"/>
          </svg>
        </div>

        {/* Floating YouTube Icons — continuously moving & rotating */}
        <div className="absolute top-[10%] left-[5%] opacity-[0.08]" style={{ animation: "float1 18s ease-in-out infinite" }}>
          <svg width="70" height="49" viewBox="0 0 24 17" fill="white">
            <path d="M23.5 4.7s-.2-1.7-.9-2.4c-.9-.9-1.8-.9-2.3-1C17 1 12 1 12 1s-5 0-8.3.3c-.5.1-1.4.1-2.3 1-.7.7-.9 2.4-.9 2.4S0 6.7 0 8.6v1.8c0 2 .5 3.9.5 3.9s.2 1.7.9 2.4c.9.9 2 .9 2.5 1 1.8.2 7.1.2 7.1.2s5 0 8.3-.3c.5-.1 1.4-.1 2.3-1 .7-.7.9-2.4.9-2.4s.5-2 .5-3.9V8.6c0-2-.5-3.9-.5-3.9z"/>
            <path d="M9.5 12V5.5l6.5 3.3L9.5 12z" fill="#0f0f0f"/>
          </svg>
        </div>
        <div className="absolute top-[55%] right-[8%] opacity-[0.07]" style={{ animation: "float2 22s ease-in-out infinite" }}>
          <svg width="55" height="55" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5">
            <path d="M9 18V5l12-2v13"/>
            <circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/>
          </svg>
        </div>
        <div className="absolute bottom-[15%] left-[20%] opacity-[0.06]" style={{ animation: "float3 16s ease-in-out infinite" }}>
          <svg width="50" height="50" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5">
            <polygon points="5 3 19 12 5 21 5 3"/>
          </svg>
        </div>
        <div className="absolute top-[35%] right-[35%] opacity-[0.05]" style={{ animation: "float4 20s ease-in-out infinite" }}>
          <svg width="45" height="45" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5">
            <rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18"/><line x1="7" y1="2" x2="7" y2="22"/><line x1="17" y1="2" x2="17" y2="22"/><line x1="2" y1="12" x2="22" y2="12"/>
          </svg>
        </div>
        <div className="absolute top-[70%] left-[60%] opacity-[0.06]" style={{ animation: "float1 24s ease-in-out infinite reverse" }}>
          <svg width="40" height="28" viewBox="0 0 24 17" fill="white">
            <path d="M23.5 4.7s-.2-1.7-.9-2.4c-.9-.9-1.8-.9-2.3-1C17 1 12 1 12 1s-5 0-8.3.3c-.5.1-1.4.1-2.3 1-.7.7-.9 2.4-.9 2.4S0 6.7 0 8.6v1.8c0 2 .5 3.9.5 3.9s.2 1.7.9 2.4c.9.9 2 .9 2.5 1 1.8.2 7.1.2 7.1.2s5 0 8.3-.3c.5-.1 1.4-.1 2.3-1 .7-.7.9-2.4.9-2.4s.5-2 .5-3.9V8.6c0-2-.5-3.9-.5-3.9z"/>
            <path d="M9.5 12V5.5l6.5 3.3L9.5 12z" fill="#0f0f0f"/>
          </svg>
        </div>
        <div className="absolute top-[5%] left-[55%] opacity-[0.05]" style={{ animation: "float3 28s ease-in-out infinite" }}>
          <svg width="35" height="35" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5">
            <circle cx="12" cy="12" r="10"/><polygon points="10 8 16 12 10 16 10 8"/>
          </svg>
        </div>
        <div className="absolute bottom-[35%] right-[20%] opacity-[0.04]" style={{ animation: "float2 15s ease-in-out infinite reverse" }}>
          <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1">
            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
          </svg>
        </div>

        {/* Sliding light streaks */}
        <div className="absolute top-[30%] h-[1px] w-[300px] bg-gradient-to-r from-transparent via-red-500/30 to-transparent" style={{ animation: "slideRight 8s linear infinite" }} />
        <div className="absolute top-[50%] h-[1px] w-[200px] bg-gradient-to-r from-transparent via-blue-500/20 to-transparent" style={{ animation: "slideRight 12s linear infinite", animationDelay: "-4s" }} />
        <div className="absolute top-[70%] h-[1px] w-[250px] bg-gradient-to-r from-transparent via-purple-500/25 to-transparent" style={{ animation: "slideRight 10s linear infinite", animationDelay: "-7s" }} />

        {/* Particle dots */}
        {[...Array(12)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 rounded-full bg-white/20"
            style={{
              top: `${10 + (i * 7) % 80}%`,
              left: `${5 + (i * 11) % 90}%`,
              animation: `float${(i % 4) + 1} ${15 + i * 2}s ease-in-out infinite`,
              animationDelay: `${i * -1.5}s`,
            }}
          />
        ))}
      </div>

      {/* Left Side — Branding */}
      <div className="hidden lg:flex flex-1 items-center justify-center relative z-10">
        <div className="max-w-md text-center px-8">
          {/* YouTube Play Button Logo */}
          <div className="mb-8 flex justify-center">
            <div className="relative">
              <div className="w-28 h-28 bg-gradient-to-br from-red-500 to-red-700 rounded-3xl flex items-center justify-center shadow-2xl shadow-red-500/30 transform hover:scale-105 transition-transform duration-300" style={{ animation: "spinSlow 60s linear infinite" }}>
                <svg width="56" height="56" viewBox="0 0 24 24" fill="white" style={{ animation: "spinSlow 60s linear infinite reverse" }}>
                  <path d="M8 5v14l11-7z"/>
                </svg>
              </div>
              <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full border-2 border-[#1a0a1e] animate-pulse" />
            </div>
          </div>

          {/* Bainsla Music Studio Text */}
          <h1 className="text-5xl font-black text-white mb-2 tracking-tight">
            <span className="bg-gradient-to-r from-red-400 via-red-500 to-pink-500 bg-clip-text text-transparent">Bainsla Music</span>
          </h1>
          <h2 className="text-3xl font-bold text-white/90 tracking-[0.2em] uppercase mb-6">
            Studio
          </h2>
          <div className="w-20 h-1 bg-gradient-to-r from-red-500 to-pink-500 mx-auto rounded-full mb-6" />
          <p className="text-white/50 text-base leading-relaxed">
            Channel Management System
          </p>
          <p className="text-white/30 text-sm mt-2">
            Manage channels, revenue, videos & payments
          </p>

          {/* Stats pills */}
          <div className="flex gap-3 justify-center mt-10">
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-full px-4 py-2 text-xs text-white/60">
              <span className="text-red-400 font-bold">Revenue</span> Tracking
            </div>
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-full px-4 py-2 text-xs text-white/60">
              <span className="text-blue-400 font-bold">Video</span> Analytics
            </div>
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-full px-4 py-2 text-xs text-white/60">
              <span className="text-green-400 font-bold">Channel</span> Growth
            </div>
          </div>
        </div>
      </div>

      {/* Right Side — Login Form */}
      <div className="flex-1 flex items-center justify-center relative z-10 px-6">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden text-center mb-8">
            <div className="inline-flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-red-700 rounded-xl flex items-center justify-center shadow-lg shadow-red-500/20">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
                  <path d="M8 5v14l11-7z"/>
                </svg>
              </div>
              <div className="text-left">
                <h1 className="text-2xl font-black text-white">
                  <span className="bg-gradient-to-r from-red-400 to-pink-500 bg-clip-text text-transparent">Bainsla Music</span>
                </h1>
                <p className="text-[10px] font-bold tracking-[0.3em] text-white/60 uppercase">Studio</p>
              </div>
            </div>
          </div>

          {/* Glassmorphism Card */}
          <div className="bg-white/[0.07] backdrop-blur-xl rounded-3xl border border-white/[0.12] p-8 shadow-2xl shadow-black/20">
            {/* Tab Toggle */}
            {mode !== "forgot" && (
              <div className="flex mb-6 bg-white/[0.05] rounded-xl p-1">
                <button
                  type="button"
                  onClick={() => { setMode("login"); setError(null); setSuccess(null); }}
                  className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                    mode === "login"
                      ? "bg-gradient-to-r from-red-600 to-red-500 text-white shadow-lg shadow-red-500/25"
                      : "text-white/50 hover:text-white/70"
                  }`}
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => { setMode("register"); setError(null); setSuccess(null); }}
                  className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                    mode === "register"
                      ? "bg-gradient-to-r from-green-600 to-green-500 text-white shadow-lg shadow-green-500/25"
                      : "text-white/50 hover:text-white/70"
                  }`}
                >
                  Create Account
                </button>
              </div>
            )}

            <div className="text-center mb-6">
              <h2 className="text-xl font-bold text-white">
                {mode === "login" ? "Welcome back" : mode === "register" ? "Create Account" : "Reset Password"}
              </h2>
              <p className="text-sm text-white/40 mt-1">
                {mode === "login" ? "Sign in to your account to continue" : mode === "register" ? "Register for a new account" : forgotStep === "email" ? "Enter your registered email to receive OTP" : "Enter OTP and set your new password"}
              </p>
            </div>

            {/* Forgot Password Flow */}
            {mode === "forgot" && (
              <form onSubmit={forgotStep === "email" ? (e) => { e.preventDefault(); handleSendResetOtp(); } : handleResetPassword}>
                {error && (
                  <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-sm text-red-400 text-center">
                    {error}
                  </div>
                )}
                {success && (
                  <div className="mb-4 p-3 bg-green-500/10 border border-green-500/20 rounded-xl text-sm text-green-400 text-center">
                    {success}
                  </div>
                )}

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-white/70 mb-1.5">Email address</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your registered email"
                      disabled={forgotStep === "otp"}
                      className="w-full px-4 py-3 bg-white/[0.06] border border-white/[0.1] rounded-xl text-sm text-white placeholder:text-white/25 focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500/40 transition-all disabled:opacity-50"
                    />
                  </div>

                  {forgotStep === "otp" && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-white/70 mb-1.5">OTP Code</label>
                        <input
                          type="text"
                          value={otp}
                          onChange={(e) => setOtp(e.target.value)}
                          placeholder="Enter 6-digit OTP"
                          maxLength={6}
                          className="w-full px-4 py-3 bg-white/[0.06] border border-white/[0.1] rounded-xl text-sm text-white placeholder:text-white/25 focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500/40 transition-all text-center tracking-[0.5em] text-lg font-bold"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-white/70 mb-1.5">New Password</label>
                        <input
                          type="password"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          placeholder="Enter new password (min 6 characters)"
                          className="w-full px-4 py-3 bg-white/[0.06] border border-white/[0.1] rounded-xl text-sm text-white placeholder:text-white/25 focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500/40 transition-all"
                        />
                      </div>
                    </>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={loading || otpSending}
                  className="w-full mt-6 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-white font-semibold py-3 rounded-xl transition-all disabled:opacity-60 disabled:cursor-not-allowed text-sm flex items-center justify-center gap-2 shadow-lg shadow-amber-500/25"
                >
                  {otpSending ? (
                    <><Loader2 className="w-4 h-4 animate-spin" /> Sending OTP...</>
                  ) : loading ? (
                    <><Loader2 className="w-4 h-4 animate-spin" /> Resetting password...</>
                  ) : forgotStep === "email" ? (
                    "Send OTP"
                  ) : (
                    "Reset Password"
                  )}
                </button>

                {forgotStep === "otp" && (
                  <button
                    type="button"
                    onClick={handleSendResetOtp}
                    disabled={otpSending}
                    className="w-full mt-2 text-xs text-amber-400/70 hover:text-amber-400 transition-colors disabled:opacity-50"
                  >
                    Didn&apos;t receive OTP? Send again
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => { setMode("login"); setError(null); setSuccess(null); setForgotStep("email"); setOtp(""); setNewPassword(""); }}
                  className="w-full mt-3 text-sm text-white/40 hover:text-white/60 transition-colors"
                >
                  ← Back to Sign In
                </button>
              </form>
            )}

            {/* Login / Register Form */}
            {mode !== "forgot" && <form onSubmit={mode === "login" ? handleLogin : handleRegister}>
              {error && (
                <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-sm text-red-400 text-center">
                  {error}
                </div>
              )}
              {success && (
                <div className="mb-4 p-3 bg-green-500/10 border border-green-500/20 rounded-xl text-sm text-green-400 text-center">
                  {success}
                </div>
              )}

              <div className="space-y-4">
                {mode === "register" && (
                  <div>
                    <label className="block text-sm font-medium text-white/70 mb-1.5">
                      Full Name
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Enter your full name"
                      className="w-full px-4 py-3 bg-white/[0.06] border border-white/[0.1] rounded-xl text-sm text-white placeholder:text-white/25 focus:outline-none focus:ring-2 focus:ring-green-500/40 focus:border-green-500/40 transition-all"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-white/70 mb-1.5">
                    Email address
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    className={`w-full px-4 py-3 bg-white/[0.06] border border-white/[0.1] rounded-xl text-sm text-white placeholder:text-white/25 focus:outline-none focus:ring-2 transition-all ${
                      mode === "login" ? "focus:ring-red-500/40 focus:border-red-500/40" : "focus:ring-green-500/40 focus:border-green-500/40"
                    }`}
                  />
                </div>

                {mode === "register" && (
                  <div>
                    <label className="block text-sm font-medium text-white/70 mb-1.5">
                      Phone Number <span className="text-white/30">(optional)</span>
                    </label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="Enter your phone number"
                      className="w-full px-4 py-3 bg-white/[0.06] border border-white/[0.1] rounded-xl text-sm text-white placeholder:text-white/25 focus:outline-none focus:ring-2 focus:ring-green-500/40 focus:border-green-500/40 transition-all"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-white/70 mb-1.5">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter your password"
                      className="w-full px-4 py-3 bg-white/[0.06] border border-white/[0.1] rounded-xl text-sm text-white placeholder:text-white/25 focus:outline-none focus:ring-2 focus:ring-red-500/40 focus:border-red-500/40 transition-all pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        {showPassword ? (
                          <>
                            <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                            <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                            <line x1="1" y1="1" x2="23" y2="23" />
                          </>
                        ) : (
                          <>
                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                            <circle cx="12" cy="12" r="3" />
                          </>
                        )}
                      </svg>
                    </button>
                  </div>
                </div>
              </div>

              {mode === "login" && (
                <div className="text-right mt-2">
                  <button
                    type="button"
                    onClick={() => { setMode("forgot"); setError(null); setSuccess(null); setForgotStep("email"); }}
                    className="text-xs text-amber-400/70 hover:text-amber-400 transition-colors"
                  >
                    Forgot Password?
                  </button>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className={`w-full mt-6 text-white font-semibold py-3 rounded-xl transition-all disabled:opacity-60 disabled:cursor-not-allowed text-sm flex items-center justify-center gap-2 ${
                  mode === "login"
                    ? "bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 shadow-lg shadow-red-500/25 hover:shadow-red-500/40"
                    : "bg-gradient-to-r from-green-600 to-green-500 hover:from-green-500 hover:to-green-400 shadow-lg shadow-green-500/25 hover:shadow-green-500/40"
                }`}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    {mode === "login" ? "Signing in..." : "Creating account..."}
                  </>
                ) : (
                  mode === "login" ? "Sign in" : "Create Account"
                )}
              </button>
            </form>}

            {mode !== "forgot" && (<div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/[0.08]" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-transparent px-3 text-white/30">or</span>
              </div>
            </div>)}

            {mode !== "forgot" && <button
              onClick={handleGoogleLogin}
              disabled={googleLoading}
              className="w-full flex items-center justify-center gap-3 bg-white/[0.06] border border-white/[0.1] hover:bg-white/[0.1] py-3 rounded-xl text-sm font-medium text-white/80 transition-all disabled:opacity-60"
            >
              <svg width="18" height="18" viewBox="0 0 24 24">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
              {googleLoading ? "Connecting..." : "Sign in with Google"}
            </button>}
          </div>

          <p className="text-center text-xs text-white/25 mt-4">
            {mode === "login" ? (
              <>Don&apos;t have an account? <button type="button" onClick={() => { setMode("register"); setError(null); setSuccess(null); }} className="text-green-400/70 hover:text-green-400 underline">Create one</button></>
            ) : (
              <>Already have an account? <button type="button" onClick={() => { setMode("login"); setError(null); setSuccess(null); }} className="text-red-400/70 hover:text-red-400 underline">Sign in</button></>
            )}
          </p>
          <p className="text-center text-xs text-white/20 mt-3">
            <a href="/privacy-policy" target="_blank" className="hover:text-white/40 underline">Privacy Policy</a>
          </p>
        </div>
      </div>
    </div>
  );
}
