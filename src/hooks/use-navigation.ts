import { useRouter } from 'next/navigation';
import { useCallback } from 'react';

export function useNavigation() {
  const router = useRouter();

  const goBack = useCallback(() => {
    if (typeof window !== 'undefined' && window.history.length > 1) {
      router.back();
    } else {
      // Fallback to dashboard if no history
      router.push('/dashboard');
    }
  }, [router]);

  const navigateTo = useCallback((path: string) => {
    router.push(path);
  }, [router]);

  const navigateToOpportunity = useCallback((opportunityId: string) => {
    router.push(`/opportunities/${opportunityId}`);
  }, [router]);

  const navigateToApply = useCallback((opportunityId: string) => {
    router.push(`/opportunities/${opportunityId}/apply`);
  }, [router]);

  const navigateToOpportunities = useCallback(() => {
    router.push('/opportunities');
  }, [router]);

  const navigateToApplications = useCallback(() => {
    router.push('/applications');
  }, [router]);

  const navigateToDashboard = useCallback(() => {
    router.push('/dashboard');
  }, [router]);

  return {
    goBack,
    navigateTo,
    navigateToOpportunity,
    navigateToApply,
    navigateToOpportunities,
    navigateToApplications,
    navigateToDashboard,
  };
} 