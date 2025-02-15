import type { LinksFunction } from '@remix-run/cloudflare';
import { Links, Meta, Outlet, Scripts, ScrollRestoration, isRouteErrorResponse, useRouteError } from '@remix-run/react';
import { RefreshCw } from 'lucide-react';
import { Button } from '~/components/ui/button';

import './tailwind.css';
import { ReactNode } from 'react';

import { Toaster } from './components/ui/toaster';
import styles from './tailwind.css?url';

export const links: LinksFunction = () => [
  { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
  {
    rel: 'preconnect',
    href: 'https://fonts.gstatic.com',
    crossOrigin: 'anonymous',
  },
  {
    rel: 'stylesheet',
    href: 'https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap',
  },
  { rel: 'stylesheet', href: styles },
];

export function ErrorBoundary() {
  const error = useRouteError();

  return (
    <html lang='en'>
      <head>
        <meta charSet='utf-8' />
        <meta name='viewport' content='width=device-width, initial-scale=1' />
        <Meta />
        <Links />
      </head>
      <body>
        <div className='min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4'>
          <div className='text-center'>
            <h1 className='text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4'>
              {isRouteErrorResponse(error) ? `${error.status} ${error.statusText}` : 'Error'}
            </h1>
            <p className='text-gray-600 dark:text-gray-400 mb-6'>
              {isRouteErrorResponse(error) ? error.data : 'An unexpected error occurred'}
            </p>
            <Button onClick={() => window.location.reload()} variant='outline' className='gap-2'>
              <RefreshCw className='h-4 w-4' />
              Try again
            </Button>
          </div>
        </div>
        <Scripts />
      </body>
    </html>
  );
}

export function Layout({ children }: { children: ReactNode }) {
  return (
    <html lang='en'>
      <head>
        <meta charSet='utf-8' />
        <meta name='viewport' content='width=device-width, initial-scale=1' />
        <Meta />
        <Links />
      </head>
      <body>
        {children}
        <Toaster />
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  return <Outlet />;
}
