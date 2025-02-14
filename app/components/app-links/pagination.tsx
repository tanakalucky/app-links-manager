import { Button } from '~/components/ui/button';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  startIndex: number;
  endIndex: number;
  totalItems: number;
}

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  startIndex,
  endIndex,
  totalItems,
}: PaginationProps) {
  return (
    <>
      <div className='flex items-center justify-between mb-6'>
        <p className='text-sm text-gray-600 dark:text-gray-400'>
          Showing {startIndex}-{endIndex} of {totalItems} items
        </p>
        <PaginationControls currentPage={currentPage} totalPages={totalPages} onPageChange={onPageChange} />
      </div>
    </>
  );
}

interface PaginationControlsProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

function PaginationControls({ currentPage, totalPages, onPageChange }: PaginationControlsProps) {
  return (
    <div className='flex gap-2'>
      <Button
        variant='outline'
        size='sm'
        onClick={() => onPageChange(Math.max(1, currentPage - 1))}
        disabled={currentPage === 1}
      >
        Previous
      </Button>
      <Button
        variant='outline'
        size='sm'
        onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
        disabled={currentPage === totalPages}
      >
        Next
      </Button>
    </div>
  );
}

export function SimplePagination({ currentPage, totalPages, onPageChange }: PaginationControlsProps) {
  return (
    <div className='mt-8 flex justify-center gap-2'>
      <Button
        variant='outline'
        size='sm'
        onClick={() => onPageChange(Math.max(1, currentPage - 1))}
        disabled={currentPage === 1}
      >
        Previous
      </Button>
      <span className='flex items-center px-4 text-sm text-gray-600 dark:text-gray-400'>
        Page {currentPage} of {totalPages}
      </span>
      <Button
        variant='outline'
        size='sm'
        onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
        disabled={currentPage === totalPages}
      >
        Next
      </Button>
    </div>
  );
}
