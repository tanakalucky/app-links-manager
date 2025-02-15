import { type ClassValue } from 'clsx';
import { ReactNode, createContext, useContext } from 'react';
import { Button } from '~/components/ui/button';
import { cn } from '~/lib/utils';

interface PaginationContextValue {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  startIndex?: number;
  endIndex?: number;
  totalItems?: number;
}

const PaginationContext = createContext<PaginationContextValue | null>(null);

function usePaginationContext() {
  const context = useContext(PaginationContext);
  if (!context) {
    throw new Error('Pagination components must be used within a PaginationContext Provider');
  }
  return context;
}

interface PaginationProps extends PaginationContextValue {
  className?: ClassValue;
  children: ReactNode;
}

export function Pagination({ children, className = '', ...paginationProps }: PaginationProps) {
  return (
    <PaginationContext.Provider value={paginationProps}>
      <div className={cn('flex items-center', className)}>{children}</div>
    </PaginationContext.Provider>
  );
}

Pagination.ItemsInfo = function PaginationItemsInfo() {
  const { startIndex, endIndex, totalItems } = usePaginationContext();
  return (
    <p className='text-sm text-gray-600 dark:text-gray-400'>
      Showing {startIndex}-{endIndex} of {totalItems} items
    </p>
  );
};

Pagination.PageInfo = function PaginationPageInfo() {
  const { currentPage, totalPages } = usePaginationContext();
  return (
    <span className='text-sm text-gray-600 dark:text-gray-400'>
      Page {currentPage} of {totalPages}
    </span>
  );
};

Pagination.PreviousButton = function PaginationPreviousButton() {
  const { currentPage, onPageChange } = usePaginationContext();
  return (
    <Button
      variant='outline'
      size='sm'
      onClick={() => onPageChange(Math.max(1, currentPage - 1))}
      disabled={currentPage === 1}
    >
      Previous
    </Button>
  );
};

Pagination.NextButton = function PaginationNextButton() {
  const { currentPage, totalPages, onPageChange } = usePaginationContext();
  return (
    <Button
      variant='outline'
      size='sm'
      onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
      disabled={currentPage === totalPages}
    >
      Next
    </Button>
  );
};
