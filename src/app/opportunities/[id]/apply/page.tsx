import ApplyPageClient from './ApplyPageClient';

export default async function ApplyPage({ params }: { params: { id: string } }) {
  console.log("SERVER PAGE PARAMS:", params);
  
  // Ensure we have a valid ID
  const id = params?.id;
  if (!id) {
    throw new Error('Missing opportunity ID');
  }

  return <ApplyPageClient opportunityId={id} />;
}
