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
    <div className="container flex items-center justify-center min-h-[calc(100vh-200px)] sm:min-h-[80vh] px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-sm sm:max-w-md"
      >
        <Card className="border-2">
          <CardHeader className="text-center space-y-3 sm:space-y-4 pt-6 sm:pt-8">
            <div className="mx-auto w-12 h-12 sm:w-16 sm:h-16 flex items-center justify-center">
              <Image
                src="/logo.webp"
                alt="APP Review Logo"
                width={64}
                height={64}
                className="object-contain w-full h-full"
              />
            </div>
            <div>
              <CardTitle className="text-xl sm:text-2xl">Welcome to APP Review</CardTitle>
              <CardDescription className="text-xs sm:text-sm mt-1 sm:mt-2">
                Sign in to submit apps, write reviews, and join our community
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-3 sm:space-y-4 px-4 sm:px-6 pb-6 sm:pb-8">
            <KingsChatLogin />

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-[10px] sm:text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                  or
                </span>
              </div>
            </div>

            <Button
              onClick={() => signIn("google", { callbackUrl: "/" })}
              className="w-full gap-2 text-sm"
              variant="outline"
              size="lg"
            >
              <Chrome className="h-4 w-4 sm:h-5 sm:w-5" />
              Continue with Google
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-[10px] sm:text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                  By continuing, you agree to our
                </span>
              </div>
            </div>

            <p className="text-center text-xs sm:text-sm text-muted-foreground">
              <a href="/terms" className="text-primary hover:underline">Terms</a>
              {" "}&{" "}
              <a href="/privacy" className="text-primary hover:underline">Privacy</a>
            </p>
          </CardContent>
        </Card>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-6 sm:mt-8 text-center"
        >
          <p className="text-xs sm:text-sm text-muted-foreground px-4">
            Join over 10,000+ reviewers in our trusted community
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
}