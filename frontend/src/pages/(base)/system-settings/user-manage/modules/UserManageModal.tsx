interface UserManageFormModel {
  confirmPassword: string;
  email: string;
  password: string;
  status: Api.Common.EnableStatus;
  userName: string;
}

interface Props {
  form: import('antd').FormInstance<UserManageFormModel>;
  loading: boolean;
  onCancel: () => void;
  onSubmit: () => void;
  open: boolean;
  operateType: AntDesign.TableOperateType;
}

const PASSWORD_PATTERN = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@]{6,18}$/;

const UserManageModal: FC<Props> = memo(({ form, loading, onCancel, onSubmit, open, operateType }) => {
  const { t } = useTranslation();

  return (
    <AModal
      destroyOnClose
      maskClosable={false}
      open={open}
      title={operateType === 'add' ? t('page.systemSettings.userManage.addUser') : t('page.systemSettings.userManage.editUser')}
      onCancel={onCancel}
      onOk={onSubmit}
      confirmLoading={loading}
    >
      <AForm<UserManageFormModel>
        form={form}
        layout="vertical"
      >
        <AForm.Item
          label={t('page.systemSettings.userManage.userName')}
          name="userName"
          rules={[{ required: true, message: t('page.systemSettings.userManage.form.userName') }]}
        >
          <AInput placeholder={t('page.systemSettings.userManage.form.userName')} />
        </AForm.Item>

        <AForm.Item
          label={t('page.systemSettings.userManage.userPassword')}
          name="password"
          extra={operateType === 'edit' ? t('page.systemSettings.userManage.form.passwordEdit') : undefined}
          rules={[
            {
              validator: async (_, value) => {
                const passwordValue = String(value || '');

                if (operateType === 'add' && !passwordValue) {
                  return Promise.reject(new Error(t('page.systemSettings.userManage.form.password')));
                }

                if (passwordValue && !PASSWORD_PATTERN.test(passwordValue)) {
                  return Promise.reject(new Error(t('page.systemSettings.userManage.form.passwordRule')));
                }

                return Promise.resolve();
              }
            }
          ]}
        >
          <AInput.Password
            allowClear
            placeholder={
              operateType === 'edit'
                ? t('page.systemSettings.userManage.form.passwordEdit')
                : t('page.systemSettings.userManage.form.password')
            }
            visibilityToggle={operateType !== 'edit'}
          />
        </AForm.Item>

        <AForm.Item
          dependencies={['password']}
          label={t('page.systemSettings.userManage.userConfirmPassword')}
          name="confirmPassword"
          rules={[
            {
              validator: async (_, value) => {
                const password = form.getFieldValue('password');

                if (operateType === 'add') {
                  if (!value) {
                    return Promise.reject(new Error(t('page.systemSettings.userManage.form.confirmPassword')));
                  }
                }

                if (!password && !value) {
                  return Promise.resolve();
                }

                if (!password && value) {
                  return Promise.reject(new Error(t('page.systemSettings.userManage.form.passwordFirst')));
                }

                if (password && !value) {
                  return Promise.reject(new Error(t('page.systemSettings.userManage.form.confirmPassword')));
                }

                if (password !== value) {
                  return Promise.reject(new Error(t('page.systemSettings.userManage.form.passwordNotMatch')));
                }

                return Promise.resolve();
              }
            }
          ]}
        >
          <AInput.Password
            allowClear
            placeholder={t('page.systemSettings.userManage.form.confirmPassword')}
            visibilityToggle={operateType !== 'edit'}
          />
        </AForm.Item>

        <AForm.Item
          label={t('page.systemSettings.userManage.userEmail')}
          name="email"
          rules={[{ type: 'email', message: t('page.systemSettings.userManage.form.invalidEmail') }]}
        >
          <AInput placeholder={t('page.systemSettings.userManage.form.userEmail')} />
        </AForm.Item>

        <AForm.Item
          label={t('page.systemSettings.userManage.userStatus')}
          name="status"
          rules={[{ required: true, message: t('page.systemSettings.userManage.form.userStatus') }]}
        >
          <ARadio.Group>
            <ARadio value="1">{t('page.manage.common.status.enable')}</ARadio>
            <ARadio value="2">{t('page.manage.common.status.disable')}</ARadio>
          </ARadio.Group>
        </AForm.Item>
      </AForm>
    </AModal>
  );
});

export type { UserManageFormModel };
export default UserManageModal;
