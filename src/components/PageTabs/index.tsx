import { history, useLocation } from '@umijs/max';
import { Tabs } from 'antd';
import { useEffect, useMemo, useState } from 'react';

type PageTab = {
  key: string;
  label: string;
  url: string;
};

const STORAGE_KEY = 'goodsflow.open.tabs';

const pageTitles: Record<string, string> = {
  '/dashboard': '工作台',
  '/base/goods': '货品资料',
  '/base/store': '门店资料',
  '/flow/task': '药品录入',
  '/flow/inbound': '入库数据',
  '/flow/retail': '零售数据',
  '/sys/resource': '资源管理',
  '/sys/role': '角色管理',
  '/sys/user': '管理员',
  '/sys/constant': '常量管理',
  '/sys/dict': '字典管理',
  '/info': '个人信息',
};

const readTabs = () => {
  try {
    const tabs = JSON.parse(sessionStorage.getItem(STORAGE_KEY) || '[]');
    if (!Array.isArray(tabs)) return [];
    const map = new Map<string, PageTab>();
    tabs.forEach((item) => {
      if (!item?.key) return;
      const url = item.url || item.key;
      const key = url.split('?')[0];
      map.set(key, { key, label: item.label || pageTitles[key] || '页面', url });
    });
    return Array.from(map.values());
  } catch {
    return [];
  }
};

const writeTabs = (tabs: PageTab[]) => {
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(tabs));
};

export default function PageTabs({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const currentKey = location.pathname;
  const currentUrl = `${location.pathname}${location.search || ''}`;
  const currentTitle = pageTitles[location.pathname] || '页面';
  const [tabs, setTabs] = useState<PageTab[]>(() => readTabs());

  useEffect(() => {
    if (location.pathname === '/login') {
      return;
    }
    setTabs((prev) => {
      const next = prev.some((item) => item.key === currentKey)
        ? prev.map((item) => (item.key === currentKey ? { ...item, label: currentTitle, url: currentUrl } : item))
        : [...prev, { key: currentKey, label: currentTitle, url: currentUrl }];
      writeTabs(next);
      return next;
    });
  }, [currentKey, currentTitle, currentUrl, location.pathname]);

  const activeKey = useMemo(() => {
    if (tabs.some((item) => item.key === currentKey)) {
      return currentKey;
    }
    return tabs[0]?.key;
  }, [currentKey, tabs]);

  if (location.pathname === '/login') {
    return <>{children}</>;
  }

  return (
    <>
      <div style={{ background: '#fff', borderBottom: '1px solid #f0f0f0', padding: '6px 16px 0' }}>
        <Tabs
          hideAdd
          type="editable-card"
          activeKey={activeKey}
          items={tabs.map((item) => ({ key: item.key, label: item.label, closable: item.key !== '/dashboard' }))}
          onChange={(key) => {
            const target = tabs.find((item) => item.key === key);
            history.push(target?.url || key);
          }}
          onEdit={(targetKey, action) => {
            if (action !== 'remove' || typeof targetKey !== 'string') {
              return;
            }
            setTabs((prev) => {
              const next = prev.filter((item) => item.key !== targetKey);
              writeTabs(next);
              if (targetKey === currentKey) {
                const target = next[next.length - 1];
                history.push(target?.url || '/dashboard');
              }
              return next;
            });
          }}
        />
      </div>
      {children}
    </>
  );
}
