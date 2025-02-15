import { type ActionFunctionArgs } from '@remix-run/node';
import { useFetcher } from '@remix-run/react';
import { hc } from 'hono/client';
import { Plus } from 'lucide-react';
import { useState } from 'react';
import { AppType } from 'server';
import { Button } from '~/components/ui/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '~/components/ui/dialog';
import { Input } from '~/components/ui/input';
import { DialogProps } from '~/feature/admin/components/types';
import { useToast } from '~/hooks/use-toast';

const client = hc<AppType>(import.meta.env.VITE_API_URL);

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const title = formData.get('title');
  const url = formData.get('url');

  if (!title || !url) {
    return { success: false, message: 'Title and URL are required' };
  }

  try {
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
  } catch (error) {
    console.error('Action failed:', error);
    return { success: false, message: 'Action failed' };
  }
}

export function AddLinkButton() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setIsOpen(true)} className='gap-2'>
        <Plus className='h-4 w-4' />
        Add Link
      </Button>

      <AddLinkDialog isOpen={isOpen} onOpenChange={setIsOpen} />
    </>
  );
}

function AddLinkDialog({ isOpen, onOpenChange }: DialogProps) {
  const fetcher = useFetcher();
  const { toast } = useToast();
  const [values, setValues] = useState({ title: '', url: '' });

  const handleSubmit = () => {
    handleCreateLink(values);
    setValues({ title: '', url: '' });
  };

  const handleCreateLink = (values: { title: string; url: string }) => {
    if (!values.title || !values.url) {
      toast({
        title: 'Error',
        description: 'Title and URL are required',
        variant: 'destructive',
      });
      return;
    }

    const formData = new FormData();
    formData.append('title', values.title);
    formData.append('url', values.url);
    fetcher.submit(formData, {
      method: 'post',
      action: '/create-link?index',
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
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
              value={values.title}
              onChange={(e) => setValues((prev) => ({ ...prev, title: e.target.value }))}
            />
          </div>
          <div className='space-y-2'>
            <label htmlFor='url' className='text-sm font-medium text-gray-700 dark:text-gray-300'>
              URL
            </label>
            <Input
              id='url'
              type='url'
              value={values.url}
              onChange={(e) => setValues((prev) => ({ ...prev, url: e.target.value }))}
            />
          </div>
        </div>
        <DialogFooter>
          <Button
            variant='outline'
            onClick={() => {
              onOpenChange(false);
              setValues({ title: '', url: '' });
            }}
          >
            Cancel
          </Button>
          <Button onClick={handleSubmit}>Create</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
