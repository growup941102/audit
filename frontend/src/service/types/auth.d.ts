/**
 * 命名空间 Api.Auth
 *
 * 后端 API 模块：认证模块
 */
declare namespace Api {
  namespace Auth {
    /** 登录请求参数 */
    type LoginParams = {
      /** 验证码 */
      captchaCode?: string;
      /** 验证码标识 */
      captchaId?: string;
      /** 密码 */
      password: string;
      /** 用户名 */
      userName: string;
    };

    interface CaptchaInfo {
      captchaId: string;
      captchaImage: string;
    }

    /** 登录响应数据 */
    type LoginResponse = LoginToken;

    /** 登录令牌 */
    interface LoginToken {
      /** 刷新令牌 */
      refreshToken: string;
      /** 访问令牌 */
      token: string;
    }

    /** 用户信息 */
    interface UserInfo {
      /** 用户按钮权限列表 */
      buttons: string[];
      /** 用户角色列表 */
      roles: string[];
      /** 用户 ID */
      userId: string;
      /** 用户名 */
      userName: string;
    }

    /** 用户认证信息 */
    type Info = {
      /** 访问令牌 */
      token: LoginToken['token'];
      /** 用户信息 */
      userInfo: UserInfo;
    };
  }
}
