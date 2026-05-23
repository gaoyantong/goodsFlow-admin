export default [
  {
    path: '/login',
    layout: false,
    component: './sys/Login',
  },
  {
    name: '个人信息',
    path: '/info',
    hideInMenu: true,
    component: './sys/Info',
  },
  {
    path: '/',
    redirect: '/dashboard',
  },
  {
    name: '工作台',
    path: '/dashboard',
    icon: 'DashboardOutlined',
    component: './Dashboard',
  },
  {
    name: '基础数据',
    path: '/base',
    icon: 'DatabaseOutlined',
    routes: [
      {
        name: '货品资料',
        path: '/base/goods',
        component: './base/Goods',
      },
      {
        name: '门店资料',
        path: '/base/store',
        component: './base/Store',
      },
    ],
  },
  {
    name: '系统管理',
    path: '/sys',
    icon: 'SettingOutlined',
    routes: [
      { name: '资源管理', path: '/sys/resource', component: './sys/Resource' },
      { name: '角色管理', path: '/sys/role', component: './sys/Role' },
      { name: '管理员', path: '/sys/user', component: './sys/User' },
      { name: '常量管理', path: '/sys/constant', component: './sys/Constant' },
      { name: '字典管理', path: '/sys/dict', component: './sys/Dict' },
    ],
  },
];
