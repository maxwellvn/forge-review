"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Upload, User, LogOut, Shield, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";

const navLinks = [
  { href: "/", label: "Discover" },
  { href: "/trending", label: "Trending" },
  { href: "/community", label: "Community" },
];

const roleBadgeConfig: Record<string, { label: string; color: string }> = {
  admin: { label: "A", color: "bg-red-600 text-white" },
  moderator: { label: "M", color: "bg-orange-500 text-white" },
  super_reviewer: { label: "SR", color: "bg-purple-500 text-white" },
  verified_reviewer: { label: "VR", color: "bg-blue-500 text-white" },
};

interface SearchResult {
  _id: string;
  title: string;
  shortDescription: string;
  iconUrl?: string;
  category: string;
}

export function Navbar() {
  const { data: session } = useSession();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [desktopSearchFocused, setDesktopSearchFocused] = useState(false);
  const desktopSearchRef = useRef<HTMLDivElement>(null);
  const searchTimeout = useRef<NodeJS.Timeout | null>(null);

  // Close desktop search dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (desktopSearchRef.current && !desktopSearchRef.current.contains(event.target as Node)) {
        setDesktopSearchFocused(false);
        setSearchResults([]);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Search with debounce
  useEffect(() => {
    if (searchTimeout.current) {
      clearTimeout(searchTimeout.current);
    }

    if (searchQuery.trim().length < 2) {
      setSearchResults([]);
      return;
    }

    searchTimeout.current = setTimeout(async () => {
      setIsSearching(true);
      try {
        const res = await fetch(`/api/apps?search=${encodeURIComponent(searchQuery)}&limit=5`);
        const data = await res.json();
        setSearchResults(data.apps || []);
      } catch (error) {
        console.error("Search error:", error);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => {
      if (searchTimeout.current) {
        clearTimeout(searchTimeout.current);
      }
    };
  }, [searchQuery]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setMobileSearchOpen(false);
      setDesktopSearchFocused(false);
      setSearchQuery("");
      setSearchResults([]);
    }
  };

  const handleResultClick = (appId: string) => {
    router.push(`/apps/${appId}`);
    setMobileSearchOpen(false);
    setDesktopSearchFocused(false);
    setSearchQuery("");
    setSearchResults([]);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background">
      <div className="container flex h-14 md:h-16 items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <Image
            src="/logo.webp"
            alt="APP Review Logo"
            width={32}
            height={32}
            className="h-8 w-8 object-contain"
          />
          <span className="text-xl font-bold">App Review</span>
        </Link>

        {/* Desktop Navigation - hidden on mobile */}
        <nav className="hidden md:flex items-center gap-6">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-muted-foreground hover:text-foreground"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Right side actions */}
        <div className="flex items-center gap-2">
          {/* Desktop Search - hidden on mobile */}
          <div ref={desktopSearchRef} className="relative hidden md:block">
            <form onSubmit={handleSearchSubmit}>
              <div className="flex items-center h-9 w-60 rounded-md border border-input bg-background px-3">
                <Search className="h-4 w-4 text-muted-foreground mr-2" />
                <input
                  type="text"
                  placeholder="Search apps..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => setDesktopSearchFocused(true)}
                  className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                />
              </div>
            </form>

            {/* Desktop Search Dropdown */}
            {desktopSearchFocused && (searchResults.length > 0 || isSearching) && (
              <div className="absolute top-full left-0 mt-2 w-80 bg-background border border-border rounded-lg shadow-lg z-50">
                {isSearching ? (
                  <div className="p-4 text-center text-sm text-muted-foreground">Searching...</div>
                ) : (
                  <div className="max-h-80 overflow-y-auto">
                    {searchResults.map((app) => (
                      <div
                        key={app._id}
                        onClick={() => handleResultClick(app._id)}
                        className="flex items-center gap-3 p-3 hover:bg-muted cursor-pointer"
                      >
                        <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center overflow-hidden">
                          {app.iconUrl ? (
                            <img src={app.iconUrl} alt="" className="h-full w-full object-cover" />
                          ) : (
                            <span className="text-sm font-bold">{app.title[0]}</span>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">{app.title}</p>
                          <p className="text-xs text-muted-foreground truncate">{app.shortDescription}</p>
                        </div>
                      </div>
                    ))}
                    <div
                      onClick={() => handleSearchSubmit({ preventDefault: () => {} } as React.FormEvent)}
                      className="p-3 text-center text-sm text-primary hover:bg-muted cursor-pointer border-t"
                    >
                      View all results →
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Mobile Search Button - visible only on mobile */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setMobileSearchOpen(!mobileSearchOpen)}
          >
            <Search className="h-5 w-5" />
          </Button>

          {/* Submit Button - hidden on small mobile */}
          {session && (
            <Link href="/apps/upload" className="hidden sm:block">
              <Button variant="outline" size="sm">
                <Upload className="h-4 w-4 mr-2" />
                <span className="hidden lg:inline">Submit</span>
              </Button>
            </Link>
          )}

          {/* User Menu or Sign In */}
          {session ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-9 w-9 rounded-full p-0">
                  <Avatar className="h-9 w-9">
                    <AvatarImage src={session.user.image || ""} />
                    <AvatarFallback>{session.user.name?.[0] || "U"}</AvatarFallback>
                  </Avatar>
                  {session.user.role !== "user" && roleBadgeConfig[session.user.role] && (
                    <Badge className={`absolute -bottom-1 -right-1 h-4 px-1 text-[10px] ${roleBadgeConfig[session.user.role].color}`}>
                      {roleBadgeConfig[session.user.role].label}
                    </Badge>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <div className="flex items-center gap-2 p-2">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={session.user.image || ""} />
                    <AvatarFallback>{session.user.name?.[0] || "U"}</AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col">
                    <p className="text-sm font-medium truncate">{session.user.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{session.user.email}</p>
                  </div>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/profile"><User className="h-4 w-4 mr-2" />Profile</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild className="sm:hidden">
                  <Link href="/apps/upload"><Upload className="h-4 w-4 mr-2" />Submit App</Link>
                </DropdownMenuItem>
                {(session.user.role === "admin" || session.user.role === "moderator") && (
                  <DropdownMenuItem asChild>
                    <Link href="/admin"><Shield className="h-4 w-4 mr-2" />Admin Panel</Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => signOut()} className="text-destructive">
                  <LogOut className="h-4 w-4 mr-2" />Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Link href="/login">
              <Button size="sm">Sign In</Button>
            </Link>
          )}

          {/* Mobile Menu Button - visible only on mobile */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile Search Bar */}
      {mobileSearchOpen && (
        <div className="md:hidden border-t border-border p-4 bg-muted/50">
          <form onSubmit={handleSearchSubmit}>
            <div className="flex items-center gap-3">
              <div className="flex items-center flex-1 h-10 bg-background rounded-lg px-4 gap-2">
                <Search className="h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search apps..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1 bg-transparent text-sm outline-none"
                  autoFocus
                />
              </div>
              <Button type="button" variant="ghost" size="sm" onClick={() => setMobileSearchOpen(false)}>
                Cancel
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-border">
          <nav className="container py-4 flex flex-col gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted rounded-md"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}
