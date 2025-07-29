import ApplyPageClient from './ApplyPageClient';

export default async function ApplyPage({ params }: { params: Promise<{ id: string }> }) {
  console.log("SERVER PAGE PARAMS:", params);
  
  // Ensure we have a valid ID
  const { id } = await params;
  if (!id) {
    throw new Error('Missing opportunity ID');
  }

  return <ApplyPageClient opportunityId={id} />;
}
