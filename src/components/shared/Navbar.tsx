"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Upload, User, LogOut, Shield, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
      className="sticky top-0 z-50 w-full border-b border-border bg-background overflow-hidden"
    >
      <div className="container relative flex h-14 md:h-16 items-center justify-between gap-2">
        {/* Logo - left section */}
        <Link href="/" className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center gap-1.5 sm:gap-2"
          >
            <Image
              src="/logo.webp"
              alt="APP Review Logo"
              width={32}
              height={32}
              className="h-7 w-7 sm:h-8 sm:w-8 object-contain"
            />
            <h1 className="text-lg md:text-xl font-bold tracking-tight">App Review</h1>
          </motion.div>
        </Link>

        {/* Desktop Navigation Links - absolutely centered */}
        <nav className="desktop-nav hidden md:flex items-center gap-6 absolute left-1/2 -translate-x-1/2 pointer-events-none">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground pointer-events-auto"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Right side actions */}
        <div className="flex items-center gap-2">
          {/* Search */}
          <div ref={searchRef} className="relative">
            {/* Desktop Search */}
            <div className="hidden md:block">
              <form onSubmit={handleSearchSubmit} className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search apps..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => setSearchOpen(true)}
                  className="w-[200px] lg:w-[280px] pl-9 h-9"
                />
              </form>
            </div>

            {/* Mobile Search Button - only visible below md breakpoint */}
            <div className="flex md:hidden">
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9"
                onClick={() => setSearchOpen(!searchOpen)}
              >
                <Search className="h-4 w-4" />
              </Button>
            </div>

            {/* Search Results Dropdown */}
            <AnimatePresence>
              {searchOpen && (searchResults.length > 0 || isSearching) && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute top-full right-0 md:left-0 mt-2 w-[280px] sm:w-[320px] md:w-[320px] bg-background border border-border rounded-lg shadow-lg overflow-hidden z-50"
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
                          className="w-full flex items-start sm:items-center gap-2 sm:gap-3 p-2.5 sm:p-3 hover:bg-muted transition-colors text-left cursor-pointer"
                        >
                          <div className="h-9 w-9 sm:h-10 sm:w-10 rounded-lg bg-muted flex items-center justify-center shrink-0 overflow-hidden">
                            {app.iconUrl ? (
                              <img src={app.iconUrl} alt="" className="h-full w-full object-cover" />
                            ) : (
                              <span className="text-xs sm:text-sm font-bold">{app.title[0]}</span>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-xs sm:text-sm truncate">{app.title}</p>
                            <p className="text-[10px] sm:text-xs text-muted-foreground truncate">{app.shortDescription}</p>
                          </div>
                          <Badge variant="outline" className="text-[10px] sm:text-xs shrink-0 hidden xs:flex">
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
                        className="block p-2.5 sm:p-3 text-center text-xs sm:text-sm text-primary hover:bg-muted transition-colors border-t cursor-pointer"
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
              {/* Submit App - hidden on mobile */}
              <Link href="/apps/upload" className="hidden sm:block">
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

          {/* Mobile Menu Button - only visible below md breakpoint */}
          <div className="mobile-menu-button flex md:hidden">
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Search Bar */}
      <AnimatePresence>
        {searchOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="md:hidden bg-muted/50 overflow-hidden"
          >
            <form onSubmit={handleSearchSubmit} className="px-4 py-3">
              <div className="flex items-center gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                  <Input
                    placeholder="Search apps..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-11 w-full h-10 bg-background border-0 shadow-sm rounded-xl focus-visible:ring-1"
                    autoFocus
                  />
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="text-muted-foreground hover:text-foreground shrink-0"
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
