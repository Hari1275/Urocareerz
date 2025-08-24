"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import MenteeOpportunityForm from "@/components/MenteeOpportunityForm";
import Link from "next/link";

interface User {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  role: string;
}

export default function SubmitOpportunityPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch("/api/user");
        if (response.ok) {
          const userData = await response.json();
          setUser(userData.user);
        } else {
          router.push("/login");
        }
      } catch (error) {
        console.error("Error fetching user:", error);
        router.push("/login");
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [router]);

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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600 font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      {/* Premium Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-slate-200/60 sticky top-0 z-50">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/dashboard" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center">
                <span className="text-white font-bold text-sm">U</span>
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent tracking-tight">
                UroCareerz
              </span>
            </Link>
            
            <div className="flex items-center gap-4">
              {user && (
                <span className="text-sm text-slate-600 font-medium">
                  Welcome, {user.firstName || user.email}
                </span>
              )}
              <Link href="/profile" className="text-sm text-slate-600 hover:text-slate-900 font-medium transition-colors">
                Profile
              </Link>
              <Button variant="outline" size="sm" onClick={handleLogout} className="text-slate-600 hover:text-red-600">
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb Navigation */}
        <div className="mb-6">
          <nav className="flex items-center space-x-2 text-sm text-slate-500">
            <Link href="/dashboard" className="hover:text-blue-600 transition-colors font-medium">
              Dashboard
            </Link>
            <span>/</span>
            <Link href="/dashboard/mentee" className="hover:text-blue-600 transition-colors font-medium">
              Mentee Dashboard
            </Link>
            <span>/</span>
            <span className="text-slate-900 font-semibold">Submit Opportunity</span>
          </nav>
        </div>

        {/* Back Button */}
        <div className="mb-6">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.back()}
            className="text-slate-600 hover:text-slate-900 bg-white/80 border-slate-200 rounded-xl transition-all duration-200"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </div>

        {/* Page Header */}
        <div className="mb-8 sm:mb-10 lg:mb-12">
          <div className="text-center">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 mb-4 tracking-tight">
              Submit <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Opportunity</span>
            </h1>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto mb-6">
              Share opportunities you've discovered with the UroCareerz community.
            </p>
          </div>
        </div>

        {/* Form Container */}
        <div className="max-w-4xl mx-auto">
          <MenteeOpportunityForm />
        </div>
      </main>
    </div>
  );
}
