"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import DiscussionThreadForm from "@/components/DiscussionThreadForm";

interface User {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  role: string;
}

export default function NewDiscussionPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);

  const fetchUserData = async () => {
    try {
      const response = await fetch("/api/user");
      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
      } else {
        router.push("/login");
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
      router.push("/login");
    }
  };

  const handleLogout = async () => {
    try {
      const response = await fetch("/api/logout", { method: "POST" });
      if (response.ok) {
        router.push("/login");
      }
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  useEffect(() => {
    fetchUserData();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Unified Header */}
      <header className="bg-white/80 backdrop-blur-md shadow-md rounded-b-2xl">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/dashboard" className="flex items-center gap-2 flex-shrink-0">
              <span className="text-base sm:text-xl lg:text-2xl font-extrabold bg-gradient-to-tr from-blue-600 to-indigo-500 bg-clip-text text-transparent tracking-tight">UroCareerz</span>
            </Link>
            <div className="hidden md:flex items-center gap-4">
              <span className="text-sm text-gray-500 font-medium">Welcome, {user?.firstName || user?.email}</span>
              <Link href="/profile" className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors">Profile</Link>
              <Button variant="outline" onClick={handleLogout} className="text-gray-700 hover:text-red-600 transition-colors">Logout</Button>
            </div>
            <div className="md:hidden flex items-center justify-end">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  const shouldLogout = confirm("Would you like to logout?");
                  if (shouldLogout) handleLogout();
                }}
                className="p-2 text-gray-700 hover:text-red-600 transition-colors flex-shrink-0"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb Navigation */}
        <div className="mb-6">
          <nav className="flex items-center space-x-2 text-sm text-gray-500">
            <Link href="/dashboard" className="hover:text-blue-600 transition-colors">
              Dashboard
            </Link>
            <span>/</span>
            <Link href="/discussions" className="hover:text-blue-600 transition-colors">
              Discussions
            </Link>
            <span>/</span>
            <span className="text-gray-900 font-medium">New Discussion</span>
          </nav>
        </div>

        {/* Page Header */}
        <div className="mb-8 sm:mb-10 lg:mb-12">
          <div className="text-center">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
              Start a New <span className="bg-gradient-to-tr from-purple-600 to-indigo-500 bg-clip-text text-transparent">Discussion</span>
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Share your thoughts, ask questions, or start a case discussion with the UroCareerz community.
            </p>
          </div>
        </div>

        {/* Form Container */}
        <div className="max-w-4xl mx-auto">
          <DiscussionThreadForm />
        </div>
      </main>
    </div>
  );
}
