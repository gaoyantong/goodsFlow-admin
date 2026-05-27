import { DownloadOutlined, ImportOutlined, PlusOutlined } from '@ant-design/icons';
import {
  ModalForm,
  PageContainer,
  ProFormSelect,
  ProFormText,
  ProTable,
} from '@ant-design/pro-components';
import type { ActionType, ProColumns, ProFormInstance } from '@ant-design/pro-components';
import { Button, message, Popconfirm, Space, Table, Upload } from 'antd';
import { useRef, useState } from 'react';
import { downloadBlob, listStores } from '@/services/base';
import {
  deleteStoreCollection,
  importStoreCollectionStores,
  listStoreCollections,
  saveStoreCollection,
  storeCollectionTemplate,
} from '@/services/flow';
import type { StoreCollectionRecord, StoreCollectionStoreRecord } from '@/services/flow';
import { tablePagination } from '@/utils/pagination';

type StoreCollectionForm = {
  collectionName: string;
  storeIds: string[];
};

const storeText = (stores?: StoreCollectionStoreRecord[]) =>
  (stores || []).map((item) => `${item.storeId} ${item.storeName}`).join('、');

const loadCollectionStoreOptions = async (params?: { keyWords?: string }) => {
  const keyword = params?.keyWords?.trim();
  const result = await listStores({
    current: 1,
    pageSize: 100,
    storeId: keyword,
  });
  const storeList = result.data || [];

  if (!storeList.length && keyword) {
    const fallback = await listStores({
      current: 1,
      pageSize: 100,
      storeName: keyword,
    });
    return (fallback.data || []).map((item) => ({
      label: `${item.storeId} ${item.storeName}`,
      value: item.storeId,
    }));
  }

  return storeList.map((item) => ({
    label: `${item.storeId} ${item.storeName}`,
    value: item.storeId,
  }));
};

export default function StoreCollectionPage() {
  const actionRef = useRef<ActionType>();
  const formRef = useRef<ProFormInstance<StoreCollectionForm>>();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<StoreCollectionRecord>();
  const [importing, setImporting] = useState(false);

  const columns: ProColumns<StoreCollectionRecord>[] = [
    { title: '集合ID', dataIndex: 'collectionId', width: 140, ellipsis: true },
    { title: '集合名称', dataIndex: 'collectionName', width: 220, ellipsis: true },
    {
      title: '门店ID',
      dataIndex: 'storeId',
      hideInTable: true,
      fieldProps: { placeholder: '请输入' },
    },
    {
      title: '门店名称',
      dataIndex: 'storeName',
      hideInTable: true,
      fieldProps: { placeholder: '请输入' },
    },
    {
      title: '门店数量',
      dataIndex: 'stores',
      search: false,
      width: 100,
      align: 'right',
      renderText: (_, record) => record.stores?.length || 0,
    },
    {
      title: '门店明细',
      dataIndex: 'storesText',
      search: false,
      width: 520,
      ellipsis: true,
      renderText: (_, record) => storeText(record.stores),
    },
    {
      title: '操作',
      valueType: 'option',
      width: 140,
      fixed: 'right',
      render: (_, record) => [
        <a
          key="edit"
          onClick={() => {
            setEditing(record);
            setOpen(true);
          }}
        >
          编辑
        </a>,
        <Popconfirm
          key="delete"
          title="确认删除该门店集合？"
          onConfirm={async () => {
            const result = await deleteStoreCollection(record.id!);
            result.code === 0 ? message.success('已删除') : message.error(result.message);
            actionRef.current?.reload();
          }}
        >
          <a>删除</a>
        </Popconfirm>,
      ],
    },
  ];

  const initialValues = editing
    ? {
        collectionName: editing.collectionName,
        storeIds: editing.stores?.map((item) => item.storeId) || [],
      }
    : undefined;

  return (
    <PageContainer>
      <ProTable<StoreCollectionRecord>
        rowKey="id"
        actionRef={actionRef}
        columns={columns}
        request={async (params) => {
          const result = await listStoreCollections(params);
          return { data: result.data, total: result.total, success: result.code === 0 };
        }}
        scroll={{ x: 1180 }}
        form={{ syncToUrl: true }}
        pagination={tablePagination}
        expandable={{
          expandedRowRender: (record) => (
            <Table<StoreCollectionStoreRecord>
              rowKey={(item) => `${record.id}-${item.storeId}`}
              size="small"
              pagination={false}
              dataSource={record.stores || []}
              columns={[
                { title: '门店ID', dataIndex: 'storeId', width: 180 },
                { title: '门店名称', dataIndex: 'storeName' },
              ]}
            />
          ),
        }}
        toolBarRender={() => [
          <Button
            key="create"
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => {
              setEditing(undefined);
              setOpen(true);
            }}
          >
            新增
          </Button>,
        ]}
      />

      <ModalForm<StoreCollectionForm>
        title={editing?.id ? '编辑门店集合' : '新增门店集合'}
        open={open}
        formRef={formRef}
        initialValues={initialValues}
        modalProps={{
          destroyOnClose: true,
          onCancel: () => setOpen(false),
        }}
        onFinish={async (values) => {
          if (!values.storeIds?.length) {
            message.warning('请至少选择一个门店');
            return false;
          }
          const result = await saveStoreCollection({
            id: editing?.id,
            collectionId: editing?.collectionId,
            collectionName: values.collectionName,
            stores: values.storeIds.map((storeId) => ({ storeId, storeName: '' })),
          });
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
        <ProFormText name="collectionName" label="集合名称" rules={[{ required: true, message: '请输入集合名称' }]} />
        <ProFormSelect
          name="storeIds"
          label="门店"
          mode="multiple"
          request={loadCollectionStoreOptions}
          fieldProps={{
            showSearch: true,
            filterOption: false,
          }}
          rules={[{ required: true, message: '请选择门店' }]}
        />
        <Space>
          <Button
            icon={<DownloadOutlined />}
            onClick={async () => {
              const blob = await storeCollectionTemplate();
              downloadBlob(blob, '门店集合导入模板.xlsx');
            }}
          >
            下载导入模板
          </Button>
          <Upload
            accept=".xlsx,.xls"
            showUploadList={false}
            beforeUpload={async (file) => {
              setImporting(true);
              try {
                const result = await importStoreCollectionStores(file);
                if (result.code !== 0) {
                  message.error(result.message);
                  return false;
                }
                const currentStoreIds = formRef.current?.getFieldValue('storeIds') || [];
                const nextStoreIds = Array.from(new Set([...currentStoreIds, ...(result.data || []).map((item) => item.storeId)]));
                formRef.current?.setFieldsValue({ storeIds: nextStoreIds });
                message.success(`已导入 ${result.data?.length || 0} 个门店`);
              } finally {
                setImporting(false);
              }
              return false;
            }}
          >
            <Button icon={<ImportOutlined />} loading={importing}>
              导入门店ID
            </Button>
          </Upload>
        </Space>
      </ModalForm>
    </PageContainer>
  );
}
