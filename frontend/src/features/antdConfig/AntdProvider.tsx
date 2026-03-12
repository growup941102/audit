import type { PropsWithChildren } from 'react';

import { globalConfig } from '@/config';
import { info } from '@/constants/app';
import { router } from '@/features/router';
import { themeColors } from '@/features/theme';
import {
  getAntdTheme,
  setupThemeVarsToHtml,
  toggleAuxiliaryColorModes,
  toggleGrayscaleMode
} from '@/features/theme/shared';
import { useThemeSettings } from '@/features/theme/themeHook';
import { antdLocales } from '@/locales/antd';
import { useWatermarkSettings } from '@/service/hooks';
import { localStg } from '@/utils/storage';

import { useLang } from '../lang';
import { useTheme } from '../theme';

const WATERMARK_SETTINGS_PATH = '/system-settings/watermark-settings';

function useAntdTheme() {
  const themeSettings = useThemeSettings();

  const colors = useAppSelector(themeColors);

  const { darkMode } = useTheme();

  const antdTheme = getAntdTheme(colors, darkMode, themeSettings.tokens);

  useEffect(() => {
    setupThemeVarsToHtml(colors, themeSettings.tokens, themeSettings.recommendColor);

    localStg.set('themeColor', colors.primary);

    toggleAuxiliaryColorModes(themeSettings.colourWeakness);

    toggleGrayscaleMode(themeSettings.grayscale);
  }, [colors, themeSettings]);

  console.info(`%c${info}`, `color: ${colors.primary}`);

  return { antdTheme, watermarkText: themeSettings.watermark.text, watermarkVisible: themeSettings.watermark.visible };
}

function useCurrentPathname() {
  return useSyncExternalStore(
    onStoreChange => {
      const unsubscribeRouter = router.subscribe(onStoreChange);
      const unsubscribeLocation = router.reactRouter.subscribe(onStoreChange);

      return () => {
        unsubscribeLocation();
        unsubscribeRouter();
      };
    },
    () => router.getPathname(),
    () => router.getPathname()
  );
}

function AntdConfig({ children }: PropsWithChildren) {
  const { locale } = useLang();
  const pathname = useCurrentPathname();

  const { antdTheme, watermarkText, watermarkVisible } = useAntdTheme();
  const { data: serverWatermark } = useWatermarkSettings();
  const normalizedPathname = pathname.replace(/\/+$/, '') || '/';
  const isWatermarkSettingsPage =
    normalizedPathname === WATERMARK_SETTINGS_PATH || normalizedPathname.endsWith(WATERMARK_SETTINGS_PATH);
  const finalWatermarkText = serverWatermark?.text || watermarkText || globalConfig.watermarkText;
  const finalWatermarkVisible = (serverWatermark?.enabled ?? watermarkVisible) && !isWatermarkSettingsPage;
  const finalWatermarkAlpha = Math.min(0.5, Math.max(0.05, serverWatermark?.opacity ?? 0.15));
  const finalWatermarkConfig = {
    ...globalConfig.watermarkConfig,
    font: {
      ...globalConfig.watermarkConfig.font,
      color: `rgba(0, 0, 0, ${finalWatermarkAlpha})`,
      fontSize: serverWatermark?.fontSize ?? globalConfig.watermarkConfig.font?.fontSize
    },
    rotate: serverWatermark?.rotate ?? globalConfig.watermarkConfig.rotate,
    zIndex: globalConfig.watermarkConfig.zIndex
  } as const;

  return (
    <AConfigProvider
      button={{ classNames: { icon: 'align-1px  text-icon' } }}
      card={{ styles: { body: { flex: 1, overflow: 'hidden', padding: '12px 16px ' } } }}
      locale={antdLocales[locale]}
      theme={antdTheme}
    >
      <AWatermark
        className="h-full"
        content={finalWatermarkVisible ? finalWatermarkText : ''}
        {...finalWatermarkConfig}
      >
        {children}
      </AWatermark>
    </AConfigProvider>
  );
}

export default AntdConfig;
