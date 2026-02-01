"use client";

import { useSession, signIn } from "next-auth/react";
import { redirect } from "next/navigation";
import { motion } from "framer-motion";
import { Chrome } from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { KingsChatLogin } from "@/components/auth/KingsChatLogin";

export default function LoginPage() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return (
      <div className="container flex items-center justify-center min-h-[80vh]">
        <Skeleton className="h-[400px] w-full max-w-md" />
      </div>
    );
  }

  if (session) {
    redirect("/");
  }

  return (
    <div className="container flex items-center justify-center min-h-[80vh] px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <Card className="border-2">
          <CardHeader className="text-center space-y-4">
            <div className="mx-auto w-16 h-16 flex items-center justify-center">
              <Image
                src="/logo.webp"
                alt="APP Review Logo"
                width={64}
                height={64}
                className="object-contain"
              />
            </div>
            <div>
              <CardTitle className="text-2xl">Welcome to APP Review</CardTitle>
              <CardDescription>
                Sign in to submit apps, write reviews, and join our community
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <KingsChatLogin />

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                  or
                </span>
              </div>
            </div>

            <Button
              onClick={() => signIn("google", { callbackUrl: "/" })}
              className="w-full gap-2"
              variant="outline"
              size="lg"
            >
              <Chrome className="h-5 w-5" />
              Continue with Google
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                  By continuing, you agree to our
                </span>
              </div>
            </div>

            <p className="text-center text-sm text-muted-foreground">
              <a href="/terms" className="text-primary hover:underline">Terms of Service</a>
              {" "}&{" "}
              <a href="/privacy" className="text-primary hover:underline">Privacy Policy</a>
            </p>
          </CardContent>
        </Card>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-8 text-center"
        >
          <p className="text-sm text-muted-foreground">
            Join over 10,000+ reviewers in our trusted community
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
}