import { PlusOutlined } from '@ant-design/icons';
import {
  ModalForm,
  PageContainer,
  ProColumns,
  ProFormDigit,
  ProFormText,
  ProTable,
} from '@ant-design/pro-components';
import type { ActionType } from '@ant-design/pro-components';
import { Button, message, Popconfirm } from 'antd';
import { useRef, useState } from 'react';
import { deleteDict, DictRecord, listDicts, saveDict } from '@/services/system';

const toTree = (rows: DictRecord[]) => {
  const map = new Map(rows.map((row) => [row.code, { ...row, children: [] as DictRecord[] }]));
  const roots: DictRecord[] = [];
  map.forEach((row) => {
    const parent = row.parent ? map.get(row.parent) : undefined;
    if (parent) parent.children?.push(row);
    else roots.push(row);
  });
  return roots;
};

export default function DictPage() {
  const actionRef = useRef<ActionType>();
  const [editing, setEditing] = useState<DictRecord>();
  const [open, setOpen] = useState(false);

  const columns: ProColumns<DictRecord>[] = [
    { title: '字典编码', dataIndex: 'code', width: 180, ellipsis: true },
    { title: '中文名称', dataIndex: 'nameZhcn', width: 180, ellipsis: true },
    { title: '英文名称', dataIndex: 'nameEnus', search: false, width: 180, ellipsis: true },
    { title: '上级编码', dataIndex: 'parent', width: 180, ellipsis: true },
    { title: '值', dataIndex: 'vals', search: false, width: 220, ellipsis: true },
    { title: '备注', dataIndex: 'remarks', search: false, width: 260, ellipsis: true },
    {
      title: '操作',
      valueType: 'option',
      width: 150,
      render: (_, record) => [
        <a key="edit" onClick={() => { setEditing(record); setOpen(true); }}>编辑</a>,
        <Popconfirm
          key="delete"
          title="确认删除该字典？"
          onConfirm={async () => {
            const result = await deleteDict(record.id!);
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
      <ProTable<DictRecord>
        rowKey="id"
        actionRef={actionRef}
        columns={columns}
        pagination={false}
        request={async (params) => {
          const result = await listDicts(params);
          return { data: toTree(result.data || []), success: result.code === 0 };
        }}
        scroll={{ x: 1350 }}
        toolBarRender={() => [
          <Button key="create" type="primary" icon={<PlusOutlined />} onClick={() => { setEditing(undefined); setOpen(true); }}>新增</Button>,
        ]}
      />
      <ModalForm<DictRecord>
        title={editing?.id ? '编辑字典' : '新增字典'}
        open={open}
        initialValues={editing}
        modalProps={{ destroyOnClose: true, onCancel: () => setOpen(false) }}
        onFinish={async (values) => {
          const result = await saveDict({ ...values, id: editing?.id });
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
        <ProFormText name="code" label="字典编码" rules={[{ required: true }]} />
        <ProFormText name="nameZhcn" label="中文名称" />
        <ProFormText name="nameEnus" label="英文名称" />
        <ProFormText name="nameZhtw" label="繁体名称" />
        <ProFormText name="parent" label="上级编码" />
        <ProFormText name="vals" label="值" />
        <ProFormText name="remarks" label="备注" />
        <ProFormDigit name="sortedNum" label="排序" min={1} />
      </ModalForm>
    </PageContainer>
  );
}
