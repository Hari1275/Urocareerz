"use client";

import { useState, useMemo, useCallback } from "react";

export interface PaginationOptions {
  initialPage?: number;
  initialPageSize?: number;
  pageSizeOptions?: number[];
}

export interface PaginationState {
  currentPage: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
  startIndex: number;
  endIndex: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface PaginationActions {
  setCurrentPage: (page: number) => void;
  setPageSize: (size: number) => void;
  setTotalItems: (total: number) => void;
  nextPage: () => void;
  previousPage: () => void;
  goToFirstPage: () => void;
  goToLastPage: () => void;
  reset: () => void;
}

export interface UsePaginationReturn {
  state: PaginationState;
  actions: PaginationActions;
  paginateData: <T>(data: T[]) => T[];
  getPageNumbers: () => number[];
}

export function usePagination(options: PaginationOptions = {}): UsePaginationReturn {
  const {
    initialPage = 1,
    initialPageSize = 10
  } = options;

  const [currentPage, setCurrentPage] = useState(initialPage);
  const [pageSize, setPageSize] = useState(initialPageSize);
  const [totalItems, setTotalItems] = useState(0);

  const state = useMemo((): PaginationState => {
    const totalPages = Math.ceil(totalItems / pageSize);
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = Math.min(startIndex + pageSize, totalItems);

    return {
      currentPage,
      pageSize,
      totalItems,
      totalPages,
      startIndex,
      endIndex,
      hasNextPage: currentPage < totalPages,
      hasPreviousPage: currentPage > 1,
    };
  }, [currentPage, pageSize, totalItems]);

  const actions = useMemo((): PaginationActions => ({
    setCurrentPage: (page: number) => {
      setCurrentPage(Math.max(1, Math.min(page, state.totalPages)));
    },
    setPageSize: (size: number) => {
      setPageSize(size);
      // Reset to first page when changing page size
      setCurrentPage(1);
    },
    setTotalItems: (total: number) => {
      setTotalItems(total);
      // Adjust current page if it exceeds new total pages
      const newTotalPages = Math.ceil(total / pageSize);
      if (currentPage > newTotalPages && newTotalPages > 0) {
        setCurrentPage(newTotalPages);
      }
    },
    nextPage: () => {
      if (state.hasNextPage) {
        setCurrentPage(currentPage + 1);
      }
    },
    previousPage: () => {
      if (state.hasPreviousPage) {
        setCurrentPage(currentPage - 1);
      }
    },
    goToFirstPage: () => setCurrentPage(1),
    goToLastPage: () => setCurrentPage(state.totalPages),
    reset: () => {
      setCurrentPage(initialPage);
      setPageSize(initialPageSize);
      setTotalItems(0);
    },
  }), [currentPage, pageSize, state.hasNextPage, state.hasPreviousPage, state.totalPages, initialPage, initialPageSize]);

  const paginateData = useCallback(<T>(data: T[]): T[] => {
    const start = state.startIndex;
    const end = state.endIndex;
    return data.slice(start, end);
  }, [state.startIndex, state.endIndex]);

  const getPageNumbers = useCallback((): number[] => {
    const totalPages = state.totalPages;
    const current = state.currentPage;
    
    if (totalPages <= 7) {
      // Show all pages if total is 7 or fewer
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    // Always show first page, last page, current page, and neighbors
    const pages: number[] = [];
    
    // Always include first page
    pages.push(1);
    
    // Calculate range around current page
    const startPage = Math.max(2, current - 1);
    const endPage = Math.min(totalPages - 1, current + 1);
    
    // Add ellipsis after first page if needed
    if (startPage > 2) {
      pages.push(-1); // -1 represents ellipsis
    }
    
    // Add pages around current page
    for (let i = startPage; i <= endPage; i++) {
      if (!pages.includes(i)) {
        pages.push(i);
      }
    }
    
    // Add ellipsis before last page if needed
    if (endPage < totalPages - 1) {
      pages.push(-1); // -1 represents ellipsis
    }
    
    // Always include last page
    if (totalPages > 1 && !pages.includes(totalPages)) {
      pages.push(totalPages);
    }
    
    return pages;
  }, [state.currentPage, state.totalPages]);

  return {
    state,
    actions,
    paginateData,
    getPageNumbers,
  };
} 