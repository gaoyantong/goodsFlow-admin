import { PlusOutlined } from '@ant-design/icons';
import {
  ModalForm,
  PageContainer,
  ProColumns,
  ProFormText,
  ProTable,
} from '@ant-design/pro-components';
import type { ActionType } from '@ant-design/pro-components';
import { Button, message, Popconfirm } from 'antd';
import { useRef, useState } from 'react';
import { deleteStore, listStores, saveStore, StoreRecord } from '@/services/base';

export default function StorePage() {
  const actionRef = useRef<ActionType>();
  const [editing, setEditing] = useState<StoreRecord>();
  const [open, setOpen] = useState(false);

  const columns: ProColumns<StoreRecord>[] = [
    { title: '门店ID', dataIndex: 'storeId' },
    { title: '门店', dataIndex: 'storeName' },
    {
      title: '操作',
      valueType: 'option',
      width: 160,
      render: (_, record) => [
        <a key="edit" onClick={() => { setEditing(record); setOpen(true); }}>
          编辑
        </a>,
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
        </Popconfirm>,
      ],
    },
  ];

  return (
    <PageContainer>
      <ProTable<StoreRecord>
        rowKey="id"
        actionRef={actionRef}
        columns={columns}
        request={async (params) => {
          const result = await listStores(params);
          return { data: result.data, total: result.total, success: result.code === 0 };
        }}
        toolBarRender={() => [
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
    </PageContainer>
  );
}
