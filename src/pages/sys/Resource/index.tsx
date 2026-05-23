import { PlusOutlined } from '@ant-design/icons';
import {
  ModalForm,
  PageContainer,
  ProColumns,
  ProFormDigit,
  ProFormSelect,
  ProFormText,
  ProTable,
} from '@ant-design/pro-components';
import type { ActionType } from '@ant-design/pro-components';
import { Button, message, Popconfirm } from 'antd';
import { useRef, useState } from 'react';
import {
  deleteResource,
  listResources,
  ResourceRecord,
  saveResource,
} from '@/services/system';

const toTree = (rows: ResourceRecord[]) => {
  const map = new Map(rows.map((row) => [row.id, { ...row, children: [] as ResourceRecord[] }]));
  const roots: ResourceRecord[] = [];
  map.forEach((row) => {
    const parent = row.parentId ? map.get(row.parentId) : undefined;
    if (parent) parent.children?.push(row);
    else roots.push(row);
  });
  return roots;
};

export default function ResourcePage() {
  const actionRef = useRef<ActionType>();
  const [rows, setRows] = useState<ResourceRecord[]>([]);
  const [editing, setEditing] = useState<ResourceRecord>();
  const [open, setOpen] = useState(false);

  const columns: ProColumns<ResourceRecord>[] = [
    { title: '资源名称', dataIndex: 'name' },
    { title: '中文名称', dataIndex: 'nameCh', search: false },
    { title: '图标', dataIndex: 'icon', search: false },
    { title: '路径', dataIndex: 'path' },
    { title: '类型', dataIndex: 'type', search: false, width: 90 },
    { title: '排序', dataIndex: 'sortedNum', search: false, width: 80 },
    { title: '说明', dataIndex: 'description', search: false },
    {
      title: '操作',
      valueType: 'option',
      width: 150,
      render: (_, record) => [
        <a key="edit" onClick={() => { setEditing(record); setOpen(true); }}>编辑</a>,
        <Popconfirm
          key="delete"
          title="确认删除该资源？"
          onConfirm={async () => {
            const result = await deleteResource(record.id!);
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
      <ProTable<ResourceRecord>
        rowKey="id"
        actionRef={actionRef}
        columns={columns}
        pagination={false}
        request={async (params) => {
          const result = await listResources(params);
          setRows(result.data || []);
          return { data: toTree(result.data || []), success: result.code === 0 };
        }}
        toolBarRender={() => [
          <Button key="create" type="primary" icon={<PlusOutlined />} onClick={() => { setEditing(undefined); setOpen(true); }}>
            新增
          </Button>,
        ]}
      />
      <ModalForm<ResourceRecord>
        title={editing?.id ? '编辑资源' : '新增资源'}
        open={open}
        initialValues={editing}
        modalProps={{ destroyOnClose: true, onCancel: () => setOpen(false) }}
        onFinish={async (values) => {
          const result = await saveResource({ ...values, id: editing?.id });
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
        <ProFormSelect
          name="parentId"
          label="上级资源"
          options={rows.filter((row) => row.id !== editing?.id).map((row) => ({ label: row.nameCh || row.name, value: row.id }))}
        />
        <ProFormSelect name="type" label="类型" initialValue="MENU" options={[{ label: '菜单', value: 'MENU' }, { label: '按钮', value: 'BUTTON' }]} />
        <ProFormText name="name" label="资源名称" rules={[{ required: true }]} />
        <ProFormText name="nameCh" label="中文名称" />
        <ProFormText name="icon" label="图标" />
        <ProFormText name="path" label="路径" />
        <ProFormDigit name="sortedNum" label="排序" min={1} />
        <ProFormText name="description" label="说明" />
      </ModalForm>
    </PageContainer>
  );
}
