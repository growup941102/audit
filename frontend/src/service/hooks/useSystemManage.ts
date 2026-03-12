import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import {
  fetchGetAllPages,
  fetchGetAllRoles,
  fetchGetMenuList,
  fetchGetMenuTree,
  fetchGetRoleList,
  fetchGetUserList,
  fetchGetWatermarkSettings,
  fetchGetWebsiteBrandSettings,
  fetchGetWebsiteSettings,
  fetchUpdateWatermarkSettings,
  fetchUpdateWebsiteBrandSettings,
  fetchUpdateWebsiteSettings
} from '../api';
import { QUERY_KEYS } from '../keys';

/**
 * Get role list hook
 *
 * @example
 *   const { data: roleList, isLoading } = useRoleList({ current: 1, size: 10 });
 *
 * @param params - Search parameters
 */
export function useRoleList(params?: Api.SystemManage.RoleSearchParams) {
  return useQuery({
    queryFn: () => fetchGetRoleList(params),
    queryKey: QUERY_KEYS.SYSTEM_MANAGE.ROLE_LIST(params)
  });
}

/**
 * Get all roles hook
 *
 * @example
 *   const { data: allRoles, isLoading } = useAllRoles();
 */
export function useAllRoles() {
  return useQuery({
    queryFn: fetchGetAllRoles,
    queryKey: QUERY_KEYS.SYSTEM_MANAGE.ALL_ROLES,
    staleTime: 0
  });
}

/**
 * Get user list hook
 *
 * @example
 *   const { data: userList, isLoading } = useUserList({ current: 1, size: 10 });
 *
 * @param params - Search parameters
 */
export function useUserList(params?: Api.SystemManage.UserSearchParams) {
  return useQuery({
    queryFn: () => fetchGetUserList(params),
    queryKey: QUERY_KEYS.SYSTEM_MANAGE.USER_LIST(params)
  });
}

/**
 * Get menu list hook
 *
 * @example
 *   const { data: menuList, isLoading } = useMenuList();
 */
export function useMenuList() {
  return useQuery({
    queryFn: fetchGetMenuList,
    queryKey: QUERY_KEYS.SYSTEM_MANAGE.MENU_LIST
  });
}

/**
 * Get all pages hook
 *
 * @example
 *   const { data: allPages, isLoading } = useAllPages();
 */
export function useAllPages() {
  return useQuery({
    queryFn: fetchGetAllPages,
    queryKey: QUERY_KEYS.SYSTEM_MANAGE.ALL_PAGES,
    staleTime: 0
  });
}

/**
 * Get menu tree hook
 *
 * @example
 *   const { data: menuTree, isLoading } = useMenuTree();
 */
export function useMenuTree() {
  return useQuery({
    queryFn: fetchGetMenuTree,
    queryKey: QUERY_KEYS.SYSTEM_MANAGE.MENU_TREE
  });
}

/**
 * Get website settings hook
 *
 * @example
 *   const { data: websiteSettings, isLoading } = useWebsiteSettings();
 */
export function useWebsiteSettings() {
  return useQuery({
    queryFn: fetchGetWebsiteSettings,
    queryKey: QUERY_KEYS.SYSTEM_MANAGE.WEBSITE_SETTINGS,
    refetchOnWindowFocus: false
  });
}

/** Get website brand settings hook */
export function useWebsiteBrandSettings() {
  return useQuery({
    queryFn: fetchGetWebsiteBrandSettings,
    queryKey: QUERY_KEYS.SYSTEM_MANAGE.WEBSITE_BRAND_SETTINGS,
    refetchOnWindowFocus: false
  });
}

/** Get watermark settings hook */
export function useWatermarkSettings() {
  return useQuery({
    queryFn: fetchGetWatermarkSettings,
    queryKey: QUERY_KEYS.SYSTEM_MANAGE.WATERMARK_SETTINGS,
    refetchOnWindowFocus: false
  });
}

/**
 * Update website settings mutation hook
 *
 * @example
 *   const { mutate: updateSettings } = useUpdateWebsiteSettings();
 */
