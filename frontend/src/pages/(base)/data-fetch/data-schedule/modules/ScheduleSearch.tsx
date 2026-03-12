import { Button, Col, DatePicker, Flex, Form, Input, InputNumber, Row, Select } from 'antd';

const statusOptions = [
  { label: 'page.dataSchedule.statusPending', value: 'pending' },
  { label: 'page.dataSchedule.statusRunning', value: 'running' },
  { label: 'page.dataSchedule.statusSuccess', value: 'success' },
  { label: 'page.dataSchedule.statusFailed', value: 'failed' },
  { label: 'page.dataSchedule.statusPaused', value: 'paused' },
  { label: 'page.dataSchedule.statusStopped', value: 'stopped' }
];

const creatorOptions = [
  { label: '张三', value: 'zhangsan' },
  { label: '李四', value: 'lisi' },
  { label: '王五', value: 'wangwu' },
  { label: '赵六', value: 'zhaoliu' }
];

const ScheduleSearch: FC<Page.SearchProps> = memo(({ form, reset, search, searchParams }) => {
  const { t } = useTranslation();
  const matchRangeMin = Form.useWatch('matchRangeMin', form);
  const matchRangeMax = Form.useWatch('matchRangeMax', form);

  return (
    <Form
      form={form}
      initialValues={searchParams}
      labelCol={{
        md: 7,
        span: 5
      }}
    >
      <Row
        wrap
        gutter={[16, 16]}
      >
        <Col
          lg={6}
          md={12}
          span={24}
        >
          <Form.Item
            className="m-0"
            label={t('page.dataSchedule.projectName')}
            name="projectName"
          >
            <Input placeholder={t('page.dataSchedule.form.projectName')} />
          </Form.Item>
        </Col>

        <Col
          lg={6}
          md={12}
          span={24}
        >
          <Form.Item
            className="m-0"
            label={t('page.dataSchedule.status')}
            name="taskStatus"
          >
            <Select
              allowClear
              maxTagCount="responsive"
              mode="multiple"
              options={statusOptions.map(o => ({ label: t(o.label), value: o.value }))}
              placeholder={t('page.dataSchedule.form.status')}
            />
          </Form.Item>
        </Col>

        <Col
          lg={6}
          md={12}
          span={24}
        >
          <Form.Item
            className="m-0"
            label={t('page.dataSchedule.matchRange')}
          >
            <Flex
              align="center"
              gap={8}
            >
              <Form.Item
                noStyle
                name="matchRangeMin"
              >
                <InputNumber
                  className="flex-1"
                  max={matchRangeMax ?? 100}
                  min={0}
                  placeholder={t('page.dataSchedule.form.matchRangeMin')}
                />
              </Form.Item>
              <span>~</span>
              <Form.Item
                noStyle
                name="matchRangeMax"
              >
                <InputNumber
                  className="flex-1"
                  max={100}
                  min={matchRangeMin ?? 0}
                  placeholder={t('page.dataSchedule.form.matchRangeMax')}
                />
              </Form.Item>
            </Flex>
          </Form.Item>
        </Col>

        <Col
          lg={6}
          md={12}
          span={24}
        >
          <Form.Item
            className="m-0"
            label={t('page.dataSchedule.creator')}
            name="creator"
          >
            <Select
              allowClear
              maxTagCount="responsive"
              mode="multiple"
              options={creatorOptions}
              placeholder={t('page.dataSchedule.form.creator')}
            />
          </Form.Item>
        </Col>

        <Col
          lg={6}
          md={12}
          span={24}
        >
          <Form.Item
            className="m-0"
            label={t('page.dataSchedule.createTime')}
            name="createTime"
          >
            <DatePicker.RangePicker
              allowClear={false}
              className="w-full"
              separator="~"
              suffixIcon={null}
            />
          </Form.Item>
        </Col>

        <Col
          lg={18}
          span={24}
        >
          <Form.Item className="m-0">
            <Flex
              align="center"
              gap={12}
              justify="end"
            >
              <Button
                icon={<IconIcRoundRefresh />}
                onClick={reset}
              >
                {t('common.reset')}
              </Button>
              <Button
                ghost
                icon={<IconIcRoundSearch />}
                type="primary"
                onClick={search}
              >
                {t('common.search')}
              </Button>
            </Flex>
          </Form.Item>
        </Col>
      </Row>
    </Form>
  );
});

export default ScheduleSearch;
