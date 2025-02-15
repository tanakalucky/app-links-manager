import { ActionFunctionArgs } from '@remix-run/node';
import { useFetcher } from '@remix-run/react';
import { hc } from 'hono/client';
import { Trash2 } from 'lucide-react';
import { useState } from 'react';
import { AppType } from 'server';
import { Button } from '~/components/ui/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '~/components/ui/dialog';
import { useToast } from '~/hooks/use-toast';
import { DialogProps } from '~/types/dialog';

const client = hc<AppType>(import.meta.env.VITE_API_URL);

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
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

export function DeleteLinkButton({ id }: { id: number }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Button
        variant='ghost'
        size='sm'
        onClick={() => setIsOpen(true)}
        className='h-8 w-8 p-0 hover:bg-red-100 dark:hover:bg-red-900/20'
      >
        <Trash2 className='h-4 w-4 text-red-500 dark:text-red-400' />
        <span className='sr-only'>Delete</span>
      </Button>

      <DeleteLinkDialog isOpen={isOpen} onOpenChange={setIsOpen} ids={[id]} />
    </>
  );
}

export function DeleteLinksButton({ ids, afterDelete }: { ids: number[]; afterDelete?: () => void }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Button variant='destructive' size='sm' onClick={() => setIsOpen(true)}>
        Delete Selected
      </Button>

      <DeleteLinkDialog isOpen={isOpen} onOpenChange={setIsOpen} ids={ids} afterDelete={afterDelete} />
    </>
  );
}

interface DeleteLinkDialogProps extends DialogProps {
  ids: number[];
  afterDelete?: () => void;
}

function DeleteLinkDialog({ isOpen, onOpenChange, ids, afterDelete }: DeleteLinkDialogProps) {
  const fetcher = useFetcher();
  const { toast } = useToast();

  const handleDelete = () => {
    if (!ids.length) {
      toast({
        title: 'Error',
        description: 'No links selected',
        variant: 'destructive',
      });
      return;
    }

    fetcher.submit({ ids: ids.join(',') }, { method: 'post', action: '/delete-link?index' });

    onOpenChange(false);

    afterDelete?.();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete {ids.length > 1 ? 'Links' : 'Link'}</DialogTitle>
        </DialogHeader>
        <div className='py-4'>
          <p className='text-sm text-gray-600 dark:text-gray-400'>
            Are you sure you want to delete {ids.length > 1 ? `these ${ids.length} links` : 'this link'}?
            <br />
            This action cannot be undone.
          </p>
        </div>
        <DialogFooter>
          <Button variant='outline' onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button variant='destructive' onClick={handleDelete}>
            Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
