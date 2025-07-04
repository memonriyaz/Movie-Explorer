"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function useNavigationLoading() {
  const router = useRouter();
  const [isNavigating, setIsNavigating] = useState(false);

  const navigateWithLoading = async (url: string, delay: number = 300) => {
    setIsNavigating(true);
    
    // Add a small delay to show the loading state
    await new Promise(resolve => setTimeout(resolve, delay));
    
    router.push(url);
    
    // Reset loading state after navigation
    setTimeout(() => {
      setIsNavigating(false);
    }, 500);
  };

  return {
    isNavigating,
    navigateWithLoading,
  };
}
