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
import { Button, Drawer, message, Popconfirm, Space, Spin, Tree } from 'antd';
import { useEffect, useRef, useState } from 'react';
import {
  allocateRoleResources,
  checkedRoleResources,
  deleteRole,
  listRoles,
  roleResources,
  RoleRecord,
  saveRole,
} from '@/services/system';

function ResourceDrawer({ roleId, onClose }: { roleId?: string; onClose: () => void }) {
  const [treeData, setTreeData] = useState<any[]>();
  const [checkedKeys, setCheckedKeys] = useState<string[]>([]);

  useEffect(() => {
    if (!roleId) return;
    Promise.all([roleResources(), checkedRoleResources(roleId)]).then(([tree, checked]) => {
      setTreeData(tree.data || []);
      setCheckedKeys(checked.data || []);
    });
  }, [roleId]);

  return (
    <Drawer
      title="分配资源"
      open={!!roleId}
      destroyOnClose
      onClose={onClose}
      footer={(
        <Space style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <Button onClick={onClose}>取消</Button>
          <Button
            type="primary"
            onClick={async () => {
              const result = await allocateRoleResources(roleId!, checkedKeys);
              result.code === 0 ? message.success('已分配') : message.error(result.message);
              if (result.code === 0) onClose();
            }}
          >
            确定
          </Button>
        </Space>
      )}
    >
      {treeData ? (
        <Tree checkable treeData={treeData} checkedKeys={checkedKeys} onCheck={(keys) => setCheckedKeys(keys as string[])} />
      ) : <Spin />}
    </Drawer>
  );
}

export default function RolePage() {
  const actionRef = useRef<ActionType>();
  const [editing, setEditing] = useState<RoleRecord>();
  const [open, setOpen] = useState(false);
  const [roleId, setRoleId] = useState<string>();

  const columns: ProColumns<RoleRecord>[] = [
    { title: '角色名称', dataIndex: 'name' },
    { title: '角色编码', dataIndex: 'roleCode', search: false },
    { title: '排序', dataIndex: 'sortedNum', search: false, width: 80 },
    {
      title: '操作',
      valueType: 'option',
      width: 220,
      render: (_, record) => [
        <a key="edit" onClick={() => { setEditing(record); setOpen(true); }}>编辑</a>,
        <a key="resources" onClick={() => setRoleId(record.id)}>分配资源</a>,
        <Popconfirm
          key="delete"
          title="确认删除该角色？"
          onConfirm={async () => {
            const result = await deleteRole(record.id!);
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
      <ProTable<RoleRecord>
        rowKey="id"
        actionRef={actionRef}
        columns={columns}
        request={async (params) => {
          const result = await listRoles(params);
          return { data: result.data, total: result.total, success: result.code === 0 };
        }}
        toolBarRender={() => [
          <Button key="create" type="primary" icon={<PlusOutlined />} onClick={() => { setEditing(undefined); setOpen(true); }}>新增</Button>,
        ]}
      />
      <ModalForm<RoleRecord>
        title={editing?.id ? '编辑角色' : '新增角色'}
        open={open}
        initialValues={editing}
        modalProps={{ destroyOnClose: true, onCancel: () => setOpen(false) }}
        onFinish={async (values) => {
          const result = await saveRole({ ...values, id: editing?.id });
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
        <ProFormText name="name" label="角色名称" rules={[{ required: true }]} />
        <ProFormText name="roleCode" label="角色编码" rules={[{ required: true }]} />
        <ProFormDigit name="sortedNum" label="排序" min={1} />
      </ModalForm>
      <ResourceDrawer roleId={roleId} onClose={() => setRoleId(undefined)} />
    </PageContainer>
  );
}
