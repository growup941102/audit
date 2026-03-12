import { RouterProvider } from '@/features/router';
import { useWebsiteSettings } from '@/service/hooks';

import { LazyAnimate } from './features/animate';
import { AntdContextHolder, AntdProvider } from './features/antdConfig';
import { LangProvider } from './features/lang';
import { ThemeProvider } from './features/theme';

const WebsiteBrandingSync = () => {
  const { data } = useWebsiteSettings();

  useEffect(() => {
    if (!data) return;

    if (data.websiteName) {
      document.title = data.websiteName;
    }

    if (data.favicon) {
      let iconLink = document.querySelector("link[rel='icon']") as HTMLLinkElement | null;
      if (!iconLink) {
        iconLink = document.createElement('link');
        iconLink.rel = 'icon';
        document.head.appendChild(iconLink);
      }
      iconLink.href = data.favicon;
    }
  }, [data]);

  return null;
};

const App = () => (
  <ThemeProvider>
    <LangProvider>
      <AntdProvider>
        <AntdContextHolder>
          <WebsiteBrandingSync />
          <LazyAnimate>
            <RouterProvider />
          </LazyAnimate>
        </AntdContextHolder>
      </AntdProvider>
    </LangProvider>
  </ThemeProvider>
);

export default App;