export function useUpdateWebsiteSettings() {
  const queryClient = useQueryClient();
  return useMutation<
    boolean,
    Error,
    Api.SystemManage.WebsiteSettings,
    { previousSettings?: Api.SystemManage.WebsiteSettings }
  >({
    mutationFn: fetchUpdateWebsiteSettings,
    onError: (_error, _variables, context) => {
      if (context?.previousSettings) {
        queryClient.setQueryData<Api.SystemManage.WebsiteSettings>(
          QUERY_KEYS.SYSTEM_MANAGE.WEBSITE_SETTINGS,
          context.previousSettings
        );
      }
    },
    onMutate: async nextSettings => {
      await queryClient.cancelQueries({ queryKey: QUERY_KEYS.SYSTEM_MANAGE.WEBSITE_SETTINGS });

      const previousSettings = queryClient.getQueryData<Api.SystemManage.WebsiteSettings>(
        QUERY_KEYS.SYSTEM_MANAGE.WEBSITE_SETTINGS
      );

      queryClient.setQueryData<Api.SystemManage.WebsiteSettings>(
        QUERY_KEYS.SYSTEM_MANAGE.WEBSITE_SETTINGS,
        nextSettings
      );

      return { previousSettings };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.SYSTEM_MANAGE.WEBSITE_SETTINGS });
    }
  });
}

/** Update website brand settings mutation hook */
export function useUpdateWebsiteBrandSettings() {
  const queryClient = useQueryClient();
  return useMutation<
    boolean,
    Error,
    Api.SystemManage.WebsiteBrandSettings,
    { previousSettings?: Api.SystemManage.WebsiteBrandSettings }
  >({
    mutationFn: fetchUpdateWebsiteBrandSettings,
    onError: (_error, _variables, context) => {
      if (context?.previousSettings) {
        queryClient.setQueryData<Api.SystemManage.WebsiteBrandSettings>(
          QUERY_KEYS.SYSTEM_MANAGE.WEBSITE_BRAND_SETTINGS,
          context.previousSettings
        );
      }
    },
    onMutate: async nextSettings => {
      await queryClient.cancelQueries({ queryKey: QUERY_KEYS.SYSTEM_MANAGE.WEBSITE_BRAND_SETTINGS });

      const previousSettings = queryClient.getQueryData<Api.SystemManage.WebsiteBrandSettings>(
        QUERY_KEYS.SYSTEM_MANAGE.WEBSITE_BRAND_SETTINGS
      );

      queryClient.setQueryData<Api.SystemManage.WebsiteBrandSettings>(
        QUERY_KEYS.SYSTEM_MANAGE.WEBSITE_BRAND_SETTINGS,
        nextSettings
      );

      const websiteSettings = queryClient.getQueryData<Api.SystemManage.WebsiteSettings>(
        QUERY_KEYS.SYSTEM_MANAGE.WEBSITE_SETTINGS
      );
      if (websiteSettings) {
        queryClient.setQueryData<Api.SystemManage.WebsiteSettings>(QUERY_KEYS.SYSTEM_MANAGE.WEBSITE_SETTINGS, {
          ...websiteSettings,
          ...nextSettings
        });
      }

      return { previousSettings };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.SYSTEM_MANAGE.WEBSITE_BRAND_SETTINGS });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.SYSTEM_MANAGE.WEBSITE_SETTINGS });
    }
  });
}

/** Update watermark settings mutation hook */
export function useUpdateWatermarkSettings() {
  const queryClient = useQueryClient();
  return useMutation<
    boolean,
    Error,
    Api.SystemManage.WebsiteWatermarkSettings,
    { previousSettings?: Api.SystemManage.WebsiteWatermarkSettings }
  >({
    mutationFn: fetchUpdateWatermarkSettings,
    onError: (_error, _variables, context) => {
      if (context?.previousSettings) {
        queryClient.setQueryData<Api.SystemManage.WebsiteWatermarkSettings>(
          QUERY_KEYS.SYSTEM_MANAGE.WATERMARK_SETTINGS,
          context.previousSettings
        );
      }
    },
    onMutate: async nextSettings => {
      await queryClient.cancelQueries({ queryKey: QUERY_KEYS.SYSTEM_MANAGE.WATERMARK_SETTINGS });

      const previousSettings = queryClient.getQueryData<Api.SystemManage.WebsiteWatermarkSettings>(
        QUERY_KEYS.SYSTEM_MANAGE.WATERMARK_SETTINGS
      );

      queryClient.setQueryData<Api.SystemManage.WebsiteWatermarkSettings>(
        QUERY_KEYS.SYSTEM_MANAGE.WATERMARK_SETTINGS,
        nextSettings
      );

      const websiteSettings = queryClient.getQueryData<Api.SystemManage.WebsiteSettings>(
        QUERY_KEYS.SYSTEM_MANAGE.WEBSITE_SETTINGS
      );
      if (websiteSettings) {
        queryClient.setQueryData<Api.SystemManage.WebsiteSettings>(QUERY_KEYS.SYSTEM_MANAGE.WEBSITE_SETTINGS, {
          ...websiteSettings,
          watermark: nextSettings
        });
      }

      return { previousSettings };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.SYSTEM_MANAGE.WATERMARK_SETTINGS });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.SYSTEM_MANAGE.WEBSITE_SETTINGS });
    }
  });
}
