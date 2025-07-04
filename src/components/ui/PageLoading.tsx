"use client";

import { Film, Heart, Star } from "lucide-react";

interface PageLoadingProps {
  message?: string;
  variant?: "default" | "auth" | "favorites" | "movie";
}

export function PageLoading({ 
  message = "Loading...", 
  variant = "default" 
}: PageLoadingProps) {
  const getIcon = () => {
    switch (variant) {
      case "auth":
        return <Film className="w-8 h-8" />;
      case "favorites":
        return <Heart className="w-8 h-8 text-red-500 fill-current" />;
      case "movie":
        return <Star className="w-8 h-8 text-yellow-500 fill-current" />;
      default:
        return <Film className="w-8 h-8" />;
    }
  };

  const getGradient = () => {
    switch (variant) {
      case "auth":
        return "from-blue-500/20 to-purple-500/20";
      case "favorites":
        return "from-red-500/20 to-pink-500/20";
      case "movie":
        return "from-yellow-500/20 to-orange-500/20";
      default:
        return "from-blue-500/20 to-purple-500/20";
    }
  };

  return (
    <div className="fixed inset-0 bg-white/80 dark:bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
      <div className={`bg-gradient-to-br ${getGradient()} backdrop-blur-lg rounded-2xl p-8 shadow-2xl border border-white/20 dark:border-gray-800/20`}>
        <div className="flex flex-col items-center space-y-4">
          {/* Animated Icon */}
          <div className="relative">
            <div className="animate-spin-slow">
              {getIcon()}
            </div>
            <div className="absolute inset-0 animate-ping opacity-20">
              {getIcon()}
            </div>
          </div>
          
          {/* Loading Text */}
          <div className="text-center">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              {message}
            </h3>
            <div className="flex space-x-1 justify-center">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: "0.1s" }}></div>
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
