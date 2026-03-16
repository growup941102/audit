import type { DataNode } from 'antd/es/tree';

import type { DataCatalogItem, ProjectNodeItem } from './chooseDataMock';

interface Props {
  readonly activeCatalogId: string;
  readonly catalogs: DataCatalogItem[];
  readonly checkedKeys: React.Key[];
  readonly onCancel: () => void;
  readonly onCatalogChange: (catalogId: string) => void;
  readonly onCheckedKeysChange: (keys: React.Key[]) => void;
  readonly onConfirm: () => void;
  readonly open: boolean;
  readonly projectNodes: ProjectNodeItem[];
}

function formatNodeMeta(node: ProjectNodeItem) {
  if (node.type === 'folder') {
    const count = node.itemCount ?? node.children?.length ?? 0;
    return `文件夹 · ${count} 项`;
  }

  const ext = node.fileExt || 'FILE';
  return `${ext} · ${node.fileSizeLabel || '-'}`;
}

function transformTreeData(nodes: ProjectNodeItem[]): DataNode[] {
  return nodes.map(node => ({
    children: transformTreeData(node.children || []),
    key: node.id,
    title: (
      <div className="flex-y-center gap-8px">
        <span className="text-16px font-600 text-[#262626]">{node.name}</span>
        <span className="text-14px text-[#8c8c8c]">{formatNodeMeta(node)}</span>
      </div>
    )
  }));
}

const ScheduleChooseDataModal = ({
  activeCatalogId,
  catalogs,
  checkedKeys,
  onCancel,
  onCatalogChange,
  onCheckedKeysChange,
  onConfirm,
  open,
  projectNodes
}: Props) => {
  const treeData = useMemo(() => transformTreeData(projectNodes), [projectNodes]);
  const selectedCount = checkedKeys.length;

  return (
    <AModal
      centered
      destroyOnClose
      open={open}
      title="选择数据"
      width="min(980px, calc(100vw - 24px))"
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
      footer={
        <div className="flex justify-end gap-8px">
          <AButton
            className="rounded-9px"
            onClick={onCancel}
          >
            取消
          </AButton>
          <AButton
            className="rounded-9px border-0 bg-[linear-gradient(90deg,#2563eb,#3b82f6)] shadow-[0_8px_18px_rgba(37,99,235,0.3)]"
            type="primary"
            onClick={onConfirm}
          >
            确认选择
          </AButton>
        </div>
      }
      onCancel={onCancel}
    >
      <div className="grid grid-cols-[280px_1fr] gap-20px pt-8px lt-lg:grid-cols-1">
        <div className="rounded-12px border border-[#dbeafe] bg-white p-12px shadow-[0_6px_16px_rgba(15,23,42,0.05)]">
          <div className="mb-12px flex items-center justify-between">
            <div className="text-19px font-700 text-[#0f172a]">数据目录</div>
            <div className="rounded-full bg-[#eff6ff] px-8px py-2px text-12px font-600 text-[#1d4ed8]">
              {catalogs.length} 个
            </div>
          </div>
          <div className="flex-col gap-10px">
            {catalogs.map(item => {
              const active = item.id === activeCatalogId;

              return (
                <button
                  className={`w-full cursor-pointer rounded-10px border px-14px py-14px text-left transition-all duration-200 ${
                    active
                      ? 'border-[#2563eb] bg-[linear-gradient(90deg,#eff6ff,#dbeafe)] shadow-[0_6px_14px_rgba(37,99,235,0.16)]'
                      : 'border-[#e2e8f0] bg-[#f8fafc] hover:border-[#93c5fd] hover:bg-[#f1f5f9]'
                  }`}
                  key={item.id}
                  type="button"
                  onClick={() => onCatalogChange(item.id)}
                >
                  <div className="text-16px font-700 text-[#0f172a]">{item.name}</div>
                  <div className="mt-6px text-13px leading-20px text-[#64748b]">{item.description}</div>
                </button>
              );
            })}
          </div>
          <div className="mt-14px text-13px text-[#94a3b8]">点击切换数据目录，在右侧勾选对应项目。</div>
        </div>

        <div className="rounded-12px border border-[#dbeafe] bg-white p-12px shadow-[0_6px_16px_rgba(15,23,42,0.05)]">
          <div className="mb-12px flex items-center justify-between">
            <div className="text-19px font-700 text-[#0f172a]">项目列表</div>
            <div className="rounded-full bg-[#fff7ed] px-8px py-2px text-12px font-600 text-[#ea580c]">
              已选 {selectedCount} 项
            </div>
          </div>
          <div className="h-500px overflow-auto rounded-10px border border-[#e2e8f0] bg-[#f8fafc] p-12px">
            {treeData.length > 0 ? (
              <ATree
                checkable
                checkedKeys={checkedKeys}
                defaultExpandAll
                treeData={treeData}
                onCheck={keys => onCheckedKeysChange(keys as React.Key[])}
              />
            ) : (
              <AEmpty
                className="pt-60px"
                description="当前目录暂无可选项目"
              />
            )}
          </div>
        </div>
      </div>
    </AModal>
  );
};

export default ScheduleChooseDataModal;
