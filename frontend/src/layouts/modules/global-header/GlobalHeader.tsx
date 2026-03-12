import DarkModeContainer from '@/components/DarkModeContainer';
import { GLOBAL_HEADER_MENU_ID } from '@/constants/app';
import { LangSwitch } from '@/features/lang';
import { MenuToggler } from '@/features/menu';

import GlobalLogo from '../GlobalLogo';

import GlobalBreadcrumb from './components/Breadcrumb';
import UserAvatar from './components/UserAvatar';

interface Props {
  isMobile: boolean;
  mode: UnionKey.ThemeLayoutMode;
  reverse?: boolean;
  siderWidth: number;
}

const HEADER_PROPS_CONFIG: Record<UnionKey.ThemeLayoutMode, App.Global.HeaderProps> = {
  horizontal: {
    showLogo: true,
    showMenu: true,
    showMenuToggler: false
  },
  'horizontal-mix': {
    showLogo: true,
    showMenu: true,
    showMenuToggler: false
  },
  vertical: {
    showLogo: false,
    showMenu: false,
    showMenuToggler: true
  },
  'vertical-mix': {
    showLogo: false,
    showMenu: false,
    showMenuToggler: false
  }
};

const GlobalHeader: FC<Props> = memo(({ isMobile, mode, reverse, siderWidth }) => {
  const { showLogo, showMenu, showMenuToggler } = HEADER_PROPS_CONFIG[mode];

  const showToggler = reverse ? true : showMenuToggler;

  return (
    <DarkModeContainer className="h-full flex-y-center px-12px shadow-header">
      {showLogo && (
        <GlobalLogo
          className="h-full"
          style={{ width: `${siderWidth}px` }}
        />
      )}
      <div>{reverse ? true : showMenuToggler}</div>

      {showToggler && <MenuToggler />}

      <div
        className="h-full flex-y-center flex-1-hidden"
        id={GLOBAL_HEADER_MENU_ID}
      >
        {!isMobile && !showMenu && <GlobalBreadcrumb className="ml-12px" />}
      </div>

      <div className="h-full flex-y-center justify-end">
        <LangSwitch className="px-12px" />

        <UserAvatar />
      </div>
    </DarkModeContainer>
  );
});

export default GlobalHeader;
