import { useEffect, useState } from 'react';
import { Button } from '~/components/ui/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '~/components/ui/dialog';
import { Input } from '~/components/ui/input';
import { DialogProps, Link } from '../types';

interface EditLinkDialogProps extends DialogProps {
  link: Link | null;
  onSubmit: (values: { id: number; title: string; url: string }) => void;
}

export function EditLinkDialog({ isOpen, onOpenChange, link, onSubmit }: EditLinkDialogProps) {
  const [values, setValues] = useState(link || { id: 0, title: '', url: '' });

  useEffect(() => {
    if (link) {
      setValues(link);
    }
  }, [link]);

  const handleSubmit = () => {
    if (link) {
      onSubmit(values);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
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
              value={values.title}
              onChange={(e) => setValues((prev) => ({ ...prev, title: e.target.value }))}
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
