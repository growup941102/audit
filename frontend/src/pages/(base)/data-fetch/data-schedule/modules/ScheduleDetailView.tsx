import type { ColumnsType } from "antd/es/table";

import {
  createDataScheduleDrilldownRow,
  deleteDataScheduleDrilldownRow,
  fetchDataScheduleExtractExport,
  updateDataScheduleDrilldownRow,
  updateDataScheduleExtractField,
} from "@/service/api";
import {
  useDataScheduleExtractDrilldown,
  useDataScheduleExtractFields,
  useDataScheduleExtractSummary,
} from "@/service/hooks";
import { DownloadOutlined, EyeOutlined, LoadingOutlined } from "@ant-design/icons";

interface Props {
  readonly onBack: () => void;
  readonly taskId: string;
}

const FIELD_PAGE_SIZE = 20;
const DRILLDOWN_PAGE_SIZE = 10;

const statusColorMap: Record<string, string> = {
  failed: "error",
  paused: "warning",
  pending: "default",
  running: "processing",
  stopped: "default",
  success: "success",
};

const statusI18nMap: Record<string, string> = {
  failed: "page.dataSchedule.statusFailed",
  paused: "page.dataSchedule.statusPaused",
  pending: "page.dataSchedule.statusPending",
  running: "page.dataSchedule.statusRunning",
  stopped: "page.dataSchedule.statusStopped",
  success: "page.dataSchedule.statusSuccess",
};

const scopes: Api.DataSchedule.Scope[] = ["all", "complete", "missing"];

