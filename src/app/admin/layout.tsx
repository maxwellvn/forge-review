"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  AppWindow,
  MessageSquare,
  MessagesSquare,
  Tags,
  Settings,
  Shield,
  ChevronLeft,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

const sidebarLinks = [
  {
    href: "/admin",
    label: "Dashboard",
    icon: LayoutDashboard,
  },
  {
    href: "/admin/users",
    label: "Users",
    icon: Users,
  },
  {
    href: "/admin/apps",
    label: "Apps",
    icon: AppWindow,
  },
  {
    href: "/admin/reviews",
    label: "Reviews",
    icon: MessageSquare,
  },
  {
    href: "/admin/discussions",
    label: "Discussions",
    icon: MessagesSquare,
  },
  {
    href: "/admin/categories",
    label: "Categories",
    icon: Tags,
  },
  {
    href: "/admin/moderators",
    label: "Moderators",
    icon: Shield,
  },
  {
    href: "/admin/settings",
    label: "Settings",
    icon: Settings,
  },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (status === "loading") return;

    if (!session) {
      router.push("/login");
      return;
    }

    if (session.user.role !== "admin" && session.user.role !== "moderator") {
      router.push("/");
      return;
    }
  }, [session, status, router]);

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-background">
        <div className="flex">
          <aside className="fixed left-0 top-0 z-40 h-screen w-64 border-r bg-card">
            <div className="flex h-full flex-col">
              <div className="flex h-16 items-center border-b px-6">
                <Skeleton className="h-6 w-32" />
              </div>
              <nav className="flex-1 space-y-1 p-4">
                {[...Array(6)].map((_, i) => (
                  <Skeleton key={i} className="h-10 w-full" />
                ))}
              </nav>
            </div>
          </aside>
          <main className="ml-64 flex-1 p-8">
            <Skeleton className="h-8 w-48 mb-8" />
            <Skeleton className="h-64 w-full" />
          </main>
        </div>
      </div>
    );
  }

  if (!session || (session.user.role !== "admin" && session.user.role !== "moderator")) {
    return null;
  }

  const isAdmin = session.user.role === "admin";

  return (
    <div className="min-h-screen bg-background">
      <div className="flex">
        {/* Sidebar */}
        <aside className="fixed left-0 top-0 z-40 h-screen w-64 border-r bg-card">
          <div className="flex h-full flex-col">
            {/* Logo */}
            <div className="flex h-16 items-center justify-between border-b px-6">
              <Link href="/admin" className="flex items-center gap-2">
                <Shield className="h-6 w-6 text-primary" />
                <span className="font-bold">Admin Panel</span>
              </Link>
            </div>

            {/* Navigation */}
            <nav className="flex-1 space-y-1 p-4">
              {sidebarLinks.map((link) => {
                const isActive = pathname === link.href;
                const Icon = link.icon;

                // Only show certain pages to admins
                if (
                  (link.href === "/admin/moderators" ||
                   link.href === "/admin/settings" ||
                   link.href === "/admin/categories") &&
                  !isAdmin
                ) {
                  return null;
                }

                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                      isActive
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    {link.label}
                  </Link>
                );
              })}
            </nav>

            {/* Back to site */}
            <div className="border-t p-4">
              <Link href="/">
                <Button variant="ghost" className="w-full justify-start gap-2">
                  <ChevronLeft className="h-4 w-4" />
                  Back to Site
                </Button>
              </Link>
            </div>
          </div>
        </aside>

        {/* Main content */}
        <main className="ml-64 flex-1 min-h-screen">
          <div className="p-8">{children}</div>
        </main>
      </div>
    </div>
  );
}
