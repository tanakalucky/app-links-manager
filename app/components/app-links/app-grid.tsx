import { AppLinkWithThumbnail } from '~/types/app-link';

interface AppGridProps {
  apps: AppLinkWithThumbnail[];
}

export function AppGrid({ apps }: AppGridProps) {
  return (
    <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'>
      {apps.map((app) => (
        <AppCard key={app.id} app={app} />
      ))}
    </div>
  );
}

interface AppCardProps {
  app: AppLinkWithThumbnail;
}

function AppCard({ app }: AppCardProps) {
  return (
    <a
      href={app.url}
      target='_blank'
      rel='noopener noreferrer'
      className='group block bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-md transition-shadow overflow-hidden'
    >
      <div className='aspect-video w-full overflow-hidden'>
        <img
          src={app.thumbnail}
          alt={app.name}
          className='w-full h-full object-cover transition-transform group-hover:scale-105'
        />
      </div>
      <div className='p-4'>
        <h2 className='text-lg font-semibold text-gray-900 dark:text-gray-100'>{app.name}</h2>
      </div>
    </a>
  );
}
