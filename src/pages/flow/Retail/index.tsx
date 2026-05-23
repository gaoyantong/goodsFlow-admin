import { PageContainer, ProColumns, ProTable } from '@ant-design/pro-components';
import { useLocation } from '@umijs/max';
import { listRetailOutbound, RetailOutboundRecord } from '@/services/flow';

export default function RetailOutboundPage() {
  const location = useLocation();
  const taskId = new URLSearchParams(location.search).get('taskId') || undefined;

  const columns: ProColumns<RetailOutboundRecord>[] = [
    { title: '业务日期', dataIndex: 'businessDate', valueType: 'date' },
    { title: '门店ID', dataIndex: 'storeId' },
    { title: '门店', dataIndex: 'storeName' },
    { title: '货品ID', dataIndex: 'goodsId' },
    { title: '通用名', dataIndex: 'genericName', search: false },
    { title: '规格', dataIndex: 'specification', search: false },
    { title: '生产厂商', dataIndex: 'manufacturer', search: false },
    { title: '货品单位', dataIndex: 'unit', search: false, width: 96 },
    { title: '批号', dataIndex: 'batchNo' },
    { title: '出库数量', dataIndex: 'outboundQty', search: false },
  ];

  return (
    <PageContainer>
      <ProTable<RetailOutboundRecord>
        rowKey="id"
        columns={columns}
        params={{ taskId }}
        request={async (params) => {
          const result = await listRetailOutbound(params);
          return { data: result.data, total: result.total, success: result.code === 0 };
        }}
        scroll={{ x: 1300 }}
      />
    </PageContainer>
  );
}
