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
import { deleteGoods, GoodsRecord, listGoods, saveGoods } from '@/services/base';

export default function GoodsPage() {
  const actionRef = useRef<ActionType>();
  const [editing, setEditing] = useState<GoodsRecord>();
  const [open, setOpen] = useState(false);

  const columns: ProColumns<GoodsRecord>[] = [
    { title: '货品ID', dataIndex: 'goodsId' },
    { title: '通用名', dataIndex: 'genericName' },
    { title: '生产厂商', dataIndex: 'manufacturer', search: false },
    { title: '规格', dataIndex: 'specification', search: false },
    { title: '单位', dataIndex: 'unit', search: false, width: 96 },
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
          title="确认删除该货品资料？"
          onConfirm={async () => {
            const result = await deleteGoods(record.id!);
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
      <ProTable<GoodsRecord>
        rowKey="id"
        actionRef={actionRef}
        columns={columns}
        request={async (params) => {
          const result = await listGoods(params);
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
    </PageContainer>
  );
}
