"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, AlertCircle, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

const KINGSCHAT_LOGO_URL = "https://play-lh.googleusercontent.com/0goT6OAnyw-TR_KuUdvPEeEir9yscsHHfgttBZV0HcjH7TY45oxF6_uayznLTRZ4UDPb";

function KingsChatCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const handleCallback = async () => {
      const error = searchParams.get("error");
      if (error) {
        setStatus("error");
        setErrorMessage(
          error === "no_token"
            ? "No authentication token received from KingsChat"
            : "Authentication failed. Please try again."
        );
        return;
      }

      const accessToken = searchParams.get("access_token");
      const refreshToken = searchParams.get("refresh_token");

      if (!accessToken) {
        setStatus("error");
        setErrorMessage("No access token received. Please try again.");
        return;
      }

      try {
        const response = await fetch("/api/auth/kingschat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            accessToken,
            refreshToken: refreshToken || undefined,
          }),
        });

        const data = await response.json();

        if (data.success) {
          setStatus("success");
          // Use hard redirect to ensure NextAuth picks up the new session cookie
          setTimeout(() => {
            window.location.href = "/";
          }, 1000);
        } else {
          setStatus("error");
          setErrorMessage(data.error || "Authentication failed. Please try again.");
        }
      } catch (err) {
        console.error("KingsChat auth error:", err);
        setStatus("error");
        setErrorMessage("An error occurred during authentication. Please try again.");
      }
    };

    handleCallback();
  }, [searchParams, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-4 text-center">
          <div className="flex justify-center">
            <Image
              src={KINGSCHAT_LOGO_URL}
              alt="KingsChat"
              width={64}
              height={64}
              className="rounded-xl"
              unoptimized
            />
          </div>

          {status === "loading" && (
            <>
              <CardTitle className="text-xl">Signing in with KingsChat</CardTitle>
              <CardDescription>
                Please wait while we complete your authentication...
              </CardDescription>
            </>
          )}

          {status === "success" && (
            <>
              <div className="flex justify-center">
                <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
              </div>
              <CardTitle className="text-xl">Successfully signed in!</CardTitle>
              <CardDescription>Redirecting you to the homepage...</CardDescription>
            </>
          )}

          {status === "error" && (
            <>
              <div className="flex justify-center">
                <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center">
                  <AlertCircle className="h-6 w-6 text-red-600" />
                </div>
              </div>
              <CardTitle className="text-xl">Authentication Failed</CardTitle>
              <CardDescription>{errorMessage}</CardDescription>
            </>
          )}
        </CardHeader>

        <CardContent className="flex flex-col items-center gap-4">
          {status === "loading" && (
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          )}

          {status === "error" && (
            <div className="flex flex-col gap-2 w-full">
              <Link href="/login">
                <Button className="w-full">Try Again</Button>
              </Link>
              <Link href="/">
                <Button variant="outline" className="w-full">
                  Back to Home
                </Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default function KingsChatCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-background">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      }
    >
      <KingsChatCallbackContent />
    </Suspense>
  );
}
