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
  deleteGoods,
  downloadBlob,
  exportGoods,
  GoodsRecord,
  goodsTemplate,
  importGoods,
  listGoods,
  saveGoods,
} from '@/services/base';
import { tablePagination } from '@/utils/pagination';

export default function GoodsPage() {
  const actionRef = useRef<ActionType>();
  const { initialState } = (useModel as any)('@@initialState');
  const roleCode = initialState?.currentUser?.roleCode;
  const canDelete = roleCode === 'SUPER_ADMIN' || roleCode === 'ADMIN';
  const [editing, setEditing] = useState<GoodsRecord>();
  const [open, setOpen] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const [importing, setImporting] = useState(false);
  const [fileList, setFileList] = useState<File[]>([]);
  const [selectedRowKeys, setSelectedRowKeys] = useState<Key[]>([]);

  const columns: ProColumns<GoodsRecord>[] = [
    { title: '货品ID', dataIndex: 'goodsId', width: 120, ellipsis: true },
    { title: '通用名', dataIndex: 'genericName', width: 220, ellipsis: true },
    { title: '生产厂商', dataIndex: 'manufacturer', search: false, width: 360, ellipsis: true },
    { title: '规格', dataIndex: 'specification', search: false, width: 180, ellipsis: true },
    { title: '单位', dataIndex: 'unit', search: false, width: 96, ellipsis: true },
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
            title="确认删除该货品资料？"
            onConfirm={async () => {
              const result = await deleteGoods(record.id!);
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
      <ProTable<GoodsRecord>
        rowKey="id"
        actionRef={actionRef}
        columns={columns}
        rowSelection={{
          selectedRowKeys,
          preserveSelectedRowKeys: true,
          onChange: (keys) => setSelectedRowKeys(keys),
        }}
        request={async (params) => {
          const result = await listGoods(params);
          return { data: result.data, total: result.total, success: result.code === 0 };
        }}
        scroll={{ x: 1120 }}
        form={{ syncToUrl: true }}
        pagination={tablePagination}
        toolBarRender={() => [
          <Button
            key="template"
            icon={<DownloadOutlined />}
            onClick={async () => {
              const blob = await goodsTemplate();
              downloadBlob(blob, '货品资料导入模板.xlsx');
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
                message.warning('请先勾选要导出的货品');
                return;
              }
              const blob = await exportGoods({ ids: selectedRowKeys });
              downloadBlob(blob, '货品资料.xlsx');
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
        ]}
      />
      <ModalForm<GoodsRecord>
        title={editing?.id ? '编辑货品资料' : '新增货品资料'}
        open={open}
        initialValues={editing}
        modalProps={{ destroyOnClose: true, onCancel: () => setOpen(false) }}
        onFinish={async (values) => {
          const result = await saveGoods({ ...values, id: editing?.id });
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
        <ProFormText name="goodsId" label="货品ID" rules={[{ required: true }]} />
        <ProFormText name="genericName" label="通用名" rules={[{ required: true }]} />
        <ProFormText name="manufacturer" label="生产厂商" rules={[{ required: true }]} />
        <ProFormText name="specification" label="规格" rules={[{ required: true }]} />
        <ProFormText name="unit" label="货品单位" rules={[{ required: true }]} />
      </ModalForm>
      <ModalForm
        title="导入货品资料"
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
            const result = await importGoods(fileList[0]);
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
