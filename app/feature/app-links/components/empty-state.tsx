import { FileQuestion } from 'lucide-react';
import { Button } from '~/components/ui/button';

interface EmptyStateProps {
  query: string;
  onClear: () => void;
}

export function EmptyState({ query, onClear }: EmptyStateProps) {
  return (
    <div className='flex flex-col items-center justify-center py-12'>
      <FileQuestion className='h-16 w-16 text-gray-400 mb-4' />
      <h2 className='text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2'>No Apps Found</h2>
      <p className='text-gray-600 dark:text-gray-400 mb-4 text-center'>
        {query ? (
          <>
            No apps found matching "{query}".
            <br />
            Try adjusting your search criteria.
          </>
        ) : (
          'No apps have been registered yet.'
        )}
      </p>
      {query && (
        <Button onClick={onClear} variant='outline'>
          Clear Search
        </Button>
      )}
    </div>
  );
}
