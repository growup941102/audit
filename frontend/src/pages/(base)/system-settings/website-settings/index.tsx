import { Upload } from 'antd';
import type { UploadFile, UploadProps } from 'antd';
import type { Dispatch, SetStateAction } from 'react';

import { fetchUploadWebsiteAsset } from '@/service/api';
import { useUpdateWebsiteBrandSettings, useWebsiteBrandSettings } from '@/service/hooks';

type WebsiteBrandSettingsFormModel = Api.SystemManage.WebsiteBrandSettings;
type WebsiteAssetKind = Api.SystemManage.WebsiteAssetKind;
type UploadFileListSetter = Dispatch<SetStateAction<UploadFile[]>>;

const WEBSITE_IMAGE_MAX_SIZE_MB = 2;
const WEBSITE_IMAGE_MAX_SIZE_BYTES = WEBSITE_IMAGE_MAX_SIZE_MB * 1024 * 1024;
const WEBSITE_IMAGE_ALLOWED_TYPES = new Set([
  'image/avif',
  'image/bmp',
  'image/gif',
  'image/heic',
  'image/heif',
  'image/jpeg',
  'image/png',
  'image/svg+xml',
  'image/tiff',
  'image/vnd.microsoft.icon',
  'image/webp',
  'image/x-icon'
]);
const WEBSITE_IMAGE_ALLOWED_EXTENSIONS = new Set([
  'avif',
  'bmp',
  'gif',
  'heic',
  'heif',
  'ico',
  'jfif',
  'jpeg',
  'jpg',
  'png',
  'svg',
  'tif',
  'tiff',
  'webp'
]);
const DEFAULT_WEBSITE_BRAND_SETTINGS: WebsiteBrandSettingsFormModel = {
  favicon: '',
  logo: '',
  websiteName: '智能审计系统'
};

function getFileExtension(fileName: string) {
  const segments = fileName.toLowerCase().split('.');
  return segments.length > 1 ? segments.at(-1) || '' : '';
}

function normalizeWebsiteName(value: string) {
  return (value || '').trim();
}

function normalizeWebsiteBrandSettings(source?: Partial<WebsiteBrandSettingsFormModel>): WebsiteBrandSettingsFormModel {
  const websiteName = normalizeWebsiteName(source?.websiteName || DEFAULT_WEBSITE_BRAND_SETTINGS.websiteName);

  return {
    favicon: source?.favicon || '',
    logo: source?.logo || '',
    websiteName: websiteName || DEFAULT_WEBSITE_BRAND_SETTINGS.websiteName
  };
}

function buildRemoteFileList(url: string, kind: WebsiteAssetKind): UploadFile[] {
  if (!url) return [];

  return [
    {
      name: `${kind}.${getFileExtension(url) || 'png'}`,
      status: 'done',
      thumbUrl: url,
      uid: `remote-${kind}`,
      url
    }
  ];
}

function validateWebsiteImage(file: File) {
  const extension = getFileExtension(file.name);
  const isValidType = WEBSITE_IMAGE_ALLOWED_TYPES.has(file.type) || WEBSITE_IMAGE_ALLOWED_EXTENSIONS.has(extension);

  if (!isValidType) {
    window.$message?.error('仅支持图片格式：jpg/png/svg/ico/gif/webp/avif/bmp/tiff/heic/heif');
    return Upload.LIST_IGNORE;
  }

  if (file.size > WEBSITE_IMAGE_MAX_SIZE_BYTES) {
    window.$message?.error(`图片大小不能超过 ${WEBSITE_IMAGE_MAX_SIZE_MB}MB`);
    return Upload.LIST_IGNORE;
  }

  return true;
}

function validateWebsiteName(value: string) {
  const normalizedName = normalizeWebsiteName(value);
  if (!normalizedName) {
    return '网站名称不能为空';
  }
  if ([...normalizedName].some(char => char.charCodeAt(0) < 32)) {
    return '网站名称包含非法字符';
  }
  return '';
}

