import type { SelectableProjectItem } from './chooseDataMock';

interface Props {
  readonly confirmLoading?: boolean;
  readonly loading?: boolean;
  readonly onCancel: () => void;
  readonly onConfirm: () => void;
  readonly onSearchKeywordChange: (keyword: string) => void;
  readonly onSelectedProjectChange: (projectId: string) => void;
  readonly open: boolean;
  readonly projects: SelectableProjectItem[];
  readonly searchKeyword: string;
  readonly selectedProjectId: string;
}

const ScheduleChooseDataModal = ({
  confirmLoading = false,
  loading = false,
  onCancel,
  onConfirm,
  onSearchKeywordChange,
  onSelectedProjectChange,
  open,
  projects,
  searchKeyword,
  selectedProjectId
}: Props) => {
  return (
    <AModal
      centered
      destroyOnClose
      open={open}
      title="选择项目"
      width="min(680px, calc(100vw - 24px))"
      footer={
        <div className="flex justify-end gap-8px">
          <AButton
            className="rounded-9px"
            onClick={onCancel}
          >
            取消
          </AButton>
          <AButton
            className="border-0 rounded-9px bg-[linear-gradient(90deg,#2563eb,#3b82f6)] shadow-[0_8px_18px_rgba(37,99,235,0.3)]"
            disabled={!selectedProjectId || loading || confirmLoading}
            loading={confirmLoading}
            type="primary"
            onClick={onConfirm}
          >
            确认选择
          </AButton>
        </div>
      }
      styles={{
        body: {
          background: 'linear-gradient(180deg, #f8fbff 0%, #f5f8ff 100%)',
          borderRadius: 16,
          padding: 18
        },
        mask: {
          backdropFilter: 'blur(2px)'
        }
      }}
      onCancel={onCancel}
    >
      <div className="flex-col gap-12px">
        <AInput
          allowClear
          placeholder="搜索项目名称 / 项目ID / 行业"
          size="large"
          value={searchKeyword}
          onChange={event => onSearchKeywordChange(event.target.value)}
        />

        <div className="flex items-center justify-between text-13px text-[#64748b]">
          <span>可选项目</span>
          <span>{projects.length} 条</span>
        </div>

        <div className="h-420px overflow-auto border border-[#e2e8f0] rounded-10px bg-[#f8fafc] p-12px">
          <ASpin spinning={loading}>
            {projects.length > 0 ? (
              <ARadio.Group
                className="w-full"
                value={selectedProjectId}
                onChange={event => onSelectedProjectChange(String(event.target.value || ''))}
              >
                <ASpace
                  className="w-full"
                  direction="vertical"
                  size={10}
                >
                  {projects.map(project => (
                    <div
                      key={project.projectId}
                      className={`rounded-10px border bg-white px-12px py-10px transition-all duration-200 ${
                        selectedProjectId === project.projectId
                          ? 'border-[#2563eb] shadow-[0_6px_14px_rgba(37,99,235,0.14)]'
                          : 'border-[#e2e8f0]'
                      }`}
                    >
                      <ARadio
                        className="w-full"
                        value={project.projectId}
                      >
                        <div className="flex-col gap-6px">
                          <div className="text-15px text-[#0f172a] font-600">{project.projectName}</div>
                          <div className="text-12px text-[#64748b]">
                            项目ID：{project.projectId} | 行业：{project.industry}
                          </div>
                        </div>
                      </ARadio>
                    </div>
                  ))}
                </ASpace>
              </ARadio.Group>
            ) : (
              <AEmpty
                className="pt-60px"
                description={searchKeyword ? '未找到匹配项目' : '当前暂无可选项目'}
              />
            )}
          </ASpin>
        </div>
      </div>
    </AModal>
  );
};

export default ScheduleChooseDataModal;
