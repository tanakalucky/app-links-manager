import type { LoaderFunctionArgs, MetaFunction } from '@remix-run/cloudflare';
import { useLoaderData, useNavigation, useSubmit } from '@remix-run/react';
import { hc } from 'hono/client';
import { RefreshCw, Search } from 'lucide-react';
import { useEffect, useState } from 'react';
import { AppType } from 'server';
import { Button } from '~/components/ui/button';
import { Input } from '~/components/ui/input';
import { Spinner } from '~/components/ui/spinner';
import { AppLink } from '~/types/app-link';

const client = hc<AppType>(import.meta.env.VITE_API_URL);

export const meta: MetaFunction = () => {
  return [{ title: 'App Links' }, { name: 'description', content: 'Browse and manage your app links' }];
};

interface AppLinkWithThumbnail extends AppLink {
  thumbnail: string;
}

export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const query = url.searchParams.get('q') || '';

  try {
    const data = await client.api['app-links'].$get();

    const allApps = (await data.json()).map(
      (v): AppLinkWithThumbnail => ({
        ...v,
        thumbnail: `https://picsum.photos/seed/${v.id}/300/200`,
      }),
    );

    const filteredApps = query
      ? allApps.filter((app) => app.name.toLowerCase().includes(query.toLowerCase()))
      : allApps;

    return { apps: filteredApps, query };
  } catch (_) {
    throw new Error('Failed to fetch apps');
  }
}

export default function Index() {
  const { apps, query } = useLoaderData<typeof loader>();
  const navigation = useNavigation();
  const submit = useSubmit();
  const [currentPage, setCurrentPage] = useState(1);
  const [searchValue, setSearchValue] = useState(query);

  const isLoading = navigation.state === 'loading';

  useEffect(() => {
    setSearchValue(query);
  }, [query]);

  const itemsPerPage = 20;
  const totalPages = Math.ceil(apps.length / itemsPerPage);
  const currentApps = apps.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const startIndex = apps.length ? (currentPage - 1) * itemsPerPage + 1 : 0;
  const endIndex = Math.min(currentPage * itemsPerPage, apps.length);

  const handleSearch = (value: string) => {
    setSearchValue(value);
    setCurrentPage(1);
    submit({ q: value }, { replace: true });
  };

  const handleClearSearch = () => {
    setSearchValue('');
    setCurrentPage(1);
    submit({ q: '' }, { replace: true });
  };

  return (
    <div className='min-h-screen bg-gray-50 dark:bg-gray-900'>
      <header className='fixed top-0 left-0 right-0 z-10 border-b bg-white/80 backdrop-blur-sm dark:bg-gray-950/80 dark:border-gray-800'>
        <div className='container mx-auto px-4 h-16 flex items-center justify-between'>
          <h1 className='text-2xl font-bold text-gray-900 dark:text-gray-100'>App Links</h1>
          <div className='relative w-72'>
            <Input
              type='search'
              placeholder='Search apps...'
              value={searchValue}
              onChange={(e) => handleSearch(e.target.value)}
              className='pl-10'
            />
            <Search className='absolute left-3 top-2.5 h-4 w-4 text-gray-500 dark:text-gray-400' />
          </div>
        </div>
      </header>

      <main className='container mx-auto px-4 pt-24 pb-8'>
        {isLoading ? (
          <div className='flex flex-col items-center justify-center min-h-[400px]'>
            <Spinner className='w-8 h-8 text-blue-500' />
            <p className='mt-4 text-gray-600 dark:text-gray-400'>Loading apps...</p>
          </div>
        ) : (
          <>
            {apps === undefined ? (
              <div className='flex flex-col items-center justify-center min-h-[400px] text-center'>
                <p className='text-red-500 mb-4'>Failed to load apps</p>
                <Button onClick={() => submit(null)} variant='outline' className='gap-2'>
                  <RefreshCw className='h-4 w-4' />
                  Try again
                </Button>
              </div>
            ) : (
              <>
                {apps.length === 0 ? (
                  <div className='flex flex-col items-center justify-center min-h-[400px] text-center'>
                    <p className='text-gray-600 dark:text-gray-400 mb-2'>
                      {query ? `No apps found matching "${query}"` : 'No apps available'}
                    </p>
                    {query && (
                      <Button onClick={handleClearSearch} variant='outline' size='sm'>
                        Clear search
                      </Button>
                    )}
                  </div>
                ) : (
                  <>
                    <div className='flex items-center justify-between mb-6'>
                      <p className='text-sm text-gray-600 dark:text-gray-400'>
                        Showing {startIndex}-{endIndex} of {apps.length} apps
                      </p>
                      <div className='flex gap-2'>
                        <Button
                          variant='outline'
                          size='sm'
                          onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                          disabled={currentPage === 1}
                        >
                          Previous
                        </Button>
                        <Button
                          variant='outline'
                          size='sm'
                          onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                          disabled={currentPage === totalPages}
                        >
                          Next
                        </Button>
                      </div>
                    </div>

                    <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'>
                      {currentApps.map((app) => (
                        <a
                          key={app.id}
                          href={app.url}
                          target='_blank'
                          rel='noopener noreferrer'
                          className='group block bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-md transition-shadow overflow-hidden'
                        >
                          <div className='aspect-video w-full overflow-hidden'>
                            <img
                              src={app.thumbnail}
                              alt={app.name}
                              className='w-full h-full object-cover transition-transform group-hover:scale-105'
                            />
                          </div>
                          <div className='p-4'>
                            <h2 className='text-lg font-semibold text-gray-900 dark:text-gray-100'>{app.name}</h2>
                          </div>
                        </a>
                      ))}
                    </div>

                    <div className='mt-8 flex justify-center gap-2'>
                      <Button
                        variant='outline'
                        size='sm'
                        onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
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
                        onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                        disabled={currentPage === totalPages}
                      >
                        Next
                      </Button>
                    </div>
                  </>
                )}
              </>
            )}
          </>
        )}
      </main>
    </div>
  );
}
