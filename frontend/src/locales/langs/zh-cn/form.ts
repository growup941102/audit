const form: App.I18n.Schema['translation']['form'] = {
  code: {
    invalid: '验证码格式不正确',
    required: '请输入验证码'
  },
  confirmPwd: {
    invalid: '两次输入密码不一致',
    required: '请输入确认密码'
  },
  email: {
    invalid: '邮箱格式不正确',
    required: '请输入邮箱'
  },
  phone: {
    invalid: '手机号格式不正确',
    required: '请输入手机号'
  },
  pwd: {
    invalid: '密码格式不正确，6-18位字符，需包含字母和数字（可含@）',
    required: '请输入密码'
  },
  required: '不能为空',
  userName: {
    invalid: '用户名格式不正确',
    required: '请输入用户名'
  }
};

export default form;
