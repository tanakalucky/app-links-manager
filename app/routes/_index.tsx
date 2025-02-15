import type { LoaderFunctionArgs, MetaFunction } from '@remix-run/cloudflare';
import { useLoaderData, useNavigation, useSubmit } from '@remix-run/react';
import { hc } from 'hono/client';
import { useEffect, useState } from 'react';
import { AppType } from 'server';
import { AppGrid } from '~/feature/app-links/components/app-grid';
import { EmptyState } from '~/feature/app-links/components/empty-state';
import { ErrorState } from '~/feature/app-links/components/error-state';
import { Header } from '~/feature/app-links/components/header';
import { LoadingState } from '~/feature/app-links/components/loading-state';
import { Pagination } from '~/feature/app-links/components/pagination';
import { usePagination } from '~/hooks/use-pagination';

const client = hc<AppType>(import.meta.env.VITE_API_URL);

export const meta: MetaFunction = () => {
  return [{ title: 'App Links' }, { name: 'description', content: 'Browse and manage your app links' }];
};

export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const query = url.searchParams.get('q') || '';

  try {
    const data = await client.api['app-links'].$get();
    const allApps = (await data.json()).map((v) => ({
      ...v,
      thumbnail: `https://picsum.photos/seed/${v.id}/300/200`,
    }));

    const filteredApps = query
      ? allApps.filter((app) => app.name.toLowerCase().includes(query.toLowerCase()))
      : allApps;

    return { apps: filteredApps, query };
  } catch (e) {
    console.error('Failed to fetch apps', e);
    throw new Error('Failed to fetch apps');
  }
}

export default function Index() {
  const { apps, query } = useLoaderData<typeof loader>();
  const navigation = useNavigation();
  const submit = useSubmit();
  const [searchValue, setSearchValue] = useState(query);

  const {
    currentPage,
    setCurrentPage,
    currentItems: currentApps,
    startIndex,
    endIndex,
    totalPages,
  } = usePagination(apps, 20);

  const isLoading = navigation.state === 'loading';

  useEffect(() => {
    setSearchValue(query);
  }, [query]);

  const handleSearch = (value: string) => {
    setSearchValue(value);
    setCurrentPage(1);
    submit({ q: value }, { replace: true });
  };

  if (isLoading) {
    return <LoadingState />;
  }

  return (
    <div className='min-h-screen bg-gray-50 dark:bg-gray-900'>
      <Header searchValue={searchValue} onSearch={handleSearch} />

      <main className='container mx-auto px-4 pt-24 pb-8'>
        {apps === undefined ? (
          <ErrorState onRetry={() => submit(null)} />
        ) : apps.length === 0 ? (
          <EmptyState query={query} onClear={() => handleSearch('')} />
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
