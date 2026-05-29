import { DownloadOutlined, ImportOutlined, PlusOutlined } from '@ant-design/icons';
import {
  ModalForm,
  PageContainer,
  ProColumns,
  ProFormText,
  ProFormUploadDragger,
  ProTable,
} from '@ant-design/pro-components';
import type { ActionType } from '@ant-design/pro-components';
import { useModel } from '@umijs/max';
import { Button, message, Popconfirm } from 'antd';
import type { Key } from 'react';
import { useRef, useState } from 'react';
import {
  deleteStore,
  deleteStoreBatch,
  downloadBlob,
  exportStores,
  importStores,
  listStores,
  saveStore,
  storeTemplate,
  StoreRecord,
} from '@/services/base';
import { tablePagination } from '@/utils/pagination';

export default function StorePage() {
  const actionRef = useRef<ActionType>();
  const { initialState } = (useModel as any)('@@initialState');
  const roleCode = initialState?.currentUser?.roleCode;
  const roleName = initialState?.currentUser?.roleName;
  const canDelete = ['SUPER_ADMIN', 'ADMIN', 'USER'].includes(roleCode)
    || ['超级管理员', '管理员', '普通用户'].includes(roleName);
  const [editing, setEditing] = useState<StoreRecord>();
  const [open, setOpen] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const [importing, setImporting] = useState(false);
  const [fileList, setFileList] = useState<File[]>([]);
  const [selectedRowKeys, setSelectedRowKeys] = useState<Key[]>([]);

  const columns: ProColumns<StoreRecord>[] = [
    { title: '门店ID', dataIndex: 'storeId', width: 160, ellipsis: true },
    { title: '门店', dataIndex: 'storeName', width: 360, ellipsis: true },
    {
      title: '操作',
      valueType: 'option',
      width: 160,
      render: (_, record) => [
        <a key="edit" onClick={() => { setEditing(record); setOpen(true); }}>
          编辑
        </a>,
        canDelete ? (
          <Popconfirm
            key="delete"
            title="确认删除该门店资料？"
            onConfirm={async () => {
              const result = await deleteStore(record.id!);
              result.code === 0 ? message.success('已删除') : message.error(result.message);
              actionRef.current?.reload();
            }}
          >
            <a>删除</a>
          </Popconfirm>
        ) : null,
      ].filter(Boolean),
    },
  ];

  return (
    <PageContainer>
      <ProTable<StoreRecord>
        rowKey="id"
        actionRef={actionRef}
        columns={columns}
        rowSelection={{
          selectedRowKeys,
          preserveSelectedRowKeys: true,
          onChange: (keys) => setSelectedRowKeys(keys),
        }}
        request={async (params) => {
          const result = await listStores(params);
          return { data: result.data, total: result.total, success: result.code === 0 };
        }}
        scroll={{ x: 760 }}
        form={{ syncToUrl: true }}
        pagination={tablePagination}
        toolBarRender={() => [
          canDelete ? (
            <Popconfirm
              key="batchDelete"
              title="确认删除勾选的门店资料？"
              onConfirm={async () => {
                if (!selectedRowKeys.length) {
                  message.warning('请先勾选要删除的门店');
                  return;
                }
                const result = await deleteStoreBatch(selectedRowKeys.map(String));
                result.code === 0 ? message.success('已删除') : message.error(result.message);
                setSelectedRowKeys([]);
                actionRef.current?.reload();
              }}
            >
              <Button danger disabled={!selectedRowKeys.length}>
                批量删除
              </Button>
            </Popconfirm>
          ) : null,
          <Button
            key="template"
            icon={<DownloadOutlined />}
            onClick={async () => {
              const blob = await storeTemplate();
              downloadBlob(blob, '门店资料导入模板.xlsx');
            }}
          >
            模板下载
          </Button>,
          <Button key="import" icon={<ImportOutlined />} onClick={() => setImportOpen(true)}>
            导入
          </Button>,
          <Button
            key="export"
            icon={<DownloadOutlined />}
            onClick={async () => {
              if (!selectedRowKeys.length) {
                message.warning('请先勾选要导出的门店');
                return;
              }
              const blob = await exportStores({ ids: selectedRowKeys });
              downloadBlob(blob, '门店资料.xlsx');
            }}
          >
            导出
          </Button>,
          <Button
            key="create"
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => { setEditing(undefined); setOpen(true); }}
          >
            新增
          </Button>,
        ].filter(Boolean)}
      />
      <ModalForm<StoreRecord>
        title={editing?.id ? '编辑门店资料' : '新增门店资料'}
        open={open}
        initialValues={editing}
        modalProps={{ destroyOnClose: true, onCancel: () => setOpen(false) }}
        onFinish={async (values) => {
          const result = await saveStore({ ...values, id: editing?.id });
          if (result.code !== 0) {
            message.error(result.message);
            return false;
          }
          message.success('已保存');
          setOpen(false);
          actionRef.current?.reload();
          return true;
        }}
      >
        <ProFormText name="storeId" label="门店ID" rules={[{ required: true }]} />
        <ProFormText name="storeName" label="门店" rules={[{ required: true }]} />
      </ModalForm>
      <ModalForm
        title="导入门店资料"
        open={importOpen}
        loading={importing}
        modalProps={{
          destroyOnClose: true,
          onCancel: () => {
            setImportOpen(false);
            setFileList([]);
          },
        }}
        onFinish={async () => {
          if (!fileList.length) {
            message.warning('请选择导入文件');
            return false;
          }
          setImporting(true);
          try {
            const result = await importStores(fileList[0]);
            if (result.code !== 0) {
              message.error(result.message);
              return false;
            }
            message.success(result.data || '导入成功');
            setImportOpen(false);
            setFileList([]);
            actionRef.current?.reload();
            return true;
          } finally {
            setImporting(false);
          }
        }}
      >
        <ProFormUploadDragger
          name="file"
          max={1}
          accept=".xlsx,.xls"
          description=""
          rules={[{ required: true, message: '请选择导入文件' }]}
          fieldProps={{
            beforeUpload: (file) => {
              setFileList([file]);
              return false;
            },
            onRemove: () => setFileList([]),
          }}
        />
      </ModalForm>
    </PageContainer>
  );
}
