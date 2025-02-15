import { ActionFunctionArgs } from '@remix-run/cloudflare';
import { useFetcher } from '@remix-run/react';
import { hc } from 'hono/client';
import { Pencil } from 'lucide-react';
import { useState } from 'react';
import { AppType } from 'server';
import { Button } from '~/components/ui/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '~/components/ui/dialog';
import { Input } from '~/components/ui/input';
import { useToast } from '~/hooks/use-toast';
import { AppLink } from '~/types/app-link';
import { DialogProps } from '~/types/dialog';

const client = hc<AppType>(import.meta.env.VITE_API_URL);

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();

  const id = formData.get('id');
  const name = formData.get('name');
  const url = formData.get('url');

  if (!id || !name || !url) {
    return { success: false, message: 'ID, Name and URL are required' };
  }

  const response = await client.api['app-links'].update.$post({
    json: {
      id: Number(id),
      name: name,
      url: url,
    },
  });

  if (!response.ok) {
    const error = await response.json();
    return { success: false, message: error || 'Failed to update link' };
  }

  return { success: true, message: 'Link updated successfully' };
}

export function EditLinkButton({ appLink }: { appLink: AppLink }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Button
        variant='ghost'
        size='sm'
        onClick={() => setIsOpen(true)}
        className='h-8 w-8 p-0 hover:bg-gray-100 dark:hover:bg-gray-700'
      >
        <Pencil className='h-4 w-4 text-gray-500 dark:text-gray-400' />
        <span className='sr-only'>Edit</span>
      </Button>

      <EditLinkDialog isOpen={isOpen} onOpenChange={setIsOpen} appLink={appLink} />
    </>
  );
}

interface EditLinkDialogProps extends DialogProps {
  appLink: AppLink;
}

function EditLinkDialog({ isOpen, onOpenChange, appLink: link }: EditLinkDialogProps) {
  const fetcher = useFetcher();
  const { toast } = useToast();
  const [values, setValues] = useState(link);

  const handleSubmit = () => {
    handleUpdateLink({ id: values.id, name: values.name, url: values.url });
  };

  const handleUpdateLink = (values: { id: number; name: string; url: string }) => {
    if (!values.name || !values.url) {
      toast({
        title: 'Error',
        description: 'Name and URL are required',
        variant: 'destructive',
      });
      return;
    }

    fetcher.submit(values, { method: 'post', action: '/edit-link?index' });

    onOpenChange(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Link</DialogTitle>
        </DialogHeader>

        <div className='space-y-4 py-4'>
          <div className='space-y-2'>
            <label htmlFor='edit-name' className='text-sm font-medium text-gray-700 dark:text-gray-300'>
              Name
            </label>
            <Input
              id='edit-name'
              value={values.name}
              onChange={(e) => setValues((prev) => ({ ...prev, name: e.target.value }))}
            />
          </div>
          <div className='space-y-2'>
            <label htmlFor='edit-url' className='text-sm font-medium text-gray-700 dark:text-gray-300'>
              URL
            </label>
            <Input
              id='edit-url'
              type='url'
              value={values.url}
              onChange={(e) => setValues((prev) => ({ ...prev, url: e.target.value }))}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant='outline' onClick={() => onOpenChange(false)}>
            Cancel
          </Button>

          <Button onClick={handleSubmit}>Update</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
