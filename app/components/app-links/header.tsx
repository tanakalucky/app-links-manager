import { Search } from 'lucide-react';
import { Input } from '~/components/ui/input';

interface HeaderProps {
  searchValue: string;
  onSearch: (value: string) => void;
}

export function Header({ searchValue, onSearch }: HeaderProps) {
  return (
    <header className='fixed top-0 left-0 right-0 z-10 border-b bg-white/80 backdrop-blur-sm dark:bg-gray-950/80 dark:border-gray-800'>
      <div className='container mx-auto px-4 h-16 flex items-center justify-between'>
        <h1 className='text-2xl font-bold text-gray-900 dark:text-gray-100'>App Links</h1>
        <div className='relative w-72'>
          <Input
            type='search'
            placeholder='Search apps...'
            value={searchValue}
            onChange={(e) => onSearch(e.target.value)}
            className='pl-10'
          />
          <Search className='absolute left-3 top-2.5 h-4 w-4 text-gray-500 dark:text-gray-400' />
        </div>
      </div>
    </header>
  );
}
