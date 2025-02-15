import { AlertCircle } from 'lucide-react';
import { Button } from '~/components/ui/button';

interface ErrorStateProps {
  onRetry: () => void;
}

export function ErrorState({ onRetry }: ErrorStateProps) {
  return (
    <div className='flex flex-col items-center justify-center py-12'>
      <AlertCircle className='h-16 w-16 text-red-500 mb-4' />
      <h2 className='text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2'>Error Occurred</h2>
      <p className='text-gray-600 dark:text-gray-400 mb-4 text-center'>
        An error occurred while loading the apps.
        <br />
        Please try again later.
      </p>
      <Button onClick={onRetry} variant='outline' className='gap-2'>
        Retry
      </Button>
    </div>
  );
}
