"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Menu, X, Settings, LogOut } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface User {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  role: string;
}

interface UserProfile {
  avatar?: string;
  avatarFileName?: string;
}

interface SharedHeaderProps {
  showUserInfo?: boolean;
  className?: string;
  onMobileMenuToggle?: () => void;
  isMobileMenuOpen?: boolean;
  onEditProfile?: () => void;
  refreshProfile?: boolean; // Trigger to refresh profile data
}

export default function SharedHeader({
  showUserInfo = true,
  className = "",
  onMobileMenuToggle,
  isMobileMenuOpen = false,
  onEditProfile,
  refreshProfile,
}: SharedHeaderProps) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isClient, setIsClient] = useState(false);

  const fetchUserData = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/user");
      if (response.ok) {
        const userData = await response.json();
        setUser(userData.user);
        
        // Also fetch user profile for avatar
        try {
          const profileResponse = await fetch("/api/profile", { credentials: "include" });
          if (profileResponse.ok) {
            const profileData = await profileResponse.json();
            setUserProfile(profileData.profile || null);
          }
        } catch (profileError) {
          console.log("Could not fetch user profile for avatar");
          setUserProfile(null);
        }
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

  const handleEditProfile = () => {
    if (onEditProfile) {
      onEditProfile();
      return;
    }
    router.push("/profile");
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
  
  // Refresh profile when refreshProfile prop changes
  useEffect(() => {
    if (refreshProfile && isClient && user) {
      fetchUserData();
    }
  }, [refreshProfile, isClient, user]);

  const userName = user
    ? user.firstName && user.lastName
      ? `${user.firstName} ${user.lastName}`
      : user.firstName || user.lastName || user.email || "User"
    : "User";

  const userInitials = user
    ? (user.firstName?.[0] || user.email?.[0] || "U").toUpperCase()
    : "U";

  // Get avatar URL for display
  const getAvatarUrl = () => {
    if (userProfile?.avatar) {
      if (
        userProfile.avatar === "https://example.com" ||
        userProfile.avatar === "example.com"
      ) {
        return undefined;
      }
      // If it's a full URL, use it directly
      if (userProfile.avatar.startsWith("http")) {
        return userProfile.avatar;
      }
      // Otherwise, use the download API
      return `/api/download?key=${encodeURIComponent(userProfile.avatar)}`;
    }
    return undefined;
  };

  const [avatarImageUrl, setAvatarImageUrl] = useState<string | undefined>(undefined);
  
  // Convert avatar URL to displayable image URL
  useEffect(() => {
    const fetchAvatarUrl = async () => {
      const avatarUrl = getAvatarUrl();
      if (avatarUrl && avatarUrl.includes('/api/download')) {
        try {
          const response = await fetch(avatarUrl, { credentials: 'include' });
          if (response.ok) {
            const data = await response.json();
            setAvatarImageUrl(data.downloadUrl);
          }
        } catch (error) {
          console.log('Could not fetch avatar display URL');
          setAvatarImageUrl(undefined);
        }
      } else if (avatarUrl) {
        setAvatarImageUrl(avatarUrl);
      } else {
        setAvatarImageUrl(undefined);
      }
    };
    
    if (userProfile?.avatar) {
      fetchAvatarUrl();
    } else {
      setAvatarImageUrl(undefined);
    }
  }, [userProfile?.avatar]);

  return (
    <header
      className={`bg-white/80 backdrop-blur-md shadow-md border-b border-slate-200/60 sticky top-0 z-50 ${className}`}
    >
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Left Section: Mobile Menu + Logo */}
          <div className="flex items-center gap-3">
            {/* Mobile Menu Button */}
            {onMobileMenuToggle && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onMobileMenuToggle}
                className="lg:hidden p-2 hover:bg-slate-100"
                aria-label="Toggle menu"
              >
                {isMobileMenuOpen ? (
                  <X className="h-5 w-5 text-slate-600" />
                ) : (
                  <Menu className="h-5 w-5 text-slate-600" />
                )}
              </Button>
            )}

            {/* Logo */}
            <Link
              href="/dashboard"
              className="flex items-center gap-2 flex-shrink-0"
            >
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center">
                <span className="text-white font-bold text-sm">U</span>
              </div>
              <span className="text-lg sm:text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent tracking-tight">
                UroCareerz
              </span>
            </Link>
          </div>

          {/* Right Section: User Menu */}
          {showUserInfo && (
            <div className="flex items-center gap-3">
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-slate-200 animate-pulse" />
                  <div className="hidden sm:block w-20 h-4 bg-slate-200 rounded animate-pulse" />
                </div>
              ) : user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      className="flex items-center gap-2 p-1 h-auto hover:bg-slate-100"
                    >
                      <Avatar className="h-8 w-8 border-2 border-white shadow-sm">
                        {avatarImageUrl && (
                          <AvatarImage 
                            src={avatarImageUrl} 
                            alt={`${userName}'s profile picture`}
                            className="object-cover"
                          />
                        )}
                        <AvatarFallback className="bg-gradient-to-tr from-blue-500 to-indigo-500 text-white font-semibold text-sm">
                          {userInitials}
                        </AvatarFallback>
                      </Avatar>
                      <div className="hidden sm:block text-left">
                        <p className="text-sm font-medium text-slate-900 truncate max-w-[120px]">
                          {user.firstName || user.email}
                        </p>
                        <p className="text-xs text-slate-500 capitalize">
                          {user.role.toLowerCase()}
                        </p>
                      </div>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <div className="flex items-center gap-2 p-2">
                      <Avatar className="h-8 w-8">
                        {avatarImageUrl && (
                          <AvatarImage 
                            src={avatarImageUrl} 
                            alt={`${userName}'s profile picture`}
                            className="object-cover"
                          />
                        )}
                        <AvatarFallback className="bg-gradient-to-tr from-blue-500 to-indigo-500 text-white font-semibold text-sm">
                          {userInitials}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium">{userName}</p>
                        <p className="text-xs text-slate-500 capitalize">
                          {user.role.toLowerCase()}
                        </p>
                      </div>
                    </div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleEditProfile}>
                      <Settings className="mr-2 h-4 w-4" />
                      <span>Profile Settings</span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={handleLogout}
                      className="text-red-600 focus:text-red-600"
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Sign out</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : null}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
