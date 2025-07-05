"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { SearchBar } from "@/components/movies/SearchBar";
import { MovieList } from "@/components/movies/MovieList";
import { useRouter } from "next/navigation";

export default function Home() {
  const [searchQuery, setSearchQuery] = useState("");
  const { status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (status === "unauthenticated") {
    return null;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Hero Section */}
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-6xl font-bold !text-gray-900 dark:!text-white mb-4">
          Discover Amazing Movies
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-400 mb-8 max-w-2xl mx-auto">
          Explore the latest and greatest movies, search for your favorites, and
          build your personal watchlist.
        </p>

        {/* Search Bar */}
        <div className="max-w-2xl mx-auto">
          <SearchBar
            onSearch={setSearchQuery}
            placeholder="Search for movies..."
            className="w-full"
          />
        </div>
      </div>

      {/* Movie List */}
      <MovieList searchQuery={searchQuery} />
    </div>
  );
}
