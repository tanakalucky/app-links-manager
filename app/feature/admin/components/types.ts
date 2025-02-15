export interface Link {
  id: number;
  url: string;
  title: string;
}

export interface DialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}
