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
  deleteUser,
  listUsers,
  saveUser,
  UserRecord,
  userRoles,
} from '@/services/system';
import { tablePagination } from '@/utils/pagination';

export default function UserPage() {
  const actionRef = useRef<ActionType>();
  const [editing, setEditing] = useState<UserRecord>();
  const [open, setOpen] = useState(false);

  const columns: ProColumns<UserRecord>[] = [
    { title: '工号', dataIndex: 'workNum', width: 140, ellipsis: true },
    { title: '姓名', dataIndex: 'name', width: 140, ellipsis: true },
    { title: '登录账号', dataIndex: 'loginName', width: 160, ellipsis: true },
    { title: '角色', dataIndex: 'roleName', search: false, width: 160, ellipsis: true },
    { title: '邮箱', dataIndex: 'email', search: false, width: 220, ellipsis: true },
    { title: '说明', dataIndex: 'description', search: false, width: 260, ellipsis: true },
    {
      title: '操作',
      valueType: 'option',
      width: 150,
      render: (_, record) => [
        <a key="edit" onClick={() => { setEditing(record); setOpen(true); }}>编辑</a>,
        <Popconfirm
          key="delete"
          title="确认删除该管理员？"
          onConfirm={async () => {
            const result = await deleteUser(record.id!);
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
      <ProTable<UserRecord>
        rowKey="id"
        actionRef={actionRef}
        columns={columns}
        request={async (params) => {
          const result = await listUsers(params);
          return { data: result.data, total: result.total, success: result.code === 0 };
        }}
        scroll={{ x: 1230 }}
        form={{ syncToUrl: true }}
        pagination={tablePagination}
        toolBarRender={() => [
          <Button key="create" type="primary" icon={<PlusOutlined />} onClick={() => { setEditing(undefined); setOpen(true); }}>
            新增
          </Button>,
        ]}
      />
      <ModalForm<UserRecord>
        title={editing?.id ? '编辑管理员' : '新增管理员'}
        open={open}
        initialValues={editing}
        modalProps={{ destroyOnClose: true, onCancel: () => setOpen(false) }}
        onFinish={async (values) => {
          const result = await saveUser({ ...values, id: editing?.id });
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
        <ProFormText name="workNum" label="工号" />
        <ProFormText name="name" label="姓名" />
        <ProFormText name="loginName" label="登录账号" rules={[{ required: true }]} />
        <ProFormText.Password
          name="password"
          label={editing?.id ? '新密码' : '密码'}
          fieldProps={{
            autoComplete: 'new-password',
            visibilityToggle: false,
          }}
          rules={editing?.id ? [] : [{ required: true }]}
        />
        <ProFormSelect
          name="role"
          label="角色"
          rules={[{ required: true }]}
          request={async () => {
            const result = await userRoles();
            return (result.data || []).map((role) => ({ label: role.name, value: role.id }));
          }}
        />
        <ProFormText name="email" label="邮箱" />
        <ProFormText name="description" label="说明" />
        <ProFormDigit name="sortedNum" label="排序" min={1} />
      </ModalForm>
    </PageContainer>
  );
}
