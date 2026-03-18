import type { DataNode } from 'antd/es/tree';

import { useDataScheduleSelectData } from '@/service/hooks';

import ScheduleChooseDataModal from './ScheduleChooseDataModal';
import type { ProjectNodeItem } from './chooseDataMock';
import { flattenProjectNodes } from './chooseDataMock';

interface Props {
  readonly onCancel: () => void;
  readonly onCreate: () => void;
}

const DEFAULT_CATALOGS: Api.DataSchedule.SelectDataCatalog[] = [
  {
    description: '固定数据目录',
    id: 'home_tj',
    name: '/home/tj'
  }
];

const ScheduleCreateView = ({ onCancel, onCreate }: Props) => {
  const selectDataQuery = useDataScheduleSelectData();
  const catalogs = useMemo<Api.DataSchedule.SelectDataCatalog[]>(
    () => (selectDataQuery.data?.catalogs?.length ? selectDataQuery.data.catalogs : DEFAULT_CATALOGS),
    [selectDataQuery.data?.catalogs]
  );
  const projectTreeByCatalogId = useMemo<Record<string, ProjectNodeItem[]>>(
    () => (selectDataQuery.data?.projectTreeByCatalogId as Record<string, ProjectNodeItem[]>) || {},
    [selectDataQuery.data?.projectTreeByCatalogId]
  );
  const hasRealCatalogData = catalogs.length > 0;

  const [chooseModalOpen, setChooseModalOpen] = useState(false);
  const [activeCatalogId, setActiveCatalogId] = useState('');
  const [selectedNodeMap, setSelectedNodeMap] = useState<Record<string, React.Key[]>>({});
  const [draftCatalogId, setDraftCatalogId] = useState(activeCatalogId);
  const [draftSelectedNodeMap, setDraftSelectedNodeMap] = useState<Record<string, React.Key[]>>({});

  useEffect(() => {
    const catalogIdSet = new Set(catalogs.map(item => item.id));
    const fallbackCatalogId = catalogs[0]?.id || '';
    const nextActiveCatalogId = catalogIdSet.has(activeCatalogId) ? activeCatalogId : fallbackCatalogId;
    const nextDraftCatalogId = catalogIdSet.has(draftCatalogId) ? draftCatalogId : nextActiveCatalogId;

    if (nextActiveCatalogId !== activeCatalogId) {
      setActiveCatalogId(nextActiveCatalogId);
    }
    if (nextDraftCatalogId !== draftCatalogId) {
      setDraftCatalogId(nextDraftCatalogId);
    }
  }, [activeCatalogId, catalogs, draftCatalogId]);

  function handleCreate() {
    onCreate();
  }

  const selectedSummary = useMemo(() => {
    const catalogIds = Object.keys(selectedNodeMap).filter(id => (selectedNodeMap[id] || []).length > 0);
    const projectCount = catalogIds.reduce((sum, id) => sum + (selectedNodeMap[id]?.length || 0), 0);

    return {
      catalogCount: catalogIds.length,
      projectCount
    };
  }, [selectedNodeMap]);

  const currentProjectNodes = projectTreeByCatalogId[draftCatalogId] || [];
  const currentCheckedKeys = draftSelectedNodeMap[draftCatalogId] || [];

  function openChooseModal() {
    if (selectDataQuery.isLoading) {
      window.$message?.info('正在加载项目树，请稍后再试');
      return;
    }
    if (selectDataQuery.isError) {
      window.$message?.error('加载项目树失败，请稍后重试');
      return;
    }
    if (!hasRealCatalogData) {
      window.$message?.warning('当前暂无可选数据目录');
      return;
    }
    setDraftCatalogId(activeCatalogId || catalogs[0]?.id || '');
    setDraftSelectedNodeMap({ ...selectedNodeMap });
    setChooseModalOpen(true);
  }

  function closeChooseModal() {
    setChooseModalOpen(false);
  }

  function handleCatalogChange(catalogId: string) {
    setDraftCatalogId(catalogId);
  }

  function handleCheckedKeysChange(keys: React.Key[]) {
    setDraftSelectedNodeMap(prev => ({
      ...prev,
      [draftCatalogId]: keys
    }));
  }

  function handleConfirmChoose() {
    setActiveCatalogId(draftCatalogId);
    setSelectedNodeMap(draftSelectedNodeMap);
    setChooseModalOpen(false);
  }

  function formatNodeMeta(node: ProjectNodeItem) {
    if (node.type === 'folder') {
      const count = node.itemCount ?? node.children?.length ?? 0;
      return `文件夹 · ${count} 项`;
    }

    const ext = node.fileExt || 'FILE';
    return `${ext} · ${node.fileSizeLabel || '-'}`;
  }

  function buildSelectedTreeData(nodes: ProjectNodeItem[], selectedSet: Set<string>): DataNode[] {
    const treeData: DataNode[] = [];

    nodes.forEach(node => {
      const children = buildSelectedTreeData(node.children || [], selectedSet);
      const currentSelected = selectedSet.has(node.id);

      if (!currentSelected && children.length === 0) {
        return;
      }

      treeData.push({
        children,
        key: node.id,
        title: (
          <div className="flex-y-center gap-8px">
            <span className={currentSelected ? 'font-600 text-[#0f172a]' : 'text-[#334155]'}>{node.name}</span>
            <span className="text-12px text-[#94a3b8]">{formatNodeMeta(node)}</span>
          </div>
        )
      });
    });

    return treeData;
  }

  const selectedCatalogDetails = useMemo(() => {
    const details: Array<{ catalogId: string; catalogName: string; selectedCount: number; treeData: DataNode[] }> = [];
    Object.entries(selectedNodeMap).forEach(([catalogId, keys]) => {
      if (!keys.length) return;

      const catalogName = catalogs.find(item => item.id === catalogId)?.name || catalogId;
      const allNodes = flattenProjectNodes(projectTreeByCatalogId[catalogId] || []);
      const allNodeIdSet = new Set(allNodes.map(item => item.id));
      const selectedIdSet = new Set(keys.map(key => String(key)).filter(key => allNodeIdSet.has(key)));

      if (!selectedIdSet.size) return;

      const treeData = buildSelectedTreeData(projectTreeByCatalogId[catalogId] || [], selectedIdSet);
      details.push({ catalogId, catalogName, selectedCount: selectedIdSet.size, treeData });
    });

    return details;
  }, [catalogs, projectTreeByCatalogId, selectedNodeMap]);

  function handleRemoveCatalog(catalogId: string) {
    setSelectedNodeMap(prev => {
      const next = { ...prev };
      Reflect.deleteProperty(next, catalogId);
      return next;
    });
    setDraftSelectedNodeMap(prev => {
      const next = { ...prev };
      Reflect.deleteProperty(next, catalogId);
      return next;
    });

    if (activeCatalogId === catalogId) {
      const fallbackCatalogId = catalogs.find(item => item.id !== catalogId)?.id || catalogs[0]?.id || '';
      setActiveCatalogId(fallbackCatalogId);
      setDraftCatalogId(fallbackCatalogId);
    }
  }

  return (
    <div
      className="relative h-full min-h-500px overflow-auto bg-[#f6f9ff] p-12px"
      style={{ fontFamily: 'Fira Sans, PingFang SC, Microsoft YaHei, sans-serif' }}
    >
      <div className="pointer-events-none absolute left-0 top-0 z-0 h-220px w-full bg-[radial-gradient(circle_at_20%_20%,rgba(37,99,235,0.18),transparent_50%),radial-gradient(circle_at_80%_0%,rgba(249,115,22,0.18),transparent_40%)]" />

      <div className="relative z-10 mx-auto max-w-1220px flex-col-stretch gap-16px">
        <div className="flex items-center gap-12px">
          <AButton
            aria-label="返回数据调度列表"
            className="h-44px w-44px rounded-full border-none bg-white text-18px text-[#1f3a8a] shadow-sm transition-all duration-200 hover:bg-[#e6f4ff] hover:text-[#2563eb]"
            type="text"
            onClick={onCancel}
          >
            {'<'}
          </AButton>
          <div className="flex-col gap-2px">
            <div className="w-fit rounded-full bg-[#dbeafe] px-10px py-4px text-12px font-600 text-[#1d4ed8]">
              DATA SCHEDULE
            </div>
            <h2 className="m-0 text-38px font-700 leading-none text-[#0f172a]">新建数据调度</h2>
          </div>
        </div>

        <p className="m-0 max-w-620px text-15px leading-24px text-[#334155]">配置数据目录与项目后创建任务。</p>

        <ACard
          className="card-wrapper overflow-hidden rounded-16px border-0 shadow-[0_14px_32px_rgba(15,23,42,0.08)]"
          styles={{ body: { minHeight: 320, padding: 28 } }}
          variant="borderless"
        >
          <div className="mb-20px h-6px w-160px rounded-full bg-[linear-gradient(90deg,#2563eb,#3b82f6,#f97316)]" />

          <AForm
            layout="vertical"
            requiredMark={false}
          >
            <AForm.Item label={<span className="text-17px font-600 text-[#0f172a]">数据选择</span>}>
              <div className="min-h-88px rounded-10px border border-dashed border-[#93c5fd] bg-[#eff6ff] px-14px py-12px text-15px transition-all duration-200">
                {selectedSummary.projectCount > 0 ? (
                  <div className="flex-col gap-10px">
                    <div className="flex items-center justify-between gap-12px">
                      <div className="text-[#1e3a8a]">
                        已选择 {selectedSummary.catalogCount} 个数据目录，{selectedSummary.projectCount} 个项目。
                      </div>
                      <AButton
                        className="rounded-8px border-[#93c5fd] bg-white! text-[#1d4ed8] hover:border-[#60a5fa] hover:text-[#1e40af]"
                        size="small"
                        onClick={openChooseModal}
                      >
                        继续添加
                      </AButton>
                    </div>

                    <ACollapse
                      className="rounded-10px border border-[#dbeafe] bg-white"
                      expandIconPosition="end"
                      items={selectedCatalogDetails.map(item => ({
                        children: (
                          <div className="rounded-8px border border-[#e2e8f0] bg-[#f8fafc] p-10px">
                            <ATree
                              blockNode
                              defaultExpandAll
                              selectable={false}
                              showLine
                              treeData={item.treeData}
                            />
                          </div>
                        ),
                        extra: (
                          <AButton
                            danger
                            className="px-0!"
                            size="small"
                            type="link"
                            onClick={event => {
                              event.stopPropagation();
                              handleRemoveCatalog(item.catalogId);
                            }}
                          >
                            删除数据目录
                          </AButton>
                        ),
                        key: item.catalogId,
                        label: (
                          <div className="flex items-center gap-8px">
                            <span className="font-600 text-[#0f172a]">{item.catalogName}</span>
                            <span className="rounded-full bg-[#e6f4ff] px-8px py-1px text-12px text-[#1d4ed8]">
                              {item.selectedCount} 项
                            </span>
                          </div>
                        )
                      }))}
                    />
                  </div>
                ) : (
                  <div className="flex flex-wrap items-center gap-2px text-[#64748b]">
                    <span>尚未选择数据源，</span>
                    <AButton
                      className="px-0! text-[#2563eb] hover:text-[#1d4ed8]"
                      type="link"
                      onClick={openChooseModal}
                    >
                      点击选择数据
                    </AButton>
                    <span>。</span>
                  </div>
                )}
              </div>
            </AForm.Item>

            <div className="mt-28px flex-center gap-12px">
              <AButton
                className="min-w-120px rounded-9px"
                size="large"
                onClick={onCancel}
              >
                取消
              </AButton>
              <AButton
                className="min-w-120px rounded-9px border-0 bg-[linear-gradient(90deg,#2563eb,#3b82f6)] shadow-[0_8px_18px_rgba(37,99,235,0.3)]"
                size="large"
                type="primary"
                onClick={handleCreate}
              >
                创建
              </AButton>
            </div>
          </AForm>
        </ACard>
      </div>

      <ScheduleChooseDataModal
        activeCatalogId={draftCatalogId}
        catalogs={catalogs}
        checkedKeys={currentCheckedKeys}
        open={chooseModalOpen}
        projectNodes={currentProjectNodes}
        onCancel={closeChooseModal}
        onCatalogChange={handleCatalogChange}
        onCheckedKeysChange={handleCheckedKeysChange}
        onConfirm={handleConfirmChoose}
      />
    </div>
  );
};

export default ScheduleCreateView;