const ScheduleDetailView = ({ onBack, taskId }: Props) => {
  const { t } = useTranslation();
  const [scope, setScope] = useState<Api.DataSchedule.Scope>("all");
  const [fieldCurrent, setFieldCurrent] = useState(1);
  const [drilldownFieldKey, setDrilldownFieldKey] = useState("");
  const [drilldownCurrent, setDrilldownCurrent] = useState(1);
  const [downloading, setDownloading] = useState(false);
  const [editingField, setEditingField] = useState<{ fieldKey: string; fieldName: string } | null>(null);
  const [editingFieldValue, setEditingFieldValue] = useState("");
  const [savingField, setSavingField] = useState(false);
  const [drilldownRowModal, setDrilldownRowModal] = useState<{ mode: "create" | "edit"; rowId?: number } | null>(null);
  const [savingDrilldownRow, setSavingDrilldownRow] = useState(false);
  const [deletingDrilldownRowId, setDeletingDrilldownRowId] = useState<number | null>(null);
  const [drilldownRowForm] = AForm.useForm<Record<string, string>>();

  const summaryQuery = useDataScheduleExtractSummary(taskId);
  const fieldsQuery = useDataScheduleExtractFields({
    current: fieldCurrent,
    scope,
    size: FIELD_PAGE_SIZE,
    taskId,
  });
  const drilldownQuery = useDataScheduleExtractDrilldown(
    drilldownFieldKey
      ? {
          current: drilldownCurrent,
          fieldKey: drilldownFieldKey,
          scope,
          size: DRILLDOWN_PAGE_SIZE,
          taskId,
        }
      : null,
  );

  const summary = summaryQuery.data;
  const fieldList = fieldsQuery.data;
  const drilldown = drilldownQuery.data;
  const counts = summary?.counts ||
    fieldList?.counts || { all: 0, complete: 0, missing: 0 };
  const isDrilldownOpen = Boolean(drilldownFieldKey);
  const isEditModalOpen = Boolean(editingField);
  const isDrilldownRowModalOpen = Boolean(drilldownRowModal);

  useEffect(() => {
    setEditingField(null);
    setEditingFieldValue("");
    setDrilldownRowModal(null);
    drilldownRowForm.resetFields();
  }, [taskId]);

  const fieldColumns = useMemo<ColumnsType<Api.DataSchedule.FieldRecord>>(
    () => [
      {
        dataIndex: "fieldName",
        key: "fieldName",
        title: t("page.dataSchedule.detailFieldName"),
        width: 300,
      },
      {
        dataIndex: "fieldValueDisplay",
        key: "fieldValueDisplay",
        render: (value: string, record) => {
          if (record.canDrilldown) {
            return (
              <AButton
                className="px-0!"
                size="small"
                type="link"
                onClick={() => {
                  setDrilldownFieldKey(record.fieldKey);
                  setDrilldownCurrent(1);
                }}
              >
                {record.drilldownLabel || t("page.dataSchedule.detailView")}
              </AButton>
            );
          }

          return (
            <ATooltip title={value}>
              <span className="line-clamp-1">{value}</span>
            </ATooltip>
          );
        },
        title: t("page.dataSchedule.detailFieldValue"),
      },
      {
        align: "center",
        key: "operate",
        render: (_, record) => (
          <AButton
            className="px-0!"
            disabled={!record.canEdit}
            size="small"
            type="link"
            onClick={() => {
              if (!record.canEdit) return;
              setEditingField({
                fieldKey: record.fieldKey,
                fieldName: record.fieldName
              });
              setEditingFieldValue(record.fieldValueDisplay ?? "");
            }}
          >
            {t("page.dataSchedule.detailEdit")}
          </AButton>
        ),
        title: t("page.dataSchedule.detailAction"),
        width: 140,
      },
    ],
    [t],
  );

  const drilldownColumns = useMemo<
    ColumnsType<Api.DataSchedule.DrilldownRecord>
  >(() => {
    const canEdit = Boolean(drilldown?.actions?.canEdit);
    const canDelete = Boolean(drilldown?.actions?.canDelete);
    const dynamicColumns: ColumnsType<Api.DataSchedule.DrilldownRecord> = (
      drilldown?.columns || []
    ).map((column) => ({
      dataIndex: column.key,
      key: column.key,
      title: column.title,
      width: column.width,
    }));

    dynamicColumns.push({
      align: "center",
      key: "__actions",
      render: (_, record) => (
        <div className="flex-center gap-8px">
          <AButton
            className="px-0!"
            disabled={!canEdit}
            size="small"
            type="link"
            onClick={() => openEditDrilldownRowModal(record)}
          >
            {t("page.dataSchedule.detailEdit")}
          </AButton>
          <APopconfirm
            disabled={!canDelete}
            title={t("common.confirmDelete")}
            onConfirm={() => handleDeleteDrilldownRow(record)}
          >
            <AButton
              danger
              className="px-0!"
              disabled={!canDelete}
              loading={deletingDrilldownRowId === parseRowId(record)}
              size="small"
              type="link"
            >
              {t("common.delete")}
            </AButton>
          </APopconfirm>
        </div>
      ),
      title: t("page.dataSchedule.detailAction"),
      width: 140,
    });

    return dynamicColumns;
  }, [deletingDrilldownRowId, drilldown?.actions?.canDelete, drilldown?.actions?.canEdit, drilldown?.columns, t]);

  function closeDrilldown() {
    setDrilldownFieldKey("");
    setDrilldownCurrent(1);
    setDrilldownRowModal(null);
    drilldownRowForm.resetFields();
  }

  function handleSwitchScope(nextScope: Api.DataSchedule.Scope) {
    setScope(nextScope);
    setFieldCurrent(1);
    closeDrilldown();
  }

  function parseRowId(record: Api.DataSchedule.DrilldownRecord) {
    const rawId = record.id;
    const parsed = Number(rawId);
    if (!Number.isFinite(parsed) || parsed <= 0) return null;
    return Math.trunc(parsed);
  }

  function openCreateDrilldownRowModal() {
    const columns = drilldown?.columns || [];
    const initialValues: Record<string, string> = {};
    columns.forEach(column => {
      initialValues[column.key] = "";
    });
    drilldownRowForm.setFieldsValue(initialValues);
    setDrilldownRowModal({ mode: "create" });
  }

  function openEditDrilldownRowModal(record: Api.DataSchedule.DrilldownRecord) {
    const rowId = parseRowId(record);
    if (!rowId) {
      window.$message?.error(t("common.error"));
      return;
    }

    const columns = drilldown?.columns || [];
    const editValues: Record<string, string> = {};
    columns.forEach(column => {
      const value = record[column.key];
      editValues[column.key] = value == null ? "" : String(value);
    });
    drilldownRowForm.setFieldsValue(editValues);
    setDrilldownRowModal({ mode: "edit", rowId });
  }

  function closeDrilldownRowModal() {
    setDrilldownRowModal(null);
    drilldownRowForm.resetFields();
  }

  async function handleSaveDrilldownRow() {
    if (!drilldownFieldKey || !drilldownRowModal) return;

    try {
      const values = await drilldownRowForm.validateFields();
      const rowData: Api.DataSchedule.DrilldownRowPayload = {};
      Object.keys(values).forEach(key => {
        rowData[key] = values[key];
      });

      setSavingDrilldownRow(true);
      if (drilldownRowModal.mode === "create") {
        await createDataScheduleDrilldownRow({
          fieldKey: drilldownFieldKey,
          rowData,
          taskId
        });
        window.$message?.success(t("page.dataSchedule.detailCreateRowSuccess"));
      } else {
        await updateDataScheduleDrilldownRow({
          fieldKey: drilldownFieldKey,
          rowData,
          rowId: drilldownRowModal.rowId as number,
          taskId
        });
        window.$message?.success(t("page.dataSchedule.detailUpdateRowSuccess"));
      }
      await drilldownQuery.refetch();
      closeDrilldownRowModal();
    } catch (error) {
      if (typeof error === "object" && error && "errorFields" in error) {
        return;
      }
      const message = error instanceof Error ? error.message : t("common.error");
      if (message) {
        window.$message?.error(message);
      }
    } finally {
      setSavingDrilldownRow(false);
    }
  }

  async function handleDeleteDrilldownRow(record: Api.DataSchedule.DrilldownRecord) {
    if (!drilldownFieldKey) return;

    const rowId = parseRowId(record);
    if (!rowId) {
      window.$message?.error(t("common.error"));
      return;
    }

    try {
      setDeletingDrilldownRowId(rowId);
      await deleteDataScheduleDrilldownRow({
        fieldKey: drilldownFieldKey,
        rowId,
        taskId
      });
      await drilldownQuery.refetch();
      window.$message?.success(t("page.dataSchedule.detailDeleteRowSuccess"));
    } catch (error) {
      const message = error instanceof Error ? error.message : t("common.error");
      window.$message?.error(message);
    } finally {
      setDeletingDrilldownRowId(null);
    }
  }

  async function handleDownload() {
    try {
      setDownloading(true);
      const result = await fetchDataScheduleExtractExport({ scope, taskId });
      const downloadUrl = URL.createObjectURL(result.blob);
      const anchor = document.createElement("a");
      anchor.download = result.fileName;
      anchor.href = downloadUrl;
      document.body.append(anchor);
      anchor.click();
      anchor.remove();
      URL.revokeObjectURL(downloadUrl);
      window.$message?.success(t("page.dataSchedule.detailDownloadSuccess"));
    } catch (error) {
      const message =
        error instanceof Error ? error.message : t("common.error");
      window.$message?.error(message);
    } finally {
      setDownloading(false);
    }
  }

  function closeEditFieldModal() {
    setEditingField(null);
    setEditingFieldValue("");
  }

  async function handleSaveEditField() {
    if (!editingField) return;

    try {
      setSavingField(true);
      await updateDataScheduleExtractField({
        fieldKey: editingField.fieldKey,
        fieldValue: editingFieldValue,
        taskId
      });
      await fieldsQuery.refetch();
      window.$message?.success(t("page.dataSchedule.detailEditSaved"));
      closeEditFieldModal();
    } catch (error) {
      const message = error instanceof Error ? error.message : t("common.error");
      window.$message?.error(message);
    } finally {
      setSavingField(false);
    }
  }

  return (
    <div
      className="h-full overflow-auto bg-[linear-gradient(180deg,#f8fbff_0%,#f4f6fb_100%)] p-12px"
      style={{
        fontFamily: "Fira Sans, PingFang SC, Microsoft YaHei, sans-serif",
      }}
    >
      <div className="mx-auto max-w-1360px flex-col gap-14px">
        <div className="flex items-center gap-10px">
          <AButton
            aria-label={t("common.back")}
            className="h-40px w-40px rounded-full border-0 bg-white text-18px text-[#1f3a8a] shadow-[0_6px_16px_rgba(15,23,42,0.08)]"
            type="text"
            onClick={onBack}
          >
            {"<"}
          </AButton>
          <div className="min-w-0">
            <div className="text-12px font-600 tracking-[0.12em] text-[#64748b]">
              DATA SCHEDULE DETAIL
            </div>
            <h2 className="m-0 line-clamp-1 text-28px text-[#0f172a]">
              {summary?.projectName || taskId}
            </h2>
          </div>
        </div>

        <ACard
          className="rounded-12px border-0 shadow-[0_10px_24px_rgba(15,23,42,0.08)]"
          styles={{ body: { padding: 18 } }}
          title={
            <div className="text-17px font-700 text-[#0f172a]">
              {t("page.dataSchedule.detailTaskInfo")}
            </div>
          }
          variant="borderless"
        >
          {summaryQuery.isLoading ? (
            <ASkeleton active paragraph={{ rows: 4 }} />
          ) : (
            <div className="flex-col gap-12px">
              <ADescriptions
                bordered
                column={3}
                items={[
                  {
                    key: "taskId",
                    label: t("page.dataSchedule.taskId"),
                    children: summary?.taskId || taskId,
                  },
                  {
                    key: "projectName",
                    label: t("page.dataSchedule.projectName"),
                    children: summary?.projectName || "--",
                  },
                  {
                    key: "bidNo",
                    label: t("page.dataSchedule.detailBidNo"),
                    children: summary?.bidNo || "--",
                  },
                  {
                    key: "creator",
                    label: t("page.dataSchedule.creator"),
                    children: summary?.creator || "--",
                  },
                  {
                    key: "createTime",
                    label: t("page.dataSchedule.createTime"),
                    children: summary?.createTime || "--",
                  },
                  {
                    key: "status",
                    label: t("page.dataSchedule.status"),
                    children: (
                      <ATag
                        color={
                          statusColorMap[summary?.status || ""] || "default"
                        }
                      >
                        {t(
                          statusI18nMap[summary?.status || ""] ||
                            "page.dataSchedule.statusPending",
                        )}
                      </ATag>
                    ),
                  },
                ]}
                size="small"
              />

              <div className="rounded-10px border border-[#dbeafe] bg-[#f8fbff] p-10px">
                <div className="mb-8px text-13px text-[#64748b]">
                  {t("page.dataSchedule.detailKeyMatchRate")}
                </div>
                <div className="flex items-center gap-10px">
                  <AProgress
                    percent={summary?.progress || 0}
                    showInfo={false}
                    size="small"
                    strokeColor="#52c41a"
                  />
                  <div className="w-48px text-right text-13px font-600 text-[#16a34a]">
                    {summary?.progress || 0}%
                  </div>
                </div>
              </div>
            </div>
          )}
        </ACard>

        <ACard
          className="rounded-12px border-0 shadow-[0_10px_24px_rgba(15,23,42,0.08)]"
          styles={{ body: { padding: 16 } }}
          title={
            <div className="flex items-center justify-between gap-12px">
              <div className="text-17px font-700 text-[#0f172a]">
                {t("page.dataSchedule.detailDataDetail")}
              </div>
              <div className="flex items-center gap-8px">
                <div className="flex items-center gap-2px rounded-full bg-[#f1f5f9] p-3px">
                  {scopes.map((item) => {
                    const active = scope === item;
                    const count = counts[item] || 0;
                    const labelMap: Record<Api.DataSchedule.Scope, string> = {
                      all: t("page.dataSchedule.detailAll"),
                      complete: t("page.dataSchedule.detailComplete"),
                      missing: t("page.dataSchedule.detailMissing"),
                    };

                    return (
                      <button
                        className={`cursor-pointer rounded-full border-0 px-10px py-4px text-13px font-500 transition-all duration-200 ${
                          active
                            ? "bg-white text-[#0f172a] shadow-sm"
                            : "bg-transparent text-[#64748b] hover:text-[#0f172a]"
                        }`}
                        key={item}
                        type="button"
                        onClick={() => handleSwitchScope(item)}
                      >
                        {labelMap[item]}
                        <span
                          className={`ml-4px rounded-full px-5px py-1px text-11px ${active ? "bg-[#f1f5f9] text-[#475569]" : "bg-[#e2e8f0] text-[#94a3b8]"}`}
                        >
                          {count}
                        </span>
                      </button>
                    );
                  })}
                </div>
                <div className="flex items-center gap-4px rounded-full bg-white p-2px shadow-[0_1px_4px_rgba(15,23,42,0.08)]">
                  <ATooltip title={t("page.dataSchedule.detailPreview")}>
                    <button
                      className="flex-center h-28px w-28px cursor-not-allowed rounded-full border-0 bg-transparent text-14px text-[#cbd5e1] transition-colors"
                      disabled
                      type="button"
                    >
                      <EyeOutlined />
                    </button>
                  </ATooltip>
                  <div className="h-16px w-1px bg-[#e2e8f0]" />
                  <ATooltip
                    title={
                      downloading
                        ? t("page.dataSchedule.detailDownloading")
                        : t("page.dataSchedule.detailDownload")
                    }
                  >
                    <button
                      className={`flex-center h-28px w-28px rounded-full border-0 text-14px transition-all duration-200 ${
                        downloading
                          ? "cursor-wait bg-[#e0e7ff] text-[#818cf8]"
                          : "cursor-pointer bg-[#eef2ff] text-[#4f46e5] hover:bg-[#4f46e5] hover:text-white hover:shadow-[0_2px_8px_rgba(79,70,229,0.3)]"
                      }`}
                      disabled={downloading}
                      type="button"
                      onClick={handleDownload}
                    >
                      {downloading ? (
                        <LoadingOutlined spin />
                      ) : (
                        <DownloadOutlined />
                      )}
                    </button>
                  </ATooltip>
                </div>
              </div>
            </div>
          }
          variant="borderless"
        >
          <ATable
            rowKey="fieldKey"
            columns={fieldColumns}
            dataSource={fieldList?.records || []}
            loading={fieldsQuery.isFetching}
            pagination={{
              current: fieldList?.current || fieldCurrent,
              onChange: (page) => setFieldCurrent(page),
              pageSize: fieldList?.size || FIELD_PAGE_SIZE,
              showSizeChanger: false,
              total: fieldList?.total || 0,
            }}
            size="small"
          />
        </ACard>
      </div>

      <AModal
        destroyOnClose
        open={isDrilldownOpen}
        title={drilldown?.title || t("page.dataSchedule.detailFieldDetail")}
        width="min(1280px, calc(100vw - 32px))"
        footer={
          <AButton onClick={closeDrilldown}>
            {t("page.dataSchedule.detailClose")}
          </AButton>
        }
        onCancel={closeDrilldown}
      >
        <div className="mb-10px flex items-center justify-between gap-12px">
          <span className="text-13px text-[#94a3b8]">
            {t("page.dataSchedule.detailSourceHint")}
          </span>
          <AButton
            disabled={!drilldown?.actions?.canCreate}
            size="small"
            onClick={openCreateDrilldownRowModal}
          >
            {t("page.dataSchedule.detailCreateRow")}
          </AButton>
        </div>

        <ATable
          rowKey={(record, index) =>
            String(record.id || `${drilldownFieldKey}-${index || 0}`)
          }
          columns={drilldownColumns}
          dataSource={drilldown?.records || []}
          loading={drilldownQuery.isFetching}
          locale={{ emptyText: t("page.dataSchedule.detailNoData") }}
          pagination={{
            current: drilldown?.current || drilldownCurrent,
            onChange: (page) => setDrilldownCurrent(page),
            pageSize: drilldown?.size || DRILLDOWN_PAGE_SIZE,
            showSizeChanger: false,
            total: drilldown?.total || 0,
          }}
          scroll={{ x: "max-content", y: 420 }}
          size="small"
        />
      </AModal>

      <AModal
        destroyOnClose
        open={isEditModalOpen}
        title={t("page.dataSchedule.detailEditFieldTitle", { fieldName: editingField?.fieldName || "" })}
        width="min(980px, calc(100vw - 24px))"
        footer={
          <div className="flex justify-end gap-8px">
            <AButton onClick={closeEditFieldModal}>{t("common.cancel")}</AButton>
            <AButton loading={savingField} type="primary" onClick={handleSaveEditField}>
              {t("page.dataSchedule.detailSave")}
            </AButton>
          </div>
        }
        onCancel={closeEditFieldModal}
      >
        <AInput.TextArea
          autoSize={{ maxRows: 12, minRows: 8 }}
          placeholder={t("page.dataSchedule.detailEditPlaceholder")}
          value={editingFieldValue}
          onChange={event => setEditingFieldValue(event.target.value)}
        />
      </AModal>

      <AModal
        destroyOnClose
        open={isDrilldownRowModalOpen}
        title={
          drilldownRowModal?.mode === "create"
            ? t("page.dataSchedule.detailDrilldownCreateRowTitle")
            : t("page.dataSchedule.detailDrilldownEditRowTitle")
        }
        width="min(860px, calc(100vw - 24px))"
        footer={
          <div className="flex justify-end gap-8px">
            <AButton onClick={closeDrilldownRowModal}>{t("common.cancel")}</AButton>
            <AButton loading={savingDrilldownRow} type="primary" onClick={handleSaveDrilldownRow}>
              {t("page.dataSchedule.detailSave")}
            </AButton>
          </div>
        }
        onCancel={closeDrilldownRowModal}
      >
        <AForm
          form={drilldownRowForm}
          layout="vertical"
        >
          {(drilldown?.columns || []).map(column => (
            <AForm.Item
              key={column.key}
              label={column.title}
              name={column.key}
              rules={[
                {
                  required: true,
                  message: t("page.dataSchedule.detailDrilldownFieldRequired", { fieldName: column.title })
                }
              ]}
            >
              <AInput.TextArea autoSize={{ maxRows: 6, minRows: 2 }} />
            </AForm.Item>
          ))}
        </AForm>
      </AModal>
    </div>
  );
};

export default ScheduleDetailView;
