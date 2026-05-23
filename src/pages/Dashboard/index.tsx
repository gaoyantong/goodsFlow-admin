import { DatabaseOutlined, DeploymentUnitOutlined } from '@ant-design/icons';
import { PageContainer, ProCard, StatisticCard } from '@ant-design/pro-components';

export default function Dashboard() {
  return (
    <PageContainer>
      <ProCard split="vertical">
        <StatisticCard
          statistic={{
            title: '基础资料',
            value: '货品与门店',
            icon: <DatabaseOutlined />,
          }}
        />
        <StatisticCard
          statistic={{
            title: '流向处理',
            value: '配送与零售',
            icon: <DeploymentUnitOutlined />,
          }}
        />
      </ProCard>
    </PageContainer>
  );
}
