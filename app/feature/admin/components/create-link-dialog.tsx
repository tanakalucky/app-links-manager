import { useState } from 'react';
import { Button } from '~/components/ui/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '~/components/ui/dialog';
import { Input } from '~/components/ui/input';
import { DialogProps } from './types';

interface CreateLinkDialogProps extends DialogProps {
  defaultValues?: {
    title: string;
    url: string;
  };
  onSubmit: (values: { title: string; url: string }) => void;
}

export function CreateLinkDialog({ isOpen, onOpenChange, defaultValues, onSubmit }: CreateLinkDialogProps) {
  const [values, setValues] = useState(defaultValues || { title: '', url: '' });

  const handleSubmit = () => {
    onSubmit(values);
    setValues({ title: '', url: '' });
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
