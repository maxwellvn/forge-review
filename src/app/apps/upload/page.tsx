"use client";

import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import { motion } from "framer-motion";
import { Upload } from "lucide-react";
import { AppUploadForm } from "@/components/upload/AppUploadForm";
import { Skeleton } from "@/components/ui/skeleton";

export default function UploadPage() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return (
      <div className="container py-12">
        <Skeleton className="h-8 w-64 mb-8" />
        <Skeleton className="h-[600px]" />
      </div>
    );
  }

  if (!session) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 py-12">
      <div className="container max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 mb-6">
            <Upload className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-3xl font-bold mb-3">Submit Your App</h1>
          <p className="text-muted-foreground max-w-lg mx-auto">
            Share your digital product with our community. Fill out the form below and 
            our moderators will review your submission.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <AppUploadForm />
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-12 text-center text-sm text-muted-foreground"
        >
          <p>
            By submitting, you agree to our{" "}
            <a href="/guidelines" className="text-primary hover:underline">
              Community Guidelines
            </a>{" "}
            and{" "}
            <a href="/terms" className="text-primary hover:underline">
              Terms of Service
            </a>
          </p>
        </motion.div>
      </div>
    </div>
  );
}