"use client";

import { useState } from "react";
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
  Menu,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";

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

function SidebarContent({ pathname, isAdmin, onNavigate }: { pathname: string; isAdmin: boolean; onNavigate?: () => void }) {
  return (
    <>
      {/* Logo */}
      <div className="flex h-16 items-center justify-between border-b px-4 sm:px-6">
        <Link href="/admin" className="flex items-center gap-2" onClick={onNavigate}>
          <Shield className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
          <span className="font-bold text-sm sm:text-base">Admin Panel</span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 p-3 sm:p-4 overflow-y-auto">
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
              onClick={onNavigate}
              className={cn(
                "flex items-center gap-2 sm:gap-3 rounded-lg px-2 sm:px-3 py-2 text-sm font-medium transition-colors min-h-[44px]",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              )}
            >
              <Icon className="h-4 w-4 flex-shrink-0" />
              <span className="truncate">{link.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Back to site */}
      <div className="border-t p-3 sm:p-4">
        <Link href="/" onClick={onNavigate}>
          <Button variant="ghost" className="w-full justify-start gap-2 text-sm">
            <ChevronLeft className="h-4 w-4" />
            Back to Site
          </Button>
        </Link>
      </div>
    </>
  );
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
          {/* Desktop Sidebar Skeleton */}
          <aside className="desktop-sidebar hidden lg:block fixed left-0 top-0 z-40 h-screen w-64 border-r bg-card">
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
          {/* Mobile Header Skeleton */}
          <div className="mobile-header lg:hidden fixed top-0 left-0 right-0 z-40 h-14 border-b bg-card px-4 flex items-center justify-between">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-10 w-10" />
          </div>
          <main className="admin-content flex-1 min-h-screen">
            <div className="p-4 sm:p-6 lg:p-8">
              <Skeleton className="h-8 w-48 mb-8" />
              <Skeleton className="h-64 w-full" />
            </div>
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
        {/* Desktop Sidebar */}
        <aside className="desktop-sidebar hidden lg:block fixed left-0 top-0 z-40 h-screen w-64 border-r bg-card">
          <div className="flex h-full flex-col">
            <SidebarContent pathname={pathname} isAdmin={isAdmin} />
          </div>
        </aside>

        {/* Mobile Header */}
        <div className="mobile-header lg:hidden fixed top-0 left-0 right-0 z-40 h-14 border-b bg-card px-4 flex items-center justify-between">
          <Link href="/admin" className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            <span className="font-bold text-sm">Admin Panel</span>
          </Link>
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="h-9 w-9">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-64 p-0">
              <div className="flex h-full flex-col">
                <SidebarContent 
                  pathname={pathname} 
                  isAdmin={isAdmin} 
                  onNavigate={() => setMobileMenuOpen(false)} 
                />
              </div>
            </SheetContent>
          </Sheet>
        </div>

        {/* Main content */}
        <main className="admin-content flex-1 min-h-screen">
          <div className="p-4 sm:p-6 lg:p-8">{children}</div>
        </main>
      </div>
    </div>
  );
}
