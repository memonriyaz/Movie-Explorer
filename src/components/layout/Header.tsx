"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { User, LogOut, Heart, Film } from "lucide-react";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import toast from 'react-hot-toast';
import { clearStoredUser } from "@/lib/auth-client";

export const Header: React.FC = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleLogout = () => {
    logout();
    clearStoredUser();
    setShowUserMenu(false);
    toast.success('Successfully logged out. See you soon!', { duration: 3000 });
    router.push("/login");
  };

  const isActivePath = (path: string) => {
    return pathname === path;
  };

  return (
    <header className="bg-white  dark:bg-black shadow-md border-b border-gray-200 dark:border-gray-800">
      <div className="max-w-7xl mx-auto p-3 sm:px-6 lg:px-8 ">
        <div className="flex justify-between items-center h-12">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center space-x-2 text-xl font-bold text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
          >
            <Film className="h-6 w-6" />
            <span>Movie Explorer</span>
          </Link>

          {/* Navigation Links */}
          {isAuthenticated && (
            <nav className="hidden md:flex items-center space-x-8">
              <Link
                href="/"
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActivePath("/")
                    ? "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20"
                    : "text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400"
                }`}
              >
                Home
              </Link>
              <Link
                href="/favorites"
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center space-x-1 ${
                  isActivePath("/favorites")
                    ? "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20"
                    : "text-white hover:text-blue-300"
                }`}
              >
                <Heart className="h-4 w-4" />
                <span>Favorites</span>
              </Link>
            </nav>
          )}

          {/* Right side actions */}
          <div className="flex items-center space-x-4">
            {/* Theme toggle */}
            <ThemeToggle />

            {isAuthenticated ? (
              <div className="relative">
                {/* User menu trigger */}
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center space-x-2 p-2 rounded-md text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-900 transition-colors"
                >
                  <User className="h-5 w-5" />
                  <span className="hidden md:block text-sm font-medium">
                    {user?.name}
                  </span>
                </button>

                {/* User dropdown menu */}
                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-black rounded-md shadow-lg border border-gray-200 dark:border-gray-800 z-50">
                    <div className="py-1">
                      <div className="px-4 py-3 text-sm text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-800">
                        <p className="font-medium truncate">{user?.name}</p>
                        <p className="text-gray-600 dark:text-gray-400 truncate text-xs mt-1">
                          {user?.email}
                        </p>
                      </div>

                      <Link
                        href="/favorites"
                        className="flex items-center px-4 py-2 text-sm text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-900"
                        onClick={() => setShowUserMenu(false)}
                      >
                        <Heart className="h-4 w-4 mr-2" />
                        My Favorites
                      </Link>

                      <button
                        onClick={handleLogout}
                        className="flex items-center w-full px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-900"
                      >
                        <LogOut className="h-4 w-4 mr-2" />
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link
                  href="/login"
                  className="px-4 py-2 text-sm font-medium text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  href="/register"
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile navigation */}
      {isAuthenticated && (
        <div className="md:hidden border-t border-gray-200 dark:border-gray-800">
          <div className="px-4 py-2 space-y-1">
            <Link
              href="/"
              className={`block px-3 py-2 rounded-md text-sm font-medium ${
                isActivePath("/")
                  ? "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20"
                  : "text-gray-900 dark:text-white"
              }`}
            >
              Home
            </Link>
            <Link
              href="/favorites"
              className={`block px-3 py-2 rounded-md text-sm font-medium flex items-center space-x-2 ${
                isActivePath("/favorites")
                  ? "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20"
                  : "text-gray-900 dark:text-white"
              }`}
            >
              <Heart className="h-4 w-4" />
              <span>Favorites</span>
            </Link>
          </div>
        </div>
      )}

      {/* Overlay for user menu */}
      {showUserMenu && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowUserMenu(false)}
        />
      )}
    </header>
  );
};
