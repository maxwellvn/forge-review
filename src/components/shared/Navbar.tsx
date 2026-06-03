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
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const searchTimeout = useRef<NodeJS.Timeout | null>(null);

  // Close search when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setSearchOpen(false);
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
      setSearchOpen(false);
      setSearchQuery("");
      setSearchResults([]);
    }
  };

  const handleResultClick = (appId: string) => {
    router.push(`/apps/${appId}`);
    setSearchOpen(false);
    setSearchQuery("");
    setSearchResults([]);
  };

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className="sticky top-0 z-50 w-full border-b border-border bg-background"
    >
      <div className="container flex h-14 md:h-16 items-center gap-4">
        {/* Logo + Desktop Nav */}
        <div className="flex items-center gap-4 lg:gap-8 shrink-0">
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center gap-2"
            >
              <Image
                src="/logo.webp"
                alt="APP Review Logo"
                width={32}
                height={32}
                className="h-8 w-8 object-contain"
              />
              <h1 className="text-xl font-bold tracking-tight">App Review</h1>
            </motion.div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="desktop-nav hidden md:flex items-center gap-4 lg:gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Right side */}
        <div className="flex items-center gap-2 md:gap-3">
          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="sm"
            className="mobile-menu-button md:hidden h-9 w-9 p-0"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>

          {/* Mobile Search Button */}
          <Button
            variant="ghost"
            size="sm"
            className="mobile-menu-button md:hidden h-9 w-9 p-0"
            onClick={() => setSearchOpen(!searchOpen)}
          >
            <Search className="h-5 w-5" />
          </Button>

          {/* Desktop Search */}
          <div ref={searchRef} className="desktop-block relative hidden md:block shrink-0">
            <form onSubmit={handleSearchSubmit}>
              <div className="flex items-center h-9 w-[160px] lg:w-[240px] rounded-md border border-input bg-background px-3 gap-2">
                <Search className="h-4 w-4 text-muted-foreground shrink-0" />
                <input
                  type="text"
                  placeholder="Search apps..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => setSearchOpen(true)}
                  className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                />
              </div>
            </form>

            {/* Search Results Dropdown */}
            <AnimatePresence>
              {searchOpen && (searchResults.length > 0 || isSearching) && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute top-full left-0 mt-2 w-[320px] bg-background border border-border rounded-lg shadow-lg overflow-hidden z-50"
                >
                  {isSearching ? (
                    <div className="p-4 text-center text-sm text-muted-foreground">
                      Searching...
                    </div>
                  ) : (
                    <div className="max-h-[300px] overflow-y-auto">
                      {searchResults.map((app) => (
                        <div
                          key={app._id}
                          onClick={() => handleResultClick(app._id)}
                          role="button"
                          tabIndex={0}
                          onKeyDown={(e) => e.key === 'Enter' && handleResultClick(app._id)}
                          className="flex items-center gap-3 p-3 hover:bg-muted transition-colors cursor-pointer"
                        >
                          <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center shrink-0 overflow-hidden">
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
                          <Badge variant="outline" className="text-xs shrink-0">
                            {app.category}
                          </Badge>
                        </div>
                      ))}
                      <div
                        onClick={() => {
                          router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
                          setSearchOpen(false);
                          setSearchQuery("");
                          setSearchResults([]);
                        }}
                        role="button"
                        tabIndex={0}
                        className="p-3 text-center text-sm text-primary hover:bg-muted transition-colors border-t cursor-pointer"
                      >
                        View all results →
                      </div>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {session ? (
            <>
              {/* Submit App Button - Desktop only */}
              <Link href="/apps/upload" className="desktop-block-sm hidden sm:block">
                <Button variant="outline" size="sm" className="h-9 gap-2">
                  <Upload className="h-4 w-4" />
                  <span className="hidden lg:inline">Submit</span>
                </Button>
              </Link>

              {/* User Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-9 w-9 rounded-full p-0">
                    <Avatar className="h-9 w-9 ring-2 ring-border">
                      <AvatarImage src={session.user.image || ""} alt={session.user.name || ""} />
                      <AvatarFallback className="text-xs">{session.user.name?.[0] || "U"}</AvatarFallback>
                    </Avatar>
                    {session.user.role !== "user" && roleBadgeConfig[session.user.role] && (
                      <Badge
                        className={`absolute -bottom-1 -right-1 h-4 min-w-[16px] px-1 text-[10px] border-0 ${roleBadgeConfig[session.user.role].color}`}
                      >
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
                    <div className="flex flex-col overflow-hidden">
                      <p className="text-sm font-medium truncate">{session.user.name}</p>
                      <p className="text-xs text-muted-foreground truncate">{session.user.email}</p>
                    </div>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/profile" className="flex items-center gap-2 cursor-pointer">
                      <User className="h-4 w-4" />
                      Profile
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild className="sm:hidden">
                    <Link href="/apps/upload" className="flex items-center gap-2 cursor-pointer">
                      <Upload className="h-4 w-4" />
                      Submit App
                    </Link>
                  </DropdownMenuItem>
                  {(session.user.role === "admin" || session.user.role === "moderator") && (
                    <DropdownMenuItem asChild>
                      <Link href="/admin" className="flex items-center gap-2 cursor-pointer">
                        <Shield className="h-4 w-4" />
                        Admin Panel
                      </Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => signOut()}
                    className="flex items-center gap-2 cursor-pointer text-destructive"
                  >
                    <LogOut className="h-4 w-4" />
                    Sign out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <Link href="/login">
              <Button size="sm" className="h-9">
                Sign In
              </Button>
            </Link>
          )}

        </div>
      </div>

      {/* Mobile Search Bar */}
      <AnimatePresence>
        {searchOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="md:hidden border-t border-border bg-muted/50 overflow-hidden"
          >
            <form onSubmit={handleSearchSubmit} className="p-4">
              <div className="flex items-center gap-3">
                <div className="flex items-center flex-1 h-10 bg-background rounded-xl shadow-sm px-4 gap-3">
                  <Search className="h-4 w-4 text-muted-foreground shrink-0" />
                  <input
                    type="text"
                    placeholder="Search apps..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                    autoFocus
                  />
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSearchOpen(false);
                    setSearchQuery("");
                    setSearchResults([]);
                  }}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="md:hidden border-t border-border overflow-hidden"
          >
            <nav className="container py-4 flex flex-col gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted rounded-md transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
