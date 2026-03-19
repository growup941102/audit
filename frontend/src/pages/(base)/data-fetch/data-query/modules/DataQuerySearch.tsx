import { Button, Col, Input, Row, Select } from 'antd';

type DataQuerySearchProps = {
  industries: Api.DataQuery.IndustryOption[];
  industryValue: string;
  loading?: boolean;
  onIndustryChange: (value: string) => void;
  onProjectNameChange: (value: string) => void;
  onReset: () => void;
  onSearch: () => void;
  projectNameValue: string;
};

const DataQuerySearch: FC<DataQuerySearchProps> = memo(
  ({
    industries,
    industryValue,
    loading = false,
    onIndustryChange,
    onProjectNameChange,
    onReset,
    onSearch,
    projectNameValue
  }) => {
    return (
      <div className="rounded-8px bg-white p-16px">
        <Row gutter={[12, 12]}>
          <Col
            lg={6}
            md={8}
            span={24}
          >
            <Select
              className="w-full"
              disabled={!industries.length}
              loading={loading}
              options={industries}
              placeholder="请选择项目行业"
              value={industryValue || undefined}
              onChange={onIndustryChange}
            />
          </Col>
          <Col
            lg={8}
            md={10}
            span={24}
          >
            <Input
              allowClear
              placeholder="请输入项目名称"
              value={projectNameValue}
              onPressEnter={onSearch}
              onChange={event => {
                onProjectNameChange(event.target.value);
              }}
            />
          </Col>
          <Col
            lg={10}
            md={6}
            span={24}
          >
            <div className="flex justify-end gap-12px">
              <Button onClick={onReset}>重置</Button>
              <Button
                disabled={!industryValue}
                type="primary"
                onClick={onSearch}
              >
                查询
              </Button>
            </div>
          </Col>
        </Row>
      </div>
    );
  }
);

export default DataQuerySearch;
