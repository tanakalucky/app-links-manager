import { type ActionFunctionArgs, type LoaderFunctionArgs } from '@remix-run/node';
import { useLoaderData, useNavigation, useSubmit } from '@remix-run/react';
import { hc } from 'hono/client';
import { RefreshCw, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { AppType } from 'server';
import { Button } from '~/components/ui/button';
import { Checkbox } from '~/components/ui/checkbox';
import { SearchInput } from '~/components/ui/search-input';
import { Spinner } from '~/components/ui/spinner';
import { DeleteLinkDialog } from '~/feature/admin/components/delete-link-dialog';
import { Pagination } from '~/feature/app-links/components/pagination';
import { usePagination } from '~/hooks/use-pagination';
import { useToast } from '~/hooks/use-toast';
import { AddLinkButton } from '../add-link';
import { EditLinkButton } from '../edit-link';

const client = hc<AppType>(import.meta.env.VITE_API_URL);

export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const query = url.searchParams.get('q') || '';

  try {
    const data = await client.api['app-links'].$get();
    const allLinks = await data.json();

    const filteredLinks = query
      ? allLinks.filter(
          (link) =>
            link.name.toLowerCase().includes(query.toLowerCase()) ||
            link.url.toLowerCase().includes(query.toLowerCase()),
        )
      : allLinks;

    const mappedLinks = filteredLinks.map((link) => ({
      id: link.id,
      url: link.url,
      title: link.name,
    }));

    return { links: mappedLinks, query };
  } catch (error) {
    console.error('Failed to fetch links:', error);
    throw new Error('Failed to fetch links');
  }
}

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const intent = formData.get('intent');

  try {
    switch (intent) {
      case 'create': {
        const title = formData.get('title');
        const url = formData.get('url');

        if (!title || !url) {
          return { success: false, message: 'Title and URL are required' };
        }

        const response = await client.api['app-links'].create.$post({
          json: {
            name: title,
            url: url,
          },
        });

        if (!response.ok) {
          const error = await response.json();
          return { success: false, message: error || 'Failed to create link' };
        }

        return { success: true, message: 'Link created successfully' };
      }
      case 'update': {
        const id = formData.get('id');
        const title = formData.get('title');
        const url = formData.get('url');

        if (!id || !title || !url) {
          return { success: false, message: 'ID, Title and URL are required' };
        }

        const response = await client.api['app-links'].update.$post({
          json: {
            id: Number(id),
            name: title,
            url: url,
          },
        });

        if (!response.ok) {
          const error = await response.json();
          return { success: false, message: error || 'Failed to update link' };
        }

        return { success: true, message: 'Link updated successfully' };
      }
      case 'delete': {
        const ids = formData.get('ids')?.toString().split(',').map(Number);

        if (!ids?.length) {
          return { success: false, message: 'No links selected' };
        }

        const response = await client.api['app-links'].delete.$post({
          json: { ids },
        });

        if (!response.ok) {
          const error = await response.json();
          return { success: false, message: error || 'Failed to delete links' };
        }

        return { success: true, message: 'Links deleted successfully' };
      }
      default:
        return { success: false, message: 'Invalid action' };
    }
  } catch (error) {
    console.error('Action failed:', error);
    return { success: false, message: 'Action failed' };
  }
}

export default function AdminLinks() {
  const { links, query } = useLoaderData<typeof loader>();
  const navigation = useNavigation();
  const submit = useSubmit();
  const { toast } = useToast();
  const [searchValue, setSearchValue] = useState(query);
  const [selectedLinks, setSelectedLinks] = useState<number[]>([]);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deletingIds, setDeletingIds] = useState<number[]>([]);

  const isLoading = navigation.state === 'loading';

  useEffect(() => {
    setSearchValue(query);
  }, [query]);

  useEffect(() => {
    if (navigation.state === 'loading' && navigation.formData) {
      const intent = navigation.formData.get('intent');

      if (intent === 'create') {
        toast({
          title: 'Success',
          description: 'Link created successfully',
        });
      } else if (intent === 'update') {
        toast({
          title: 'Success',
          description: 'Link updated successfully',
        });
      }
    }
  }, [navigation.state, toast]);

  const {
    currentPage,
    setCurrentPage,
    currentItems: currentLinks,
    startIndex,
    endIndex,
    totalPages,
  } = usePagination(links, 10);

  const handleSearch = (value: string) => {
    setSearchValue(value);
    setCurrentPage(1);
    submit({ q: value }, { replace: true });
  };

  const handleDeleteConfirm = (ids: number[]) => {
    if (!ids.length) {
      toast({
        title: 'Error',
        description: 'No links selected',
        variant: 'destructive',
      });
      return;
    }

    const formData = new FormData();
    formData.append('intent', 'delete');
    formData.append('ids', ids.join(','));
    submit(formData, { method: 'post', replace: true });
    setIsDeleteDialogOpen(false);
    setDeletingIds([]);
    setSelectedLinks([]);
  };

  const handleDeleteLink = (id: number) => {
    setDeletingIds([id]);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteSelected = () => {
    setDeletingIds(selectedLinks);
    setIsDeleteDialogOpen(true);
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
                <Button onClick={() => submit(null)} variant='outline' className='gap-2'>
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
                      <Button onClick={() => handleSearch('')} variant='outline' size='sm'>
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
                          <Button variant='destructive' size='sm' onClick={handleDeleteSelected}>
                            Delete Selected
                          </Button>
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
                                Title
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
                                <td className='p-4 text-sm text-gray-900 dark:text-gray-100'>{link.title}</td>
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
                                    <EditLinkButton appLink={{ id: link.id, name: link.title, url: link.url }} />

                                    <Button
                                      variant='ghost'
                                      size='sm'
                                      onClick={() => handleDeleteLink(link.id)}
                                      className='h-8 w-8 p-0 hover:bg-red-100 dark:hover:bg-red-900/20'
                                    >
                                      <Trash2 className='h-4 w-4 text-red-500 dark:text-red-400' />
                                      <span className='sr-only'>Delete</span>
                                    </Button>
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

      <DeleteLinkDialog
        isOpen={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        ids={deletingIds}
        onConfirm={handleDeleteConfirm}
      />
    </div>
  );
}
