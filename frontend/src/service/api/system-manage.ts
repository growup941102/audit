import { request } from '../request';
import { SYSTEM_MANAGE_URLS } from '../urls';

/** get role list */
export function fetchGetRoleList(params?: Api.SystemManage.RoleSearchParams) {
  return request<Api.SystemManage.RoleList>({
    method: 'get',
    params,
    url: SYSTEM_MANAGE_URLS.GET_ROLE_LIST
  });
}

/**
 * get all roles
 *
 * these roles are all enabled
 */
export function fetchGetAllRoles() {
  return request<Api.SystemManage.AllRole[]>({
    method: 'get',
    url: SYSTEM_MANAGE_URLS.GET_ALL_ROLES
  });
}

/** get user list */
export function fetchGetUserList(params?: Api.SystemManage.UserSearchParams) {
  return request<Api.SystemManage.UserList>({
    method: 'get',
    params,
    url: SYSTEM_MANAGE_URLS.GET_USER_LIST
  });
}

/** get auth user list */
export function fetchGetSystemUserList(params?: Api.SystemManage.AuthUserSearchParams) {
  return request<Api.SystemManage.AuthUserList>({
    method: 'get',
    params,
    url: SYSTEM_MANAGE_URLS.GET_SYSTEM_USER_LIST
  });
}

/** create auth user */
export function fetchCreateSystemUser(data: Api.SystemManage.AuthUserOperateParams) {
  return request<Api.SystemManage.AuthUser>({
    data,
    method: 'post',
    url: SYSTEM_MANAGE_URLS.CREATE_SYSTEM_USER
  });
}

/** update auth user */
export function fetchUpdateSystemUser(userId: number, data: Api.SystemManage.AuthUserOperateParams) {
  return request<Api.SystemManage.AuthUser>({
    data,
    method: 'put',
    url: SYSTEM_MANAGE_URLS.UPDATE_SYSTEM_USER(userId)
  });
}

/** delete auth user */
export function fetchDeleteSystemUser(userId: number) {
  return request<boolean>({
    method: 'delete',
    url: SYSTEM_MANAGE_URLS.DELETE_SYSTEM_USER(userId)
  });
}

/** get menu list */
export function fetchGetMenuList() {
  return request<Api.SystemManage.MenuList>({
    method: 'get',
    url: SYSTEM_MANAGE_URLS.GET_MENU_LIST
  });
}

/** get all pages */
export function fetchGetAllPages() {
  return request<string[]>({
    method: 'get',
    url: SYSTEM_MANAGE_URLS.GET_ALL_PAGES
  });
}

/** get menu tree */
export function fetchGetMenuTree() {
  return request<Api.SystemManage.MenuTree[]>({
    method: 'get',
    url: SYSTEM_MANAGE_URLS.GET_MENU_TREE
  });
}

/** get website settings */
export function fetchGetWebsiteSettings() {
  return request<Api.SystemManage.WebsiteSettings>({
    method: 'get',
    url: SYSTEM_MANAGE_URLS.GET_WEBSITE_SETTINGS
  });
}

/** get website brand settings */
export function fetchGetWebsiteBrandSettings() {
  return request<Api.SystemManage.WebsiteBrandSettings>({
    method: 'get',
    url: SYSTEM_MANAGE_URLS.GET_WEBSITE_BRAND_SETTINGS
  });
}

/** get watermark settings */
export function fetchGetWatermarkSettings() {
  return request<Api.SystemManage.WebsiteWatermarkSettings>({
    method: 'get',
    url: SYSTEM_MANAGE_URLS.GET_WATERMARK_SETTINGS
  });
}

/** update website settings */
export function fetchUpdateWebsiteSettings(data: Api.SystemManage.WebsiteSettings) {
  return request<boolean>({
    data,
    method: 'post',
    url: SYSTEM_MANAGE_URLS.UPDATE_WEBSITE_SETTINGS
  });
}

/** update website brand settings */
export function fetchUpdateWebsiteBrandSettings(data: Api.SystemManage.WebsiteBrandSettings) {
  return request<boolean>({
    data,
    method: 'post',
    url: SYSTEM_MANAGE_URLS.UPDATE_WEBSITE_BRAND_SETTINGS
  });
}

/** update watermark settings */
export function fetchUpdateWatermarkSettings(data: Api.SystemManage.WebsiteWatermarkSettings) {
  return request<boolean>({
    data: { watermark: data },
    method: 'post',
    url: SYSTEM_MANAGE_URLS.UPDATE_WATERMARK_SETTINGS
  });
}

/** upload website asset file */
export function fetchUploadWebsiteAsset(kind: Api.SystemManage.WebsiteAssetKind, file: File) {
  const formData = new FormData();
  formData.append('kind', kind);
  formData.append('file', file);

  return request<Api.SystemManage.WebsiteAssetUploadResult>({
    data: formData,
    method: 'post',
    url: SYSTEM_MANAGE_URLS.UPLOAD_WEBSITE_ASSET
  });
}
