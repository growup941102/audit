import { useWebsiteSettings } from '@/service/hooks';

interface Props {
  className?: string;
}

const SystemLogo = ({ className }: Props) => {
  const { data } = useWebsiteSettings();

  if (data?.logo) {
    return (
      <img
        alt={data.websiteName || 'logo'}
        className={`${className || ''} object-contain`}
        src={data.logo}
      />
    );
  }

  return <IconLocalLogo className={className} />;
};

export default SystemLogo;
