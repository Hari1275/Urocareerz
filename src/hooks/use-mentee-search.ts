import { useState, useEffect, useCallback } from "react";

export interface Mentee {
  id: string;
  firstName: string | null;
  lastName: string | null;
  email: string;
  createdAt: string;
  profile?: {
    bio?: string;
    location?: string;
    interests?: string[];
    education?: string;
    avatar?: string;
    yearsOfExperience?: number;
    specialty?: string;
    workplace?: string;
    availabilityStatus?: string;
  };
}

export interface SearchFilters {
  query: string;
  location: string;
  experienceLevel: string;
  interests: string;
}

export interface SearchPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export function useMenteeSearch() {
  const [mentees, setMentees] = useState<Mentee[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<SearchFilters>({
    query: '',
    location: '',
    experienceLevel: '',
    interests: ''
  });
  const [pagination, setPagination] = useState<SearchPagination>({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
    hasNext: false,
    hasPrev: false
  });

  // Debounced search function
  const debouncedSearch = useCallback(
    debounce(async (searchFilters: SearchFilters, page: number = 1) => {
      try {
        setLoading(true);
        setError(null);

        const params = new URLSearchParams({
          q: searchFilters.query,
          location: searchFilters.location,
          experienceLevel: searchFilters.experienceLevel,
          interests: searchFilters.interests,
          page: page.toString(),
          limit: pagination.limit.toString()
        });

        const response = await fetch(`/api/mentees/search?${params}`, {
          credentials: 'include'
        });

        if (!response.ok) {
          throw new Error('Failed to search mentees');
        }

        const data = await response.json();
        setMentees(data.mentees);
        setPagination(data.pagination);
      } catch (err) {
        console.error('Search error:', err);
        setError(err instanceof Error ? err.message : 'Search failed');
        setMentees([]);
      } finally {
        setLoading(false);
      }
    }, 300),
    [pagination.limit]
  );

  // Update filters and trigger search
  const updateFilters = useCallback((newFilters: Partial<SearchFilters>) => {
    const updatedFilters = { ...filters, ...newFilters };
    setFilters(updatedFilters);
    setPagination(prev => ({ ...prev, page: 1 })); // Reset to first page
    debouncedSearch(updatedFilters, 1);
  }, [filters, debouncedSearch]);

  // Change page
  const changePage = useCallback((newPage: number) => {
    setPagination(prev => ({ ...prev, page: newPage }));
    debouncedSearch(filters, newPage);
  }, [filters, debouncedSearch]);

  // Clear search
  const clearSearch = useCallback(() => {
    const clearedFilters = {
      query: '',
      location: '',
      experienceLevel: '',
      interests: ''
    };
    setFilters(clearedFilters);
    setPagination(prev => ({ ...prev, page: 1 }));
    debouncedSearch(clearedFilters, 1);
  }, [debouncedSearch]);

  // Initial search on mount
  useEffect(() => {
    debouncedSearch(filters, 1);
  }, []);

  return {
    mentees,
    loading,
    error,
    filters,
    pagination,
    updateFilters,
    changePage,
    clearSearch
  };
}

// Debounce utility function
function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
} 