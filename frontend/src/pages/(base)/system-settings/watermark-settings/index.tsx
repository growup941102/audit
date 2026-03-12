import { setWatermark } from '@/features/theme/themeSettingsStore';
import { useAppDispatch } from '@/hooks/business/useStore';
import { useUpdateWatermarkSettings, useWatermarkSettings } from '@/service/hooks';

type WatermarkSettingsFormModel = Api.SystemManage.WebsiteWatermarkSettings;
type WatermarkFormFieldModel = Partial<WatermarkSettingsFormModel>;

const DEFAULT_WATERMARK_SETTINGS: WatermarkSettingsFormModel = {
  enabled: false,
  fontSize: 16,
  opacity: 0.15,
  rotate: -15,
  text: 'zznode'
};
const WATERMARK_FONT_SIZE_MIN = 10;
const WATERMARK_FONT_SIZE_MAX = 36;
const WATERMARK_OPACITY_MIN = 0.05;
const WATERMARK_OPACITY_MAX = 0.5;
const WATERMARK_ROTATE_MIN = -90;
const WATERMARK_ROTATE_MAX = 90;
const WATERMARK_TEXT_MAX_LENGTH = 100;

function clampNumber(value: number, min: number, max: number) {
  if (!Number.isFinite(value)) return min;
  return Math.min(max, Math.max(min, value));
}

function normalizeWatermarkText(value: string) {
  return (value || '').trim();
}

function normalizeWatermarkSettings(source?: Partial<WatermarkSettingsFormModel>): WatermarkSettingsFormModel {
  return {
    enabled: Boolean(source?.enabled),
    fontSize: clampNumber(
      Number(source?.fontSize || DEFAULT_WATERMARK_SETTINGS.fontSize),
      WATERMARK_FONT_SIZE_MIN,
      WATERMARK_FONT_SIZE_MAX
    ),
    opacity: clampNumber(
      Number(source?.opacity || DEFAULT_WATERMARK_SETTINGS.opacity),
      WATERMARK_OPACITY_MIN,
      WATERMARK_OPACITY_MAX
    ),
    rotate: clampNumber(
      Number(source?.rotate || DEFAULT_WATERMARK_SETTINGS.rotate),
      WATERMARK_ROTATE_MIN,
      WATERMARK_ROTATE_MAX
    ),
    text: normalizeWatermarkText(source?.text || DEFAULT_WATERMARK_SETTINGS.text) || DEFAULT_WATERMARK_SETTINGS.text
  };
}

function hasIllegalChars(value: string) {
  return [...value].some(char => char.charCodeAt(0) < 32);
}

const WatermarkSettings = () => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();

  const [form] = AForm.useForm<WatermarkSettingsFormModel>();
  const watchedValues = AForm.useWatch([], form) as WatermarkFormFieldModel | undefined;
  const latestServerSettingsRef = useRef<WatermarkSettingsFormModel>(DEFAULT_WATERMARK_SETTINGS);

  const { data: watermarkSettings, isLoading } = useWatermarkSettings();
  const { isPending, mutateAsync: updateWatermarkSettings } = useUpdateWatermarkSettings();

  useEffect(() => {
    if (!watermarkSettings) return;

    const normalizedSettings = normalizeWatermarkSettings(watermarkSettings);

    latestServerSettingsRef.current = normalizedSettings;
    form.setFieldsValue(normalizedSettings);

    dispatch(
      setWatermark({
        text: normalizedSettings.text,
        visible: normalizedSettings.enabled
      })
    );
  }, [dispatch, form, watermarkSettings]);

  async function handleSubmit(values: WatermarkSettingsFormModel) {
    const normalizedValues = normalizeWatermarkSettings(values);
    const latestServerSettings = latestServerSettingsRef.current;

    if (JSON.stringify(normalizedValues) === JSON.stringify(latestServerSettings)) {
      window.$message?.info('设置未发生变化');
      return;
    }

    await updateWatermarkSettings(normalizedValues);
    latestServerSettingsRef.current = normalizedValues;
    form.setFieldsValue(normalizedValues);
    dispatch(
      setWatermark({
        text: normalizedValues.text,
        visible: normalizedValues.enabled
      })
    );
    window.$message?.success('保存成功');
  }

  const previewSettings = useMemo(
    () => normalizeWatermarkSettings({ ...latestServerSettingsRef.current, ...(watchedValues || {}) }),
    [watchedValues]
  );
  const isDirty = JSON.stringify(previewSettings) !== JSON.stringify(latestServerSettingsRef.current);
  const opacityPercent = `${Math.round(previewSettings.opacity * 100)}%`;

  return (
    <div className="h-full min-h-500px flex-col-stretch gap-16px overflow-hidden lt-sm:overflow-auto">
      <ACard
        className="flex-col-stretch sm:flex-1-hidden card-wrapper"
        title={t('page.websiteSettings.watermark.sectionTitle')}
        variant="borderless"
      >
        <ASpin spinning={isLoading || isPending}>
          <AForm
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
          >
            <ARow gutter={[16, 16]}>
              <ACol
                className="flex"
                lg={14}
                span={24}
              >
                <ACard
                  className="w-full"
                  size="small"
                  title={
                    <AFlex
                      align="center"
                      justify="space-between"
                    >
                      <span>基础配置</span>
                      <ATag color={previewSettings.enabled ? 'processing' : 'default'}>
                        {previewSettings.enabled ? '已启用' : '未启用'}
                      </ATag>
                    </AFlex>
                  }
                >
                  <AForm.Item
                    label={t('page.websiteSettings.watermark.enabled')}
                    name="enabled"
                    valuePropName="checked"
                  >
                    <ASwitch />
                  </AForm.Item>

                  <AForm.Item
                    label={t('page.websiteSettings.watermark.text')}
                    name="text"
                    rules={[
                      {
                        message: t('page.websiteSettings.form.watermarkText'),
                        required: true
                      },
                      {
                        validator: (_, value) => {
                          const text = normalizeWatermarkText(String(value || ''));
                          if (!text) {
                            return Promise.reject(new Error(t('page.websiteSettings.form.watermarkText')));
                          }
                          if (text.length > WATERMARK_TEXT_MAX_LENGTH) {
                            return Promise.reject(new Error(`水印文字长度不能超过${WATERMARK_TEXT_MAX_LENGTH}个字符`));
                          }
                          if (hasIllegalChars(text)) {
                            return Promise.reject(new Error('水印文字包含非法字符'));
                          }
                          return Promise.resolve();
                        }
                      }
                    ]}
                  >
                    <AInput
                      maxLength={WATERMARK_TEXT_MAX_LENGTH}
                      placeholder={t('page.websiteSettings.form.watermarkText')}
                    />
                  </AForm.Item>

                  <AForm.Item
                    label={t('page.websiteSettings.watermark.fontSize')}
                    name="fontSize"
                  >
                    <AInputNumber
                      className="w-full"
                      max={WATERMARK_FONT_SIZE_MAX}
                      min={WATERMARK_FONT_SIZE_MIN}
                      precision={0}
                    />
                  </AForm.Item>

                  <AForm.Item
                    label={`${t('page.websiteSettings.watermark.opacity')}（${opacityPercent}）`}
                    name="opacity"
                  >
                    <ASlider
                      max={WATERMARK_OPACITY_MAX}
                      min={WATERMARK_OPACITY_MIN}
                      step={0.01}
                      marks={{
                        [WATERMARK_OPACITY_MAX]: `${WATERMARK_OPACITY_MAX.toFixed(2)}`,
                        [WATERMARK_OPACITY_MIN]: `${WATERMARK_OPACITY_MIN.toFixed(2)}`
                      }}
                    />
                  </AForm.Item>

                  <AForm.Item
                    className="mb-0"
                    label={`${t('page.websiteSettings.watermark.rotate')}（${previewSettings.rotate}°）`}
                    name="rotate"
                  >
                    <ASlider
                      max={WATERMARK_ROTATE_MAX}
                      min={WATERMARK_ROTATE_MIN}
                      step={1}
                      marks={{
                        0: '0°',
                        [WATERMARK_ROTATE_MAX]: `${WATERMARK_ROTATE_MAX}°`,
                        [WATERMARK_ROTATE_MIN]: `${WATERMARK_ROTATE_MIN}°`
                      }}
                    />
                  </AForm.Item>
                </ACard>
              </ACol>

              <ACol
                className="flex"
                lg={10}
                span={24}
              >
                <ACard
                  className="w-full"
                  size="small"
                  title="效果预览"
                >
                  <ADescriptions
                    className="mb-12px"
                    column={1}
                    size="small"
                    items={[
                      {
                        children: previewSettings.text,
                        key: 'text',
                        label: t('page.websiteSettings.watermark.text')
                      },
                      {
                        children: `${previewSettings.fontSize}px`,
                        key: 'fontSize',
                        label: t('page.websiteSettings.watermark.fontSize')
                      },
                      {
                        children: opacityPercent,
                        key: 'opacity',
                        label: t('page.websiteSettings.watermark.opacity')
                      },
                      {
                        children: `${previewSettings.rotate}°`,
                        key: 'rotate',
                        label: t('page.websiteSettings.watermark.rotate')
                      }
                    ]}
                  />

                  <AWatermark
                    content={previewSettings.enabled ? previewSettings.text : ''}
                    font={{ color: `rgba(0, 0, 0, ${previewSettings.opacity})`, fontSize: previewSettings.fontSize }}
                    rotate={previewSettings.rotate}
                  >
                    <div className="h-280px border border-[#d9d9d9] rd-8px border-dashed bg-[#fff] px-16px py-12px text-13px text-[#8c8c8c] leading-22px">
                      预览区将模拟系统页面显示效果。保存后全局生效。
                    </div>
                  </AWatermark>
                </ACard>
              </ACol>
            </ARow>

            <AForm.Item className="mb-0 mt-16px">
              <AFlex justify="end">
                <AButton
                  disabled={!isDirty}
                  htmlType="submit"
                  loading={isPending}
                  type="primary"
                >
                  保存
                </AButton>
              </AFlex>
            </AForm.Item>
          </AForm>
        </ASpin>
      </ACard>
    </div>
  );
};

export default WatermarkSettings;
