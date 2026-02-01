"use client";

import { useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

const KINGSCHAT_CLIENT_ID = process.env.NEXT_PUBLIC_KINGSCHAT_CLIENT_ID || "com.kingschat";
const KINGSCHAT_AUTH_URL = "https://accounts.kingsch.at";
const KINGSCHAT_LOGO_URL = "https://play-lh.googleusercontent.com/0goT6OAnyw-TR_KuUdvPEeEir9yscsHHfgttBZV0HcjH7TY45oxF6_uayznLTRZ4UDPb";
const APP_BASE_URL = process.env.NEXT_PUBLIC_APP_URL || "";

interface KingsChatLoginProps {
  disabled?: boolean;
  className?: string;
}

export function KingsChatLogin({
  disabled = false,
  className,
}: KingsChatLoginProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleKingsChatLogin = () => {
    setIsLoading(true);

    const baseUrl = APP_BASE_URL || window.location.origin;
    const callbackUrl = `${baseUrl}/api/auth/kingschat/callback?redirect=/auth/kingschat-callback`;

    const scopes = JSON.stringify(["profile", "email"]);

    const params = new URLSearchParams({
      client_id: KINGSCHAT_CLIENT_ID,
      scopes: scopes,
      redirect_uri: callbackUrl,
      response_type: "token",
      post_redirect: "true",
    });

    const authUrl = `${KINGSCHAT_AUTH_URL}?${params.toString()}`;
    window.location.href = authUrl;
  };

  return (
    <Button
      type="button"
      className={`w-full bg-[#0066FF] hover:bg-[#0052CC] text-white ${className}`}
      onClick={handleKingsChatLogin}
      disabled={disabled || isLoading}
      size="lg"
    >
      {isLoading ? (
        <>
          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
          Connecting...
        </>
      ) : (
        <>
          <Image
            src={KINGSCHAT_LOGO_URL}
            alt="KingsChat"
            width={20}
            height={20}
            className="mr-2 rounded"
            unoptimized
          />
          Continue with KingsChat
        </>
      )}
    </Button>
  );
}