const WebsiteSettings = () => {
  const { t } = useTranslation();

  const [form] = AForm.useForm<WebsiteBrandSettingsFormModel>();
  const [logoFileList, setLogoFileList] = useState<UploadFile[]>([]);
  const [faviconFileList, setFaviconFileList] = useState<UploadFile[]>([]);
  const latestServerSettingsRef = useRef<WebsiteBrandSettingsFormModel>(DEFAULT_WEBSITE_BRAND_SETTINGS);
  const persistQueueRef = useRef<Promise<void>>(Promise.resolve());

  const { data: websiteSettings, isLoading } = useWebsiteBrandSettings();
  const { isPending, mutateAsync: updateWebsiteSettings } = useUpdateWebsiteBrandSettings();

  useEffect(() => {
    if (!websiteSettings) return;

    const normalizedSettings = normalizeWebsiteBrandSettings(websiteSettings);

    latestServerSettingsRef.current = normalizedSettings;
    form.setFieldsValue(normalizedSettings);
    setLogoFileList(buildRemoteFileList(normalizedSettings.logo, 'logo'));
    setFaviconFileList(buildRemoteFileList(normalizedSettings.favicon, 'favicon'));
  }, [form, websiteSettings]);

  function enqueuePersist(task: () => Promise<void>) {
    const nextTask = persistQueueRef.current.then(task, task);
    persistQueueRef.current = nextTask.then(
      () => undefined,
      () => undefined
    );
    return nextTask;
  }

  async function persistWebsiteSettings(nextValues?: Partial<WebsiteBrandSettingsFormModel>, successMessage?: string) {
    const currentValues = form.getFieldsValue();
    const latestServerSettings = latestServerSettingsRef.current;

    const mergedValues = normalizeWebsiteBrandSettings({
      ...latestServerSettings,
      ...currentValues,
      ...nextValues
    });

    if (JSON.stringify(mergedValues) === JSON.stringify(latestServerSettings)) {
      return;
    }

    await enqueuePersist(async () => {
      await updateWebsiteSettings(mergedValues);
      latestServerSettingsRef.current = mergedValues;
      form.setFieldsValue(mergedValues);
      if (successMessage) {
        window.$message?.success(successMessage);
      }
    });
  }

  function createUploadRequest(
    kind: WebsiteAssetKind,
    setFileList: UploadFileListSetter
  ): NonNullable<UploadProps['customRequest']> {
    return async options => {
      const file = options.file as File & { uid?: string };
      const previousUrl = String(form.getFieldValue(kind) || latestServerSettingsRef.current[kind] || '');
      const fileUid = file.uid || `${kind}-${Date.now()}`;

      setFileList([
        {
          name: file.name,
          status: 'uploading',
          uid: fileUid
        }
      ]);

      try {
        const response = await fetchUploadWebsiteAsset(kind, file);
        const uploadedUrl = response.url;

        form.setFieldValue(kind, uploadedUrl);
        setFileList([
          {
            name: file.name,
            status: 'done',
            thumbUrl: uploadedUrl,
            uid: fileUid,
            url: uploadedUrl
          }
        ]);

        await persistWebsiteSettings({ [kind]: uploadedUrl } as Partial<WebsiteBrandSettingsFormModel>, '上传成功');
        options.onSuccess?.(response);
      } catch (error) {
        form.setFieldValue(kind, previousUrl);
        setFileList(buildRemoteFileList(previousUrl, kind));
        options.onError?.(error as Error);
      }
    };
  }

  function getUploadProps(
    kind: WebsiteAssetKind,
    fileList: UploadFile[],
    setFileList: UploadFileListSetter
  ): UploadProps {
    return {
      accept: '.avif,.bmp,.gif,.heic,.heif,.ico,.jfif,.jpeg,.jpg,.png,.svg,.tif,.tiff,.webp,image/*',
      beforeUpload: file => validateWebsiteImage(file as File),
      customRequest: createUploadRequest(kind, setFileList),
      disabled: isPending,
      fileList,
      listType: 'picture-card',
      maxCount: 1,
      onRemove: async () => {
        const previousUrl = String(form.getFieldValue(kind) || latestServerSettingsRef.current[kind] || '');
        if (!previousUrl) return true;

        setFileList([]);
        form.setFieldValue(kind, '');

        try {
          await persistWebsiteSettings({ [kind]: '' } as Partial<WebsiteBrandSettingsFormModel>, '已移除');
          return true;
        } catch {
          form.setFieldValue(kind, previousUrl);
          setFileList(buildRemoteFileList(previousUrl, kind));
          return false;
        }
      },
      showUploadList: {
        showDownloadIcon: false,
        showPreviewIcon: false,
        showRemoveIcon: true
      }
    };
  }

  async function handleSubmit(values: WebsiteBrandSettingsFormModel) {
    const normalizedValues = normalizeWebsiteBrandSettings(values);
    await persistWebsiteSettings(normalizedValues, '保存成功');
  }

  return (
    <div className="h-full min-h-500px flex-col-stretch gap-16px overflow-hidden lt-sm:overflow-auto">
      <ACard
        className="flex-col-stretch sm:flex-1-hidden card-wrapper"
        title={t('page.websiteSettings.title')}
        variant="borderless"
      >
        <ASpin spinning={isLoading || isPending}>
          <AForm
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
          >
            <AForm.Item
              label={t('page.websiteSettings.websiteName')}
              name="websiteName"
              rules={[
                {
                  message: t('page.websiteSettings.form.websiteName'),
                  required: true
                },
                {
                  validator: (_, value) => {
                    const errorMessage = validateWebsiteName(value);
                    if (errorMessage) {
                      return Promise.reject(new Error(errorMessage));
                    }
                    return Promise.resolve();
                  }
                }
              ]}
            >
              <AInput
                disabled={isPending}
                maxLength={100}
                placeholder={t('page.websiteSettings.form.websiteName')}
              />
            </AForm.Item>

            <AForm.Item
              hidden
              name="logo"
            >
              <AInput />
            </AForm.Item>

            <AForm.Item
              hidden
              name="favicon"
            >
              <AInput />
            </AForm.Item>

            <AForm.Item label={t('page.websiteSettings.logo')}>
              <Upload {...getUploadProps('logo', logoFileList, setLogoFileList)}>
                {logoFileList.length >= 1 ? null : (
                  <div>
                    <div className="text-20px">+</div>
                    <div className="mt-8px">{t('page.websiteSettings.upload')}</div>
                  </div>
                )}
              </Upload>
            </AForm.Item>

            <AForm.Item label={t('page.websiteSettings.favicon')}>
              <Upload {...getUploadProps('favicon', faviconFileList, setFaviconFileList)}>
                {faviconFileList.length >= 1 ? null : (
                  <div>
                    <div className="text-20px">+</div>
                    <div className="mt-8px">{t('page.websiteSettings.upload')}</div>
                  </div>
                )}
              </Upload>
            </AForm.Item>

            <AForm.Item className="mb-0">
              <AButton
                htmlType="submit"
                loading={isPending}
                type="primary"
              >
                保存
              </AButton>
            </AForm.Item>
          </AForm>
        </ASpin>
      </ACard>
    </div>
  );
};

export default WebsiteSettings;
