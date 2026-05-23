import { LogoutOutlined, UserOutlined } from '@ant-design/icons';
import type { RunTimeLayoutConfig } from '@umijs/max';
import { history } from '@umijs/max';
import { Avatar, Button, Dropdown, message, Space } from 'antd';
import type { MenuProps } from 'antd';
import type { AuthorizedMenu, CurrentUser } from '@/services/auth';
import { authorizedMenus, currentUser, logout } from '@/services/auth';
import PageTabs from '@/components/PageTabs';

const loginPath = '/login';

export async function getInitialState(): Promise<{
  currentUser?: CurrentUser;
  menus?: AuthorizedMenu[];
  fetchCurrentUser: () => Promise<CurrentUser | undefined>;
}> {
  const fetchCurrentUser = async () => {
    try {
      const result = await currentUser();
      return result.code === 0 ? result.data : undefined;
    } catch {
      return undefined;
    }
  };
  const fetchMenus = async () => {
    try {
      const result = await authorizedMenus();
      return result.code === 0 ? result.data : [];
    } catch {
      return [];
    }
  };
  const current = history.location.pathname === loginPath ? undefined : await fetchCurrentUser();
  return {
    fetchCurrentUser,
    currentUser: current,
    menus: current ? await fetchMenus() : [],
  };
}

const authorizedPaths = (menus: AuthorizedMenu[] = []) => {
  const paths = new Set<string>();
  const visit = (items: AuthorizedMenu[]) => items.forEach((item) => {
    paths.add(item.path);
    if (item.children?.length) visit(item.children);
  });
  visit(menus);
  return paths;
};

export const layout: RunTimeLayoutConfig = ({ initialState, setInitialState }) => {
  const items: MenuProps['items'] = [
    { key: 'info', icon: <UserOutlined />, label: '个人信息' },
    { type: 'divider' },
    { key: 'logout', icon: <LogoutOutlined />, label: '退出登录' },
  ];
  const handleLogout = async () => {
    await logout();
    setInitialState((state: any) => ({ ...state, currentUser: undefined }));
    message.success('已退出');
    history.replace(loginPath);
  };

  return {
    pageTitleRender: false,
    avatarProps: false,
    childrenRender: (children) => <PageTabs>{children}</PageTabs>,
    rightContentRender: () => initialState?.currentUser ? (
      <Dropdown
        placement="bottomRight"
        menu={{
          items,
          onClick: ({ key }) => {
            if (key === 'info') history.push('/info');
            if (key === 'logout') handleLogout();
          },
        }}
      >
        <Button
          type="text"
          style={{
            alignItems: 'center',
            borderRadius: 6,
            display: 'inline-flex',
            height: 44,
            marginRight: 12,
            paddingInline: 10,
          }}
        >
          <Space size={8}>
            <Avatar size={28} icon={<UserOutlined />} />
            <span>{initialState.currentUser.name || initialState.currentUser.loginName}</span>
          </Space>
        </Button>
      </Dropdown>
    ) : <></>,
    onPageChange: () => {
      if (!initialState?.currentUser && history.location.pathname !== loginPath) {
        history.replace(loginPath);
      }
    },
    menuDataRender: (menuData) => {
      const paths = authorizedPaths(initialState?.menus);
      const filterMenus = (items: typeof menuData): typeof menuData => items
        .map((item) => ({
          ...item,
          children: item.children ? filterMenus(item.children) : item.children,
        }))
        .filter((item) => {
          if (!item.path || item.path === '/' || item.path === '/login' || item.path === '/info') return false;
          return paths.has(item.path);
        });
      return filterMenus(menuData);
    },
  };
};

export const request = {
  credentials: 'include' as const,
  errorConfig: {
    errorThrower: (res: any) => {
      if (res?.code !== 0) {
        const error: any = new Error(res?.message || '请求失败');
        error.name = 'BizError';
        error.info = res;
        throw error;
      }
    },
    errorHandler: (error: any) => {
      const status = error?.response?.status;
      if (status === 401) {
        message.warning('登录已过期，请重新登录');
        history.replace(loginPath);
        return;
      }
      message.error(error?.message || '请求失败');
    },
  },
};
