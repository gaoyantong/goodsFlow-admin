import {
  PageContainer,
  ProForm,
  ProFormText,
  ProFormTextArea,
} from '@ant-design/pro-components';
import { message } from 'antd';
import { useModel } from '@umijs/max';
import { ProfileParams, updateProfile } from '@/services/auth';

export default function InfoPage() {
  const { initialState, setInitialState } = (useModel as any)('@@initialState');
  const user = initialState?.currentUser;

  return (
    <PageContainer title="个人信息">
      <ProForm<ProfileParams>
        initialValues={user}
        onFinish={async (values) => {
          const result = await updateProfile(values);
          if (result.code !== 0) {
            message.error(result.message);
            return false;
          }
          setInitialState((state: any) => ({ ...state, currentUser: state?.currentUser ? { ...state.currentUser, ...values } : undefined }));
          message.success('已保存');
          return true;
        }}
      >
        <ProFormText name="name" label="姓名" />
        <ProFormText name="email" label="邮箱" />
        <ProFormText.Password name="password" label="新密码" rules={[{ min: 6, max: 28 }]} tooltip="留空则不修改密码" />
        <ProFormTextArea name="description" label="说明" />
      </ProForm>
    </PageContainer>
  );
}
