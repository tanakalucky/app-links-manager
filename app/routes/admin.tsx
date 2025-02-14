import { type ActionFunctionArgs, type LoaderFunctionArgs } from '@remix-run/node';
import { useLoaderData, useNavigation, useSubmit } from '@remix-run/react';
import { hc } from 'hono/client';
import { MoreVertical, Pencil, Plus, RefreshCw, Search, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { AppType } from 'server';
import { Button } from '~/components/ui/button';
import { Checkbox } from '~/components/ui/checkbox';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '~/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '~/components/ui/dropdown-menu';
import { Input } from '~/components/ui/input';
import { Spinner } from '~/components/ui/spinner';
import { useToast } from '~/hooks/use-toast';

const client = hc<AppType>(import.meta.env.VITE_API_URL);

interface Link {
  id: number;
  url: string;
  title: string;
}

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
      case 'update':
        return { success: true, message: 'Link updated successfully' };
      case 'delete':
        return { success: true, message: 'Link deleted successfully' };
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
  const [currentPage, setCurrentPage] = useState(1);
  const [searchValue, setSearchValue] = useState(query);
  const [selectedLinks, setSelectedLinks] = useState<number[]>([]);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingLink, setEditingLink] = useState<Link | null>(null);
  const [newLink, setNewLink] = useState({ url: '', title: '' });

  const isLoading = navigation.state === 'loading';

  useEffect(() => {
    setSearchValue(query);
  }, [query]);

  const itemsPerPage = 10;
  const totalPages = Math.ceil(links.length / itemsPerPage);
  const currentLinks = links.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const startIndex = links.length ? (currentPage - 1) * itemsPerPage + 1 : 0;
  const endIndex = Math.min(currentPage * itemsPerPage, links.length);

  const handleSearch = (value: string) => {
    setSearchValue(value);
    setCurrentPage(1);
    submit({ q: value }, { replace: true });
  };

  const handleCreateLink = () => {
    if (!newLink.title || !newLink.url) {
      toast({
        title: 'Error',
        description: 'Title and URL are required',
        variant: 'destructive',
      });
      return;
    }

    submit(
      {
        intent: 'create',
        title: newLink.title,
        url: newLink.url,
      },
      {
        method: 'POST',
        replace: true,
      },
    );
    setIsCreateDialogOpen(false);
    setNewLink({ url: '', title: '' });
  };

  const handleEditLink = (link: Link) => {
    setEditingLink(link);
    setIsEditDialogOpen(true);
  };

  const handleUpdateLink = () => {
    if (!editingLink) return;
    const { id, ...rest } = editingLink;
    submit({ intent: 'update', id, ...rest }, { method: 'POST', replace: true });
    setIsEditDialogOpen(false);
    setEditingLink(null);
    toast({
      title: 'Success',
      description: 'Link updated successfully',
    });
  };

  const handleDeleteLink = (id: number) => {
    submit({ intent: 'delete', id }, { method: 'POST', replace: true });
    toast({
      title: 'Success',
      description: 'Link deleted successfully',
    });
  };

  const handleDeleteSelected = () => {
    submit({ intent: 'delete', ids: selectedLinks.join(',') }, { method: 'POST', replace: true });
    setSelectedLinks([]);
    toast({
      title: 'Success',
      description: 'Selected links deleted successfully',
    });
  };

  return (
    <div className='min-h-screen bg-gray-50 dark:bg-gray-900'>
      <header className='fixed top-0 left-0 right-0 z-10 border-b bg-white/80 backdrop-blur-sm dark:bg-gray-950/80 dark:border-gray-800'>
        <div className='container mx-auto px-4 h-16 flex items-center justify-between'>
          <h1 className='text-2xl font-bold text-gray-900 dark:text-gray-100'>Link Management</h1>
          <div className='flex items-center gap-4'>
            <div className='relative w-72'>
              <Input
                type='search'
                placeholder='Search links...'
                value={searchValue}
                onChange={(e) => handleSearch(e.target.value)}
                className='pl-10'
              />
              <Search className='absolute left-3 top-2.5 h-4 w-4 text-gray-500 dark:text-gray-400' />
            </div>
            <Button onClick={() => setIsCreateDialogOpen(true)} className='gap-2'>
              <Plus className='h-4 w-4' />
              Add Link
            </Button>
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
                                  <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                      <Button variant='ghost' size='sm' className='h-8 w-8 p-0'>
                                        <MoreVertical className='h-4 w-4' />
                                      </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align='end'>
                                      <DropdownMenuItem onClick={() => handleEditLink(link)} className='gap-2'>
                                        <Pencil className='h-4 w-4' />
                                        Edit
                                      </DropdownMenuItem>
                                      <DropdownMenuItem
                                        onClick={() => handleDeleteLink(link.id)}
                                        className='gap-2 text-red-600 dark:text-red-400'
                                      >
                                        <Trash2 className='h-4 w-4' />
                                        Delete
                                      </DropdownMenuItem>
                                    </DropdownMenuContent>
                                  </DropdownMenu>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>

                      <div className='p-4 border-t dark:border-gray-700'>
                        <div className='flex items-center justify-between'>
                          <p className='text-sm text-gray-600 dark:text-gray-400'>
                            Showing {startIndex}-{endIndex} of {links.length} links
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
                      </div>
                    </div>
                  </>
                )}
              </>
            )}
          </>
        )}
      </main>

      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Link</DialogTitle>
          </DialogHeader>
          <div className='space-y-4 py-4'>
            <div className='space-y-2'>
              <label htmlFor='title' className='text-sm font-medium text-gray-700 dark:text-gray-300'>
                Title
              </label>
              <Input
                id='title'
                value={newLink.title}
                onChange={(e) => setNewLink((prev) => ({ ...prev, title: e.target.value }))}
              />
            </div>
            <div className='space-y-2'>
              <label htmlFor='url' className='text-sm font-medium text-gray-700 dark:text-gray-300'>
                URL
              </label>
              <Input
                id='url'
                type='url'
                value={newLink.url}
                onChange={(e) => setNewLink((prev) => ({ ...prev, url: e.target.value }))}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant='outline' onClick={() => setIsCreateDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateLink}>Create</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Link</DialogTitle>
          </DialogHeader>
          <div className='space-y-4 py-4'>
            <div className='space-y-2'>
              <label htmlFor='edit-title' className='text-sm font-medium text-gray-700 dark:text-gray-300'>
                Title
              </label>
              <Input
                id='edit-title'
                value={editingLink?.title || ''}
                onChange={(e) => setEditingLink((prev) => (prev ? { ...prev, title: e.target.value } : null))}
              />
            </div>
            <div className='space-y-2'>
              <label htmlFor='edit-url' className='text-sm font-medium text-gray-700 dark:text-gray-300'>
                URL
              </label>
              <Input
                id='edit-url'
                type='url'
                value={editingLink?.url || ''}
                onChange={(e) => setEditingLink((prev) => (prev ? { ...prev, url: e.target.value } : null))}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant='outline'
              onClick={() => {
                setIsEditDialogOpen(false);
                setEditingLink(null);
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleUpdateLink}>Update</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
