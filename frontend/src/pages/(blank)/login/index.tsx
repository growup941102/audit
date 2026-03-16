import { useInitAuth } from '@/features/auth/auth';
import { useFormRules } from '@/features/form';
import { fetchCaptcha } from '@/service/api';

interface LoginParams {
  captchaCode: string;
  password: string;
  userName: string;
}

const INITIAL_VALUES = {
  captchaCode: '',
  password: 'cmcc@tj10086',
  userName: 'admin'
};

const RESET_PASSWORD_CONTACT = {
  name: 'xxxx',
  phone: 'xxxx'
};

function normalizeCaptchaInput(value: string) {
  return value.replace(/\D+/g, '').slice(0, 4);
}

const PwdLogin = () => {
  const { t } = useTranslation();

  const { loading, toLogin } = useInitAuth();

  const [form] = AForm.useForm<LoginParams>();

  const {
    formRules: { pwd, userName: userNameRules }
  } = useFormRules();

  const [captchaId, setCaptchaId] = useState('');
  const [captchaImage, setCaptchaImage] = useState('');
  const [captchaLoading, setCaptchaLoading] = useState(false);

  function openResetPasswordNotice() {
    AModal.info({
      centered: true,
      content: (
        <div className="text-14px leading-22px">
          请联系{RESET_PASSWORD_CONTACT.name}进行密码重置，电话：{RESET_PASSWORD_CONTACT.phone}
        </div>
      ),
      okText: '我知道了',
      title: '忘记密码'
    });
  }

  async function refreshCaptcha() {
    if (captchaLoading) return;

    setCaptchaLoading(true);
    try {
      const data = await fetchCaptcha();
      console.log(data);
      
      setCaptchaId(data.captchaId);
      setCaptchaImage(data.captchaImage);
      form.setFieldValue('captchaCode', '');
    } catch {
      setCaptchaId('');
      setCaptchaImage('');
      window.$message?.error('获取验证码失败，请稍后重试');
    } finally {
      setCaptchaLoading(false);
    }
  }

  async function handleSubmit(values: LoginParams) {
    if (!captchaId) {
      window.$message?.error('验证码未就绪，请刷新后重试');
      return;
    }

    if (!/^\d{4}$/.test(values.captchaCode)) {
      window.$message?.error('请输入4位数字验证码');
      return;
    }

    const success = await toLogin({
      ...values,
      captchaId,
      userName: values.userName.trim()
    });
    if (!success) {
      await refreshCaptcha();
    }
  }

  useKeyPress('enter', () => {
    form.submit();
  });

  useMount(() => {
    refreshCaptcha();
  });

  return (
    <>
      <h3 className="text-18px text-primary font-medium">{t('page.login.pwdLogin.title')}</h3>
      <AForm
        className="pt-24px"
        form={form}
        initialValues={INITIAL_VALUES}
        onFinish={handleSubmit}
      >
        <AForm.Item
          name="userName"
          rules={userNameRules}
        >
          <AInput className="!h-40px" />
        </AForm.Item>

        <AForm.Item
          name="password"
          rules={pwd}
        >
          <AInput.Password
            autoComplete="password"
            className="!h-40px"
          />
        </AForm.Item>
        <AForm.Item
          name="captchaCode"
          rules={[{ message: '请输入4位数字验证码', required: true }]}
        >
          <div className="w-full flex-y-center gap-12px">
            <AInput
              className="flex-1 !h-40px"
              inputMode="numeric"
              maxLength={4}
              placeholder="请输入图形验证码"
              onChange={e => form.setFieldValue('captchaCode', normalizeCaptchaInput(e.target.value))}
            />
            <AButton
              className="w-120px p-0 !h-40px"
              htmlType="button"
              loading={captchaLoading}
              title="点击刷新验证码"
              onClick={refreshCaptcha}
            >
              {captchaImage ? (
                <img
                  alt="captcha"
                  className="h-full w-full rd-6px object-cover"
                  src={captchaImage}
                />
              ) : (
                <span className="text-text-secondary text-12px">点击获取</span>
              )}
            </AButton>
          </div>
        </AForm.Item>
        <ASpace
          className="w-full"
          direction="vertical"
          size={24}
        >
          <div className="flex-y-center justify-between">
            <ACheckbox>{t('page.login.pwdLogin.rememberMe')}</ACheckbox>

            <AButton
              type="text"
              onClick={openResetPasswordNotice}
            >
              {t('page.login.pwdLogin.forgetPassword')}
            </AButton>
          </div>
          <AButton
            block
            color="primary"
            disabled={!captchaId || captchaLoading}
            htmlType="submit"
            loading={loading}
            shape="round"
            size="large"
            type="primary"
          >
            登陆
          </AButton>
        </ASpace>
      </AForm>
    </>
  );
};

export default PwdLogin;
