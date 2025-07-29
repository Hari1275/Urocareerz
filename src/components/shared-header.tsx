"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface User {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  role: string;
}

interface SharedHeaderProps {
  showUserInfo?: boolean;
  className?: string;
}

export default function SharedHeader({ showUserInfo = true, className = "" }: SharedHeaderProps) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isClient, setIsClient] = useState(false);

  const fetchUserData = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/user");
      if (response.ok) {
        const userData = await response.json();
        setUser(userData.user);
      } else {
        setUser(null);
        router.push("/login");
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
      setUser(null);
      router.push("/login");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      const response = await fetch("/api/logout", { method: "POST" });
      if (response.ok) {
        setUser(null);
        router.push("/login");
      }
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  // Ensure we're on the client side before fetching data
  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (isClient && showUserInfo && !user) {
      fetchUserData();
    }
  }, [isClient, showUserInfo, user]);

  const userName = user 
    ? (user.firstName && user.lastName 
      ? `${user.firstName} ${user.lastName}` 
      : user.firstName || user.lastName || user.email || "User")
    : "User";

  return (
    <header className={`bg-white/80 backdrop-blur-md shadow-md rounded-b-2xl ${className}`}>
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/dashboard" className="flex items-center gap-2 flex-shrink-0">
            <span className="text-base sm:text-xl lg:text-2xl font-extrabold bg-gradient-to-tr from-blue-600 to-indigo-500 bg-clip-text text-transparent tracking-tight">
              UroCareerz
            </span>
          </Link>
          
          {showUserInfo && (
            <>
              {/* Desktop Navigation */}
              <div className="hidden md:flex items-center gap-4">
                {isLoading ? (
                  <span className="text-sm text-gray-400 font-medium animate-pulse">Loading...</span>
                ) : (
                  <span className="text-sm text-gray-600 font-medium">
                    Welcome, <span className="text-gray-900 font-semibold">{userName}</span>
                  </span>
                )}
                <Link href="/profile" className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors">
                  Profile
                </Link>
                <Button 
                  variant="outline" 
                  onClick={handleLogout} 
                  className="text-gray-700 hover:text-red-600 transition-colors"
                >
                  Logout
                </Button>
              </div>

              {/* Mobile Navigation */}
              <div className="md:hidden flex items-center justify-end gap-2 w-full">
                <div className="flex flex-row items-center gap-x-1 min-w-0 max-w-xs flex-shrink overflow-hidden">
                  {isLoading ? (
                    <span className="text-xs text-gray-400 animate-pulse">Loading...</span>
                  ) : (
                    <>
                      <span className="text-xs text-gray-500 whitespace-nowrap">Welcome,</span>
                      <span className="text-sm text-gray-900 font-medium truncate max-w-[6rem] ml-1">
                        {userName}
                      </span>
                    </>
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    const shouldLogout = confirm("Would you like to logout?");
                    if (shouldLogout) handleLogout();
                  }}
                  className="p-2 text-gray-700 hover:text-red-600 transition-colors flex-shrink-0"
                  aria-label="Logout"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
} 