/** System manage module URLs */

export const SYSTEM_MANAGE_URLS = {
  CREATE_SYSTEM_USER: '/api/system-manage/users/create/',
  DELETE_SYSTEM_USER: (userId: number) => `/api/system-manage/users/${userId}/delete/`,
  GET_ALL_PAGES: '/systemManage/getAllPages',
  GET_ALL_ROLES: '/systemManage/getAllRoles',
  GET_MENU_LIST: '/systemManage/getMenuList/v2',
  GET_MENU_TREE: '/systemManage/getMenuTree',
  GET_ROLE_LIST: '/systemManage/getRoleList',
  GET_SYSTEM_USER_LIST: '/api/system-manage/users/',
  GET_USER_LIST: '/systemManage/getUserList',
  GET_WATERMARK_SETTINGS: '/api/systemManage/getWatermarkSettings',
  GET_WEBSITE_BRAND_SETTINGS: '/api/systemManage/getWebsiteBrandSettings',
  GET_WEBSITE_SETTINGS: '/api/systemManage/getWebsiteSettings',
  UPDATE_SYSTEM_USER: (userId: number) => `/api/system-manage/users/${userId}/update/`,
  UPDATE_WATERMARK_SETTINGS: '/api/systemManage/updateWatermarkSettings',
  UPDATE_WEBSITE_BRAND_SETTINGS: '/api/systemManage/updateWebsiteBrandSettings',
  UPDATE_WEBSITE_SETTINGS: '/api/systemManage/updateWebsiteSettings',
  UPLOAD_WEBSITE_ASSET: '/api/systemManage/uploadWebsiteAsset'
} as const;
