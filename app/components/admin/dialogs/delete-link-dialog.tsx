import { Button } from '~/components/ui/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '~/components/ui/dialog';
import { DialogProps } from '../types';

interface DeleteLinkDialogProps extends DialogProps {
  ids: number[];
  onConfirm: (ids: number[]) => void;
}

export function DeleteLinkDialog({ isOpen, onOpenChange, ids, onConfirm }: DeleteLinkDialogProps) {
  const handleConfirm = () => {
    onConfirm(ids);
    onOpenChange(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete {ids.length > 1 ? 'Links' : 'Link'}</DialogTitle>
        </DialogHeader>
        <div className='py-4'>
          <p className='text-sm text-gray-600 dark:text-gray-400'>
            Are you sure you want to delete {ids.length > 1 ? `these ${ids.length} links` : 'this link'}? This action
            cannot be undone.
          </p>
        </div>
        <DialogFooter>
          <Button variant='outline' onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button variant='destructive' onClick={handleConfirm}>
            Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
