"use client";

import React from "react";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { UsePaginationReturn } from "@/hooks/use-pagination";

interface TablePaginationProps {
  pagination: UsePaginationReturn;
  pageSizeOptions?: number[];
  showPageSizeSelector?: boolean;
  showPageInfo?: boolean;
  className?: string;
}

export function TablePagination({
  pagination,
  pageSizeOptions = [5, 10, 20, 50, 100],
  showPageSizeSelector = true,
  showPageInfo = true,
  className,
}: TablePaginationProps) {
  const { state, actions, getPageNumbers } = pagination;
  const pageNumbers = getPageNumbers();

  if (state.totalItems === 0) {
    return null;
  }

  return (
    <div
      className={`flex flex-col md:flex-row items-center justify-between gap-4 md:gap-6 py-4 ${className || ""}`}
    >
      {/* Left Section: Page Size Selector and Info */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 text-sm w-full md:w-auto">
        {showPageSizeSelector && (
          <div className="flex items-center gap-2">
            <span className="text-gray-700 text-xs sm:text-sm">Rows per page</span>
            <Select
              value={state.pageSize.toString()}
              onValueChange={(value) => actions.setPageSize(Number(value))}
            >
              <SelectTrigger className="h-8 w-20">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {pageSizeOptions.map((size) => (
                  <SelectItem key={size} value={size.toString()}>
                    {size}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
        {showPageInfo && (
          <div className="text-gray-700 text-xs sm:text-sm">
            Showing {state.startIndex + 1} to {state.endIndex} of {state.totalItems} results
          </div>
        )}
      </div>

      {/* Right Section: Pagination Controls */}
      <div className="flex items-center flex-wrap gap-2 justify-center md:justify-end w-full md:w-auto">
        {state.totalPages > 1 && (
          <Pagination>
            <PaginationContent className="flex flex-wrap justify-center gap-1">
              <PaginationItem>
                <PaginationPrevious
                  onClick={(e) => {
                    e.preventDefault();
                    actions.previousPage();
                  }}
                  className={
                    !state.hasPreviousPage
                      ? "pointer-events-none opacity-50"
                      : "cursor-pointer"
                  }
                />
              </PaginationItem>
              {pageNumbers.map((pageNumber, index) => (
                <PaginationItem key={index}>
                  {pageNumber === -1 ? (
                    <PaginationEllipsis />
                  ) : (
                    <PaginationLink
                      onClick={(e) => {
                        e.preventDefault();
                        actions.setCurrentPage(pageNumber);
                      }}
                      isActive={pageNumber === state.currentPage}
                      className="cursor-pointer"
                    >
                      {pageNumber}
                    </PaginationLink>
                  )}
                </PaginationItem>
              ))}
              <PaginationItem>
                <PaginationNext
                  onClick={(e) => {
                    e.preventDefault();
                    actions.nextPage();
                  }}
                  className={
                    !state.hasNextPage
                      ? "pointer-events-none opacity-50"
                      : "cursor-pointer"
                  }
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        )}
      </div>
    </div>
  );
}

interface TablePaginationSimpleProps {
  pagination: UsePaginationReturn;
  className?: string;
}

export function TablePaginationSimple({
  pagination,
  className,
}: TablePaginationSimpleProps) {
  const { state, actions } = pagination;

  if (state.totalItems === 0) {
    return null;
  }

  return (
    <div
      className={`flex flex-col sm:flex-row items-center justify-between gap-3 py-4 ${className || ""}`}
    >
      <div className="text-xs sm:text-sm text-gray-700 text-center sm:text-left">
        Page {state.currentPage} of {state.totalPages} ({state.totalItems} total)
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={actions.previousPage}
          disabled={!state.hasPreviousPage}
        >
          Previous
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={actions.nextPage}
          disabled={!state.hasNextPage}
        >
          Next
        </Button>
      </div>
    </div>
  );
}
