import clsx from 'clsx';
import { Link } from 'react-router-dom';
import type { LinkProps } from 'react-router-dom';

import SystemLogo from '@/components/SystemLogo';
import { useWebsiteSettings } from '@/service/hooks';

interface Props extends Omit<LinkProps, 'to'> {
  /** Whether to show the title */
  showTitle?: boolean;
}
const GlobalLogo: FC<Props> = memo(({ className, showTitle = true, ...props }) => {
  const { t } = useTranslation();
  const { data } = useWebsiteSettings();

  return (
    <Link
      className={clsx('w-full flex-center nowrap-hidden', className)}
      to={import.meta.env.VITE_ROUTE_HOME}
      {...props}
    >
      <SystemLogo className="h-32px w-32px text-32px text-primary" />
      <h2
        className="pl-8px text-16px text-primary font-bold transition duration-300 ease-in-out"
        style={{ display: showTitle ? 'block' : 'none' }}
      >
        {data?.websiteName || t('system.title')}
      </h2>
    </Link>
  );
});

export default GlobalLogo;
