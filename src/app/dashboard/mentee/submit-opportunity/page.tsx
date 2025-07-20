import MenteeOpportunityForm from "@/components/MenteeOpportunityForm";

export default function SubmitOpportunityPage() {
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Submit Opportunity
        </h1>
        <p className="text-gray-600">
          Share opportunities you&apos;ve discovered with the UroCareerz
          community.
        </p>
      </div>

      <MenteeOpportunityForm />
    </div>
  );
}
