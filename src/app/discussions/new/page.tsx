"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import SharedHeader from "@/components/shared-header";
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
        setUser(userData.user); // Fix: assign the actual user object
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
      <SharedHeader />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8 sm:mb-10 lg:mb-12">
          <div className="text-center">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
              Start a New{" "}
              <span className="bg-gradient-to-tr from-purple-600 to-indigo-500 bg-clip-text text-transparent">
                Discussion
              </span>
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Share your thoughts, ask questions, or start a case discussion
              with the UroCareerz community.
            </p>
          </div>
        </div>

        {/* Form Container */}
        <div className="max-w-4xl mx-auto">
          <DiscussionThreadForm
            onSuccess={() => {
              // Navigate to the discussions list page after successful creation
              router.push("/discussions");
            }}
            onCancel={() => {
              // Navigate back to discussions list
              router.push("/discussions");
            }}
          />
        </div>
      </main>
    </div>
  );
}
