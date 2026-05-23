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
import {
  ConstantRecord,
  deleteConstant,
  listConstants,
  saveConstant,
} from '@/services/system';

const toTree = (rows: ConstantRecord[]) => {
  const map = new Map(rows.map((row) => [row.code, { ...row, children: [] as ConstantRecord[] }]));
  const roots: ConstantRecord[] = [];
  map.forEach((row) => {
    const parent = row.parent ? map.get(row.parent) : undefined;
    if (parent) parent.children?.push(row);
    else roots.push(row);
  });
  return roots;
};

export default function ConstantPage() {
  const actionRef = useRef<ActionType>();
  const [editing, setEditing] = useState<ConstantRecord>();
  const [open, setOpen] = useState(false);

  const columns: ProColumns<ConstantRecord>[] = [
    { title: '常量编码', dataIndex: 'code' },
    { title: '常量名称', dataIndex: 'name' },
    { title: '上级编码', dataIndex: 'parent' },
    { title: '值', dataIndex: 'vals', search: false, ellipsis: true },
    { title: '备注', dataIndex: 'remarks', search: false },
    {
      title: '操作',
      valueType: 'option',
      width: 150,
      render: (_, record) => [
        <a key="edit" onClick={() => { setEditing(record); setOpen(true); }}>编辑</a>,
        <Popconfirm
          key="delete"
          title="确认删除该常量？"
          onConfirm={async () => {
            const result = await deleteConstant(record.id!);
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
      <ProTable<ConstantRecord>
        rowKey="id"
        actionRef={actionRef}
        columns={columns}
        pagination={false}
        request={async (params) => {
          const result = await listConstants(params);
          return { data: toTree(result.data || []), success: result.code === 0 };
        }}
        toolBarRender={() => [
          <Button key="create" type="primary" icon={<PlusOutlined />} onClick={() => { setEditing(undefined); setOpen(true); }}>新增</Button>,
        ]}
      />
      <ModalForm<ConstantRecord>
        title={editing?.id ? '编辑常量' : '新增常量'}
        open={open}
        initialValues={editing}
        modalProps={{ destroyOnClose: true, onCancel: () => setOpen(false) }}
        onFinish={async (values) => {
          const result = await saveConstant({ ...values, id: editing?.id });
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
        <ProFormText name="code" label="常量编码" rules={[{ required: true }]} />
        <ProFormText name="name" label="常量名称" />
        <ProFormText name="parent" label="上级编码" />
        <ProFormText name="vals" label="值" />
        <ProFormText name="remarks" label="备注" />
        <ProFormDigit name="sortedNum" label="排序" min={1} />
      </ModalForm>
    </PageContainer>
  );
}
