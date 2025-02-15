import type { MetaFunction } from '@remix-run/cloudflare';
import { useLoaderData, useNavigation } from '@remix-run/react';
import { hc } from 'hono/client';
import { useState } from 'react';
import { AppType } from 'server';
import { AppGrid } from '~/components/app-links/app-grid';
import { EmptyState } from '~/components/app-links/empty-state';
import { ErrorState } from '~/components/app-links/error-state';
import { Header } from '~/components/app-links/header';
import { LoadingState } from '~/components/app-links/loading-state';
import { Pagination } from '~/components/app-links/pagination';
import { usePagination } from '~/hooks/use-pagination';

const client = hc<AppType>(import.meta.env.VITE_API_URL);

export const meta: MetaFunction = () => {
  return [{ title: 'App Links' }, { name: 'description', content: 'Browse and manage your app links' }];
};

export async function loader() {
  try {
    const data = await client.api['app-links'].$get();

    const apps = (await data.json()).map((v) => ({
      ...v,
      thumbnail: `https://picsum.photos/seed/${v.id}/300/200`,
    }));

    return { apps };
  } catch (e) {
    console.error('Failed to fetch apps', e);
    throw new Error('Failed to fetch apps');
  }
}

export default function Index() {
  const { apps } = useLoaderData<typeof loader>();
  const navigation = useNavigation();
  const [searchValue, setSearchValue] = useState('');

  const filteredApps = searchValue
    ? apps.filter((app) => app.name.toLowerCase().includes(searchValue.toLowerCase()))
    : apps;

  const {
    currentPage,
    setCurrentPage,
    currentItems: currentApps,
    startIndex,
    endIndex,
    totalPages,
  } = usePagination(filteredApps, 20);

  const isLoading = navigation.state === 'loading';

  const handleSearch = (value: string) => {
    setSearchValue(value);
    setCurrentPage(1);
  };

  if (isLoading) {
    return <LoadingState />;
  }

  return (
    <div className='min-h-screen bg-gray-50 dark:bg-gray-900'>
      <Header searchValue={searchValue} onSearch={handleSearch} />

      <main className='container mx-auto px-4 pt-24 pb-8'>
        {apps === undefined ? (
          <ErrorState onRetry={() => handleSearch('')} />
        ) : apps.length === 0 ? (
          <EmptyState query={searchValue} onClear={() => handleSearch('')} />
        ) : (
          <div className='flex flex-col gap-4'>
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
              startIndex={startIndex}
              endIndex={endIndex}
              totalItems={apps.length}
              className='justify-between'
            >
              <Pagination.ItemsInfo />

              <div className='flex items-center gap-2'>
                <Pagination.PreviousButton />
                <Pagination.NextButton />
              </div>
            </Pagination>

            <AppGrid apps={currentApps} />

            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
              className='justify-center gap-2'
            >
              <Pagination.PreviousButton />
              <Pagination.PageInfo />
              <Pagination.NextButton />
            </Pagination>
          </div>
        )}
      </main>
    </div>
  );
}
