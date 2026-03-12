import { request } from '../request';
import { AUTH_URLS } from '../urls';

/**
 * Login
 *
 * @param params Login parameters
 */
export function fetchLogin(params: Api.Auth.LoginParams) {
  return request<Api.Auth.LoginResponse>({
    data: params,
    method: 'post',
    url: AUTH_URLS.LOGIN
  });
}

/** Get image captcha */
export function fetchCaptcha() {
  return request<Api.Auth.CaptchaInfo>({
    url: AUTH_URLS.CAPTCHA
  });
}

/**
 * Register
 *
 * @param params Register parameters
 */
export function fetchRegister(params: { email?: string; password: string; username: string }) {
  return request({
    data: params,
    method: 'post',
    url: AUTH_URLS.REGISTER
  });
}

/** Logout */
export function fetchLogout() {
  return request({
    method: 'post',
    url: AUTH_URLS.LOGOUT
  });
}

/** Get user info */
export function fetchGetUserInfo() {
  return request<Api.Auth.UserInfo>({ url: AUTH_URLS.GET_USER_INFO });
}

/**
 * Refresh token
 *
 * @param refreshToken Refresh token
 */
export function fetchRefreshToken(refreshToken: string) {
  return request<Api.Auth.LoginToken>({
    data: {
      refreshToken
    },
    method: 'post',
    url: AUTH_URLS.REFRESH_TOKEN
  });
}

/**
 * return custom backend error
 *
 * @param code error code
 * @param msg error message
 */
export function fetchCustomBackendError(code: string, msg: string) {
  return request({ params: { code, msg }, url: AUTH_URLS.ERROR });
}
