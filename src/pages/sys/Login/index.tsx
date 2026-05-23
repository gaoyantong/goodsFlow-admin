import { LockOutlined, UserOutlined } from '@ant-design/icons';
import { ProForm, ProFormText } from '@ant-design/pro-components';
import { history, useModel } from '@umijs/max';
import { message } from 'antd';
import { useState } from 'react';
import { authorizedMenus, login } from '@/services/auth';
import styles from './index.less';

export default function LoginPage() {
  const { setInitialState } = (useModel as any)('@@initialState');
  const [submitting, setSubmitting] = useState(false);

  return (
    <main className={styles.page}>
      <section className={styles.content}>
        <div className={styles.top}>
          <div className={styles.brand}>GoodsFlow</div>
          <div className={styles.subtitle}>后台管理系统</div>
        </div>
        <div className={styles.main}>
        <ProForm
          submitter={{
            searchConfig: { submitText: '登录' },
            submitButtonProps: { loading: submitting, size: 'large', style: { width: '100%' } },
            render: (_, buttons) => buttons.pop(),
          }}
          onFinish={async (values) => {
            setSubmitting(true);
            try {
              const result = await login(values as { loginName: string; password: string });
              if (result.code !== 0) {
                message.error(result.message);
                return false;
              }
              let menuData: any[] = [];
              try {
                const menus = await authorizedMenus();
                menuData = menus.code === 0 ? menus.data : [];
              } catch {
                menuData = [];
              }
              await setInitialState((state: any) => ({
                ...state,
                currentUser: result.data,
                menus: menuData,
              }));
              message.success('登录成功');
              setTimeout(() => history.replace('/dashboard'), 0);
              return true;
            } finally {
              setSubmitting(false);
            }
          }}
        >
          <ProFormText
            name="loginName"
            fieldProps={{ size: 'large', prefix: <UserOutlined /> }}
            placeholder="登录账号"
            rules={[{ required: true, message: '请输入登录账号' }]}
          />
          <ProFormText.Password
            name="password"
            fieldProps={{ size: 'large', prefix: <LockOutlined /> }}
            placeholder="密码"
            rules={[{ required: true, message: '请输入密码' }]}
          />
        </ProForm>
        </div>
      </section>
    </main>
  );
}
