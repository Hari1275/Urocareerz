"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import MenteeOpportunityForm from "@/components/MenteeOpportunityForm";
import SharedHeader from "@/components/shared-header";
import Breadcrumb from "@/components/Breadcrumb";

export default function SubmitOpportunityPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Use Shared Header */}
      <SharedHeader />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Navigation Header with Back Button and Breadcrumbs */}
        <div className="mb-6">
          <div className="flex items-center mb-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => window.history.back()}
              className="mr-4 text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <Breadcrumb
              items={[
                { label: "Dashboard", href: "/dashboard" },
                { label: "Mentee Dashboard", href: "/dashboard/mentee" },
                { label: "Submit Opportunity", href: "/dashboard/mentee/submit-opportunity" },
              ]}
            />
          </div>
        </div>

        {/* Page Header */}
        <div className="mb-8 sm:mb-10 lg:mb-12">
          <div className="text-center">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
              Submit <span className="bg-gradient-to-tr from-purple-600 to-indigo-500 bg-clip-text text-transparent">Opportunity</span>
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Share opportunities you&apos;ve discovered with the UroCareerz community.
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
