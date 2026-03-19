import { enableStatusRecord } from '@/constants/business';
import { ATG_MAP } from '@/constants/common';
import { TableHeaderOperation, useTable, useTableScroll } from '@/features/table';
import {
  fetchCreateSystemUser,
  fetchDeleteSystemUser,
  fetchGetSystemUserList,
  fetchUpdateSystemUser
} from '@/service/api';

import UserManageModal from './modules/UserManageModal';
import type { UserManageFormModel } from './modules/UserManageModal';
import UserManageSearch from './modules/UserManageSearch';

type OperateType = AntDesign.TableOperateType;

const UserManage = () => {
  const { t } = useTranslation();
  const isMobile = useMobile();
  const { scrollConfig, tableWrapperRef } = useTableScroll(900);

  const [form] = AForm.useForm<UserManageFormModel>();
  const [modalOpen, setModalOpen] = useState(false);
  const [operateType, setOperateType] = useState<OperateType>('add');
  const [submitting, setSubmitting] = useState(false);
  const [editingRow, setEditingRow] = useState<Api.SystemManage.AuthUser | null>(null);
  const [checkedRowKeys, setCheckedRowKeys] = useState<React.Key[]>([]);

  const { columnChecks, run, searchProps, setColumnChecks, tableProps } = useTable({
    apiFn: fetchGetSystemUserList,
    apiParams: {
      current: 1,
      size: 10,
      status: null,
      userEmail: null,
      userName: null
    },
    columns: () => [
      {
        align: 'center',
        dataIndex: 'index',
        key: 'index',
        title: t('common.index'),
        width: 64
      },
      {
        align: 'center',
        dataIndex: 'userName',
        key: 'userName',
        minWidth: 160,
        title: t('page.systemSettings.userManage.userName')
      },
      {
        align: 'center',
        dataIndex: 'status',
        key: 'status',
        render: (_, record) => {
          const statusValue = record.status as Api.Common.EnableStatus;
          const label = t(enableStatusRecord[statusValue]);
          return <ATag color={ATG_MAP[statusValue]}>{label}</ATag>;
        },
        title: t('page.systemSettings.userManage.userStatus'),
        width: 120
      },
      {
        align: 'center',
        dataIndex: 'userEmail',
        key: 'userEmail',
        minWidth: 200,
        title: t('page.systemSettings.userManage.userEmail')
      },
      {
        align: 'center',
        dataIndex: 'createTime',
        key: 'createTime',
        title: t('page.systemSettings.userManage.createTime'),
        width: 170
      },
      {
        align: 'center',
        dataIndex: 'updateTime',
        key: 'updateTime',
        title: t('page.systemSettings.userManage.updateTime'),
        width: 170
      },
      {
        align: 'center',
        key: 'operate',
        render: (_, record) => (
          <div className="flex-center gap-8px">
            <AButton
              ghost
              size="small"
              type="primary"
              onClick={() => handleOpenEdit(record)}
            >
              {t('common.edit')}
            </AButton>
            <APopconfirm
              title={t('common.confirmDelete')}
              onConfirm={() => handleDelete(record.id)}
            >
              <AButton
                danger
                size="small"
              >
                {t('common.delete')}
              </AButton>
            </APopconfirm>
          </div>
        ),
        title: t('common.operate'),
        width: 150
      }
    ],
    pagination: {
      showQuickJumper: true
    }
  });

  const rowSelection = {
    columnWidth: 48,
    fixed: true,
    onChange: keys => setCheckedRowKeys(keys),
    selectedRowKeys: checkedRowKeys,
    type: 'checkbox'
  } satisfies NonNullable<typeof tableProps.rowSelection>;

  function handleOpenAdd() {
    setOperateType('add');
    setEditingRow(null);
    form.setFieldsValue({
      confirmPassword: '',
      email: '',
      password: '',
      status: '1',
      userName: ''
    });
    setModalOpen(true);
  }

  function handleOpenEdit(record: Api.SystemManage.AuthUser) {
    setOperateType('edit');
    setEditingRow(record);
    form.setFieldsValue({
      confirmPassword: '',
      email: record.userEmail || '',
      password: '',
      status: record.status,
      userName: record.userName
    });
    setModalOpen(true);
  }

  function handleCloseModal() {
    setModalOpen(false);
    form.resetFields();
  }

  async function handleSubmitModal() {
    const values = await form.validateFields();
    const payload: Api.SystemManage.AuthUserOperateParams = {
      confirmPassword: values.confirmPassword || '',
      email: (values.email || '').trim(),
      password: values.password || '',
      status: values.status,
      userName: values.userName.trim()
    };

    setSubmitting(true);
    try {
      if (operateType === 'add') {
        await fetchCreateSystemUser(payload);
      } else if (editingRow) {
        await fetchUpdateSystemUser(editingRow.id, payload);
      }

      window.$message?.success(operateType === 'add' ? t('common.addSuccess') : t('common.updateSuccess'));
      handleCloseModal();
      await run(false);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(userId: number) {
    await fetchDeleteSystemUser(userId);
    setCheckedRowKeys(keys => keys.filter(item => Number(item) !== userId));
    window.$message?.success(t('common.deleteSuccess'));
    await run(false);
  }

  async function handleBatchDelete() {
    const targetIds = checkedRowKeys.map(key => Number(key)).filter(item => Number.isFinite(item));
    if (!targetIds.length) return;

    const results = await Promise.allSettled(targetIds.map(userId => fetchDeleteSystemUser(userId)));
    const successCount = results.filter(item => item.status === 'fulfilled').length;
    const failedCount = results.length - successCount;

    if (successCount > 0) {
      window.$message?.success(t('page.systemSettings.userManage.batchDeleteSuccess', { count: successCount }));
    }
    if (failedCount > 0) {
      window.$message?.warning(t('page.systemSettings.userManage.batchDeleteFailed', { count: failedCount }));
    }

    setCheckedRowKeys([]);
    await run(false);
  }

  return (
    <div className="h-full min-h-500px flex-col-stretch gap-16px overflow-hidden lt-sm:overflow-auto">
      <ACollapse
        bordered={false}
        className="card-wrapper"
        defaultActiveKey={isMobile ? undefined : '1'}
        items={[
          {
            children: <UserManageSearch {...searchProps} />,
            key: '1',
            label: t('common.search')
          }
        ]}
      />

      <ACard
        className="flex-col-stretch sm:flex-1-hidden card-wrapper"
        ref={tableWrapperRef}
        title={t('page.systemSettings.userManage.title')}
        variant="borderless"
        extra={
          <TableHeaderOperation
            add={handleOpenAdd}
            columns={columnChecks}
            disabledDelete={checkedRowKeys.length === 0}
            loading={tableProps.loading}
            refresh={run}
            setColumnChecks={setColumnChecks}
            onDelete={() => {
              handleBatchDelete().catch(error => {
                window.$message?.error(error instanceof Error ? error.message : t('common.error'));
              });
            }}
          />
        }
      >
        <ATable
          rowSelection={rowSelection}
          scroll={scrollConfig}
          size="small"
          {...tableProps}
        />

        <UserManageModal
          form={form}
          loading={submitting}
          open={modalOpen}
          operateType={operateType}
          onCancel={handleCloseModal}
          onSubmit={() => {
            handleSubmitModal().catch(error => {
              window.$message?.error(error instanceof Error ? error.message : t('common.error'));
            });
          }}
        />
      </ACard>
    </div>
  );
};

export default UserManage;
  
