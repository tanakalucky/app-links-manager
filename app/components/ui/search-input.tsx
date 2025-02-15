import { Search } from 'lucide-react';
import { Input } from '~/components/ui/input';

interface SearchInputProps {
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
}

export function SearchInput({ placeholder = 'Search...', value, onChange }: SearchInputProps) {
  return (
    <div className='relative'>
      <Input
        type='search'
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className='pl-10'
      />
      <Search className='absolute left-3 top-2.5 h-4 w-4 text-gray-500 dark:text-gray-400' />
    </div>
  );
}
