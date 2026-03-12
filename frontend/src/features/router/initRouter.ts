import type { RouteObject } from 'react-router-dom';

import { resetAuth } from '@/features/auth/authStore';
import { clearAuthStorage } from '@/features/auth/shared';
import { authRoutes } from '@/router';
import { fetchGetBackendRoutes, fetchGetUserInfo } from '@/service/api';
import { QUERY_KEYS } from '@/service/keys';
import { queryClient } from '@/service/queryClient';
import { store } from '@/store';

import { setCacheRoutes, setHomePath } from './routeStore';
import { filterAuthRoutesByRoles, mergeValuesByParent, transformBackendRoutesToReactRoutes } from './shared';

function redirectToLogin() {
  const { hash, pathname, search } = window.location;
  const redirectPath = encodeURIComponent(`${pathname}${search}${hash}`);
  window.location.replace(`/login?redirect=${redirectPath}`);
}

function handleInitAuthFail(error: unknown) {
  console.error('Failed to initialize auth routes:', error);

  clearAuthStorage();
  store.dispatch(resetAuth());
  queryClient.removeQueries({ queryKey: QUERY_KEYS.AUTH.USER_INFO });
  queryClient.removeQueries({ queryKey: QUERY_KEYS.ROUTE.USER_ROUTES });

  window.$message?.warning('登录状态已失效，请重新登录');
  redirectToLogin();
}

export async function initAuthRoutes(addRoutes: (parent: string | null, route: RouteObject[]) => void) {
  const authRouteMode = import.meta.env.VITE_AUTH_ROUTE_MODE;

  const reactAuthRoutes = mergeValuesByParent(authRoutes);

  let userInfo: Api.Auth.UserInfo;
  try {
    userInfo = await queryClient.ensureQueryData<Api.Auth.UserInfo>({
      queryFn: fetchGetUserInfo,
      queryKey: QUERY_KEYS.AUTH.USER_INFO
    });
  } catch (error) {
    handleInitAuthFail(error);
    return;
  }

  const isSuper = userInfo?.roles.includes(import.meta.env.VITE_STATIC_SUPER_ROLE);

  // 静态模式
  if (authRouteMode === 'static') {
    // 超级管理员
    if (isSuper) {
      reactAuthRoutes.forEach(route => {
        addRoutes(route.parent, route.route);
      });
    } else {
      // 非超级管理员
      const filteredRoutes = filterAuthRoutesByRoles(reactAuthRoutes, userInfo?.roles || []);

      filteredRoutes.forEach(({ parent, route }) => {
        addRoutes(parent, route);
      });
    }
  } else {
    // 动态模式
    try {
      const data = await queryClient.ensureQueryData<Api.Route.BackendRouteResponse>({
        gcTime: Infinity,
        queryFn: fetchGetBackendRoutes,
        queryKey: QUERY_KEYS.ROUTE.USER_ROUTES,
        staleTime: Infinity
      });

      store.dispatch(setHomePath(data.home));

      const routeParentMap = new Map<string, string | null>();

      function collectParentInfo(routes: Api.Route.BackendRoute[], parent: string | null = null) {
        routes.forEach(route => {
          const routeParent = route.layout !== undefined ? route.layout : parent;
          routeParentMap.set(route.name, routeParent ?? null);
        });
      }

      collectParentInfo(data.routes, '(base)');

      // 将后端路由结构转换为 React Router 路由结构
      const { cacheRoutes, routes: reactRoutes } = transformBackendRoutesToReactRoutes(data.routes);

      // 设置缓存路由
      if (cacheRoutes.length > 0) {
        store.dispatch(setCacheRoutes(cacheRoutes));
      }

      reactRoutes.forEach(routeArray => {
        const parent = routeParentMap.get(routeArray.id as string);
        if (parent) {
          addRoutes(parent, [routeArray]);
        } else {
          addRoutes(null, [routeArray]);
        }
      });
    } catch (error) {
      handleInitAuthFail(error);
    }
  }
}
