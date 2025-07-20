import DiscussionThreadForm from "@/components/DiscussionThreadForm";

export default function NewDiscussionPage() {
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Start New Discussion
        </h1>
        <p className="text-gray-600">
          Share your thoughts, ask questions, or start a case discussion with
          the UroCareerz community.
        </p>
      </div>

      <DiscussionThreadForm />
    </div>
  );
}
