/**
 * 命名空间 Api.SystemManage
 *
 * 后端 API 模块：系统管理模块
 */
declare namespace Api {
  namespace SystemManage {
    /** 通用搜索参数 */
    type CommonSearchParams = Pick<Common.PaginatingCommonParams, 'current' | 'size'>;

    /** 角色 */
    type Role = Common.CommonRecord<{
      /** 角色编码 */
      roleCode: string;
      /** 角色描述 */
      roleDesc: string;
      /** 角色名称 */
      roleName: string;
    }>;

    /** 角色搜索参数 */
    type RoleSearchParams = CommonType.RecordNullable<
      Pick<Api.SystemManage.Role, 'roleCode' | 'roleName' | 'status'> & CommonSearchParams
    >;

    /** 角色列表 */
    type RoleList = Common.PaginatingQueryRecord<Role>;

    /** 所有角色（简化版） */
    type AllRole = Pick<Role, 'id' | 'roleCode' | 'roleName'>;

    /**
     * 用户性别
     *
     * - "1": 男
     * - "2": 女
     */
    type UserGender = import('../enums').UserGenderValue;

    /** 用户 */
    type User = Common.CommonRecord<{
      /** 用户昵称 */
      nickName: string;
      /** 用户邮箱 */
      userEmail: string;
      /** 用户性别 */
      userGender: UserGender | null;
      /** 用户名 */
      userName: string;
      /** 用户手机号 */
      userPhone: string;
      /** 用户角色编码集合 */
      userRoles: string[];
    }>;

    /** 用户搜索参数 */
    type UserSearchParams = CommonType.RecordNullable<
      Pick<Api.SystemManage.User, 'nickName' | 'status' | 'userEmail' | 'userGender' | 'userName' | 'userPhone'> &
        CommonSearchParams
    >;

    /** 用户列表 */
    type UserList = Common.PaginatingQueryRecord<User>;

    /** auth_user 用户（系统设置） */
    type AuthUser = {
      /** 创建时间 */
      createTime: string;
      /** 记录 ID */
      id: number;
      /** 状态（1 可用 / 2 禁用） */
      status: Api.Common.EnableStatus;
      /** 更新时间 */
      updateTime: string;
      /** 邮箱 */
      userEmail: string;
      /** 用户名 */
      userName: string;
    };

    /** auth_user 列表查询参数 */
    type AuthUserSearchParams = CommonType.RecordNullable<
      Pick<Api.SystemManage.AuthUser, 'status' | 'userEmail' | 'userName'> & CommonSearchParams
    >;

    /** auth_user 列表 */
    type AuthUserList = Common.PaginatingQueryRecord<AuthUser>;

    /** auth_user 新增/编辑参数 */
    type AuthUserOperateParams = {
      confirmPassword?: string;
      email?: string;
      password?: string;
      status: Api.Common.EnableStatus;
      userName: string;
    };

    /**
     * 菜单类型
     *
     * - "1": 目录
     * - "2": 菜单
     */
    type MenuType = import('../enums').MenuTypeValue;

    /** 菜单按钮 */
    type MenuButton = {
      /**
       * 按钮编码
       *
       * 可用于控制按钮权限
       */
      code: string;
      /** 按钮描述 */
      desc: string;
    };

    /**
     * 图标类型
     *
     * - "1": iconify 图标
     * - "2": 本地图标
     */
    type IconType = import('../enums').IconTypeValue;

    /** 菜单的路由属性 */
    type MenuPropsOfRoute = Pick<
      Router.RouteHandle,
      | 'activeMenu'
      | 'constant'
      | 'fixedIndexInTab'
      | 'hideInMenu'
      | 'href'
      | 'i18nKey'
      | 'keepAlive'
      | 'multiTab'
      | 'order'
      | 'query'
    >;

    /** 菜单 */
    type Menu = Common.CommonRecord<{
      /** 按钮列表 */
      buttons?: MenuButton[] | null;
      /** 子菜单 */
      children?: Menu[] | null;
      /** 组件路径 */
      component?: string;
      /** 图标名称（iconify 图标名或本地图标名） */
      icon: string;
      /** 图标类型 */
      iconType: IconType;
      /** 菜单名称 */
      menuName: string;
      /** 菜单类型 */
      menuType: MenuType;
      /** 父级菜单 ID */
      parentId: number;
      /** 路由名称 */
      routeName: string;
      /** 路由路径 */
      routePath: string;
    }> &
      MenuPropsOfRoute;

    /** 菜单列表 */
    type MenuList = Common.PaginatingQueryRecord<Menu>;

    /** 菜单树 */
    type MenuTree = {
      /** 子菜单树 */
      children?: MenuTree[];
      /** 菜单 ID */
      id: number;
      /** 菜单标签 */
      label: string;
      /** 父级菜单 ID */
      pId: number;
    };

    /** 网站设置 */
    type WebsiteWatermarkSettings = {
      /** 是否启用水印 */
      enabled: boolean;
      /** 水印字号 */
      fontSize: number;
      /** 水印透明度 */
      opacity: number;
      /** 水印旋转角度 */
      rotate: number;
      /** 水印文字 */
      text: string;
    };

    /** 网站设置 */
    type WebsiteSettings = {
      /** 网站 favicon 图标 URL */
      favicon: string;
      /** 网站 Logo URL */
      logo: string;
      /** 水印设置 */
      watermark: WebsiteWatermarkSettings;
      /** 网站名称 */
      websiteName: string;
    };

    /** 网站基础设置 */
    type WebsiteBrandSettings = Pick<WebsiteSettings, 'favicon' | 'logo' | 'websiteName'>;

    type WebsiteAssetKind = 'favicon' | 'logo';

    type WebsiteAssetUploadResult = {
      url: string;
    };
  }
}
