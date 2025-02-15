import { useLoaderData, useNavigation } from '@remix-run/react';
import { hc } from 'hono/client';
import { RefreshCw } from 'lucide-react';
import { useState } from 'react';
import { AppType } from 'server';
import { Pagination } from '~/components/app-links/pagination';
import { Button } from '~/components/ui/button';
import { Checkbox } from '~/components/ui/checkbox';
import { SearchInput } from '~/components/ui/search-input';
import { Spinner } from '~/components/ui/spinner';
import { usePagination } from '~/hooks/use-pagination';
import { AddLinkButton } from '../add-link';
import { DeleteLinkButton, DeleteLinksButton } from '../delete-link';
import { EditLinkButton } from '../edit-link';

const client = hc<AppType>(import.meta.env.VITE_API_URL);

export async function loader() {
  try {
    const data = await client.api['app-links'].$get();

    const links = await data.json();

    return { links };
  } catch (error) {
    console.error('Failed to fetch links:', error);
    throw new Error('Failed to fetch links');
  }
}

export default function AdminLinks() {
  const { links } = useLoaderData<typeof loader>();
  const navigation = useNavigation();
  const [searchValue, setSearchValue] = useState('');
  const [selectedLinks, setSelectedLinks] = useState<number[]>([]);

  const filteredLinks = searchValue
    ? links.filter(
        (link) =>
          link.name.toLowerCase().includes(searchValue.toLowerCase()) ||
          link.url.toLowerCase().includes(searchValue.toLowerCase()),
      )
    : links;

  const {
    currentPage,
    setCurrentPage,
    currentItems: currentLinks,
    startIndex,
    endIndex,
    totalPages,
  } = usePagination(filteredLinks, 10);

  const isLoading = navigation.state === 'loading';

  const handleSearch = (value: string) => {
    setSearchValue(value);
    setCurrentPage(1);
  };

  return (
    <div className='min-h-screen bg-gray-50 dark:bg-gray-900'>
      <header className='fixed top-0 left-0 right-0 z-10 border-b bg-white/80 backdrop-blur-sm dark:bg-gray-950/80 dark:border-gray-800'>
        <div className='container mx-auto px-4 h-16 flex items-center justify-between'>
          <h1 className='text-2xl font-bold text-gray-900 dark:text-gray-100'>Link Management</h1>

          <div className='flex items-center gap-4'>
            <SearchInput placeholder='Search links...' value={searchValue} onChange={handleSearch} />

            <AddLinkButton />
          </div>
        </div>
      </header>

      <main className='container mx-auto px-4 pt-24 pb-8'>
        {isLoading ? (
          <div className='flex flex-col items-center justify-center min-h-[400px]'>
            <Spinner className='w-8 h-8 text-blue-500' />
            <p className='mt-4 text-gray-600 dark:text-gray-400'>Loading links...</p>
          </div>
        ) : (
          <>
            {links === undefined ? (
              <div className='flex flex-col items-center justify-center min-h-[400px] text-center'>
                <p className='text-red-500 mb-4'>Failed to load links</p>
                <Button onClick={() => setSearchValue('')} variant='outline' className='gap-2'>
                  <RefreshCw className='h-4 w-4' />
                  Try again
                </Button>
              </div>
            ) : (
              <>
                {links.length === 0 ? (
                  <div className='flex flex-col items-center justify-center min-h-[400px] text-center'>
                    <p className='text-gray-600 dark:text-gray-400 mb-2'>
                      {searchValue ? `No links found matching "${searchValue}"` : 'No links available'}
                    </p>
                    {searchValue && (
                      <Button onClick={() => setSearchValue('')} variant='outline' size='sm'>
                        Clear search
                      </Button>
                    )}
                  </div>
                ) : (
                  <>
                    {selectedLinks.length > 0 && (
                      <div className='mb-4 p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm'>
                        <div className='flex items-center justify-between'>
                          <p className='text-sm text-gray-600 dark:text-gray-400'>
                            {selectedLinks.length} items selected
                          </p>

                          <DeleteLinksButton ids={selectedLinks} afterDelete={() => setSelectedLinks([])} />
                        </div>
                      </div>
                    )}

                    <div className='bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden'>
                      <div className='overflow-x-auto'>
                        <table className='w-full'>
                          <thead>
                            <tr className='border-b dark:border-gray-700'>
                              <th className='w-8 p-4'>
                                <Checkbox
                                  checked={selectedLinks.length === currentLinks.length}
                                  onCheckedChange={(checked) => {
                                    if (checked) {
                                      setSelectedLinks(currentLinks.map((link) => link.id));
                                    } else {
                                      setSelectedLinks([]);
                                    }
                                  }}
                                />
                              </th>
                              <th className='p-4 text-left text-sm font-medium text-gray-500 dark:text-gray-400 cursor-pointer'>
                                Name
                              </th>
                              <th className='p-4 text-left text-sm font-medium text-gray-500 dark:text-gray-400 cursor-pointer'>
                                URL
                              </th>
                              <th className='w-8 p-4'></th>
                            </tr>
                          </thead>

                          <tbody>
                            {currentLinks.map((link) => (
                              <tr
                                key={link.id}
                                className='border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50'
                              >
                                <td className='p-4'>
                                  <Checkbox
                                    checked={selectedLinks.includes(link.id)}
                                    onCheckedChange={(checked) => {
                                      if (checked) {
                                        setSelectedLinks([...selectedLinks, link.id]);
                                      } else {
                                        setSelectedLinks(selectedLinks.filter((id) => id !== link.id));
                                      }
                                    }}
                                  />
                                </td>
                                <td className='p-4 text-sm text-gray-900 dark:text-gray-100'>{link.name}</td>
                                <td className='p-4 text-sm text-gray-900 dark:text-gray-100'>
                                  <a
                                    href={link.url}
                                    target='_blank'
                                    rel='noopener noreferrer'
                                    className='text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300'
                                  >
                                    {link.url}
                                  </a>
                                </td>
                                <td className='p-4'>
                                  <div className='flex items-center justify-center gap-2'>
                                    <EditLinkButton appLink={link} />

                                    <DeleteLinkButton id={link.id} />
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>

                      <div className='p-4 border-t dark:border-gray-700'>
                        <Pagination
                          currentPage={currentPage}
                          totalPages={totalPages}
                          onPageChange={setCurrentPage}
                          startIndex={startIndex}
                          endIndex={endIndex}
                          totalItems={links.length}
                          className='justify-between'
                        >
                          <Pagination.ItemsInfo />

                          <div className='flex items-center gap-2'>
                            <Pagination.PreviousButton />
                            <Pagination.NextButton />
                          </div>
                        </Pagination>
                      </div>
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
