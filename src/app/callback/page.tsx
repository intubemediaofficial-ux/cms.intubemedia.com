"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Suspense } from "react";
import { CheckCircle, XCircle, Loader2, ArrowLeft, AlertTriangle } from "lucide-react";
import Link from "next/link";

interface ChannelInfo {
  channelId: string;
  channelTitle: string;
  subscribers: number;
  totalViews: number;
  totalVideos: number;
  thumbnail: string;
}

function CallbackContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [channelInfo, setChannelInfo] = useState<ChannelInfo | null>(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [kvConfigured, setKvConfigured] = useState<boolean | null>(null);
  const [quotaWarning, setQuotaWarning] = useState(false);
  const [channelMismatch, setChannelMismatch] = useState(false);
  const [mismatchMessage, setMismatchMessage] = useState("");
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    const code = searchParams.get("code");
    const state = searchParams.get("state");
    const error = searchParams.get("error");

    if (error) {
      setStatus("error");
      setErrorMessage(error === "access_denied"
        ? "Access denied. The channel owner did not grant permission."
        : `OAuth error: ${error}`);
      return;
    }

    if (!code || !state) {
      setStatus("error");
      setErrorMessage("Missing authorization code or state parameter.");
      return;
    }

    // State is the channel ID directly (e.g. UCJL86UBFftNd1BoHAvxgT7Q)
    if (
      !state.startsWith("UC") &&
      !state.startsWith("youtube-auth-") &&
      !state.startsWith("cms-oauth-")
    ) {
      setStatus("error");
      setErrorMessage("Invalid state parameter.");
      return;
    }

    // Exchange code for tokens via API
    async function exchangeCode() {
      try {
        const response = await fetch("/api/channel-tokens/exchange", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ code, state, redirectUri: `${window.location.origin}/callback` }),
        });

        const result = await response.json();
        if (!response.ok) {
          setStatus("error");
          setErrorMessage(result.error || "Failed to exchange authorization code.");
          return;
        }

        setChannelInfo(result.data.channelInfo);
        setKvConfigured(result.data.kvConfigured ?? null);
        setQuotaWarning(result.data.quotaWarning ?? false);
        if (result.data.channelMismatch && result.data.channelMismatchDetails) {
          setChannelMismatch(true);
          setMismatchMessage(result.data.channelMismatchDetails.message);
        }
        setStatus("success");
      } catch {
        setStatus("error");
        setErrorMessage("Failed to process authorization. Please try again.");
      }
    }

    exchangeCode();
  }, [searchParams]);

  // Auto-redirect to channels page after successful token validation
  useEffect(() => {
    if (status !== "success") return;
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          router.push("/channels");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [status, router]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-lg w-full">
        <div className="bg-white rounded-xl shadow-lg p-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">YouTube OAuth2 Callback</h1>
          <p className="text-gray-500 text-sm mb-6">{status === "error" ? "Failed to process authorization callback" : status === "success" ? "Successfully processed YouTube authorization callback" : "Processing..."}</p>

          {status === "loading" && (
            <div className="flex flex-col items-center py-8">
              <Loader2 className="w-10 h-10 text-blue-500 animate-spin mb-4" />
              <p className="text-gray-600">Processing authorization...</p>
            </div>
          )}

          {status === "success" && (
            <>
              <div className="bg-green-50 border border-green-200 rounded-lg px-4 py-3 mb-4">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span className="text-green-700 font-medium">YouTube OAuth2 callback processed successfully</span>
                </div>
                <p className="text-sm text-green-600 mt-1">Token validated and stored. Redirecting to Channels page in {countdown}s...</p>
              </div>
              {channelMismatch && (
                <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 mb-4">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-semibold text-red-700">Wrong Google Account!</p>
                      <p className="text-sm text-red-600 mt-1">{mismatchMessage}</p>
                      <p className="text-sm text-red-600 mt-2">
                        <strong>Fix:</strong> Go to Channels → Delete this channel → Re-add it → Validate with the correct Google account that OWNS this channel.
                      </p>
                    </div>
                  </div>
                </div>
              )}
              {quotaWarning && (
                <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 mb-4">
                  <p className="text-sm text-amber-700">
                    <strong>Note:</strong> YouTube API quota limit reached — channel details could not be loaded right now. But your <strong>token has been saved successfully</strong>. Channel info will load automatically when quota resets (usually within 24 hours).
                  </p>
                </div>
              )}
              {kvConfigured === false && (
                <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 mb-4">
                  <p className="text-sm text-amber-700">
                    <strong>Warning:</strong> Persistent storage (Vercel KV) is not configured. Token will be lost on next deployment. Please set up Vercel KV.
                  </p>
                </div>
              )}

              {channelInfo && (
                <div className="border border-gray-200 rounded-lg p-5">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">Channel Information</h2>
                  <div className="flex items-start gap-4">
                    <div className="flex-1 space-y-2">
                      <div>
                        <span className="font-medium text-gray-700">Channel ID:</span>{" "}
                        <span className="text-gray-900">{channelInfo.channelId}</span>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">Channel Title:</span>{" "}
                        <span className="text-gray-900">{channelInfo.channelTitle}</span>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">Subscribers:</span>{" "}
                        <span className="text-gray-900">{channelInfo.subscribers.toLocaleString()}</span>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">Total Views:</span>{" "}
                        <span className="text-gray-900">{channelInfo.totalViews.toLocaleString()}</span>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">Total Videos:</span>{" "}
                        <span className="text-gray-900">{channelInfo.totalVideos.toLocaleString()}</span>
                      </div>
                    </div>
                    {channelInfo.thumbnail && (
                      <img
                        src={channelInfo.thumbnail}
                        alt={channelInfo.channelTitle}
                        className="w-20 h-20 rounded-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    )}
                  </div>
                </div>
              )}
            </>
          )}

          {status === "error" && (
            <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 mb-6">
              <div className="flex items-center gap-2">
                <XCircle className="w-5 h-5 text-red-600" />
                <span className="text-red-700 font-medium">{errorMessage}</span>
              </div>
            </div>
          )}

          <div className="mt-6 flex justify-end gap-3">
            <Link
              href="/channels"
              className="inline-flex items-center gap-2 bg-primary text-white px-5 py-2.5 rounded-lg hover:bg-primary/90 transition-colors font-medium"
            >
              <ArrowLeft className="w-4 h-4" />
              Go to Channels
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
        </div>
      }
    >
      <CallbackContent />
    </Suspense>
  );
}
