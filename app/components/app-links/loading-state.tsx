import { Spinner } from '~/components/ui/spinner';

export function LoadingState() {
  return (
    <div className='min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center'>
      <div className='flex flex-col items-center gap-4'>
        <Spinner className='h-8 w-8 text-gray-900 dark:text-gray-100' />
        <p className='text-gray-600 dark:text-gray-400'>Loading...</p>
      </div>
    </div>
  );
}
