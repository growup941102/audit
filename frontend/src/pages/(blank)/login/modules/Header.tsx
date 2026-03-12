import SystemLogo from '@/components/SystemLogo';
import { useWebsiteSettings } from '@/service/hooks';

const Header = memo(() => {
  const { t } = useTranslation();
  const { data } = useWebsiteSettings();

  return (
    <header className="flex items-center justify-center gap-12px text-center">
      <SystemLogo className="h-56px w-56px text-primary lt-sm:h-44px lt-sm:w-44px" />

      <h1 className="m-0 whitespace-nowrap text-28px text-primary font-500 lt-sm:text-22px">
        {data?.websiteName || t('system.title')}
      </h1>
    </header>
  );
});

export default Header;
