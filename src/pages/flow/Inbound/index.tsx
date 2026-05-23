import { PageContainer, ProColumns, ProTable } from '@ant-design/pro-components';
import { useLocation } from '@umijs/max';
import { DeliveryInboundRecord, listDeliveryInbound } from '@/services/flow';

export default function DeliveryInboundPage() {
  const location = useLocation();
  const taskId = new URLSearchParams(location.search).get('taskId') || undefined;

  const columns: ProColumns<DeliveryInboundRecord>[] = [
    { title: '业务日期', dataIndex: 'businessDate', valueType: 'date' },
    { title: '门店ID', dataIndex: 'storeId' },
    { title: '门店', dataIndex: 'storeName' },
    { title: '货品ID', dataIndex: 'goodsId' },
    { title: '通用名', dataIndex: 'genericName', search: false },
    { title: '规格', dataIndex: 'specification', search: false },
    { title: '生产厂商', dataIndex: 'manufacturer', search: false },
    { title: '货品单位', dataIndex: 'unit', search: false, width: 96 },
    { title: '批号', dataIndex: 'batchNo' },
    { title: '有效期', dataIndex: 'expiryDate', valueType: 'date', search: false },
    { title: '入库数量', dataIndex: 'inboundQty', search: false },
  ];

  return (
    <PageContainer>
      <ProTable<DeliveryInboundRecord>
        rowKey="id"
        columns={columns}
        params={{ taskId }}
        request={async (params) => {
          const result = await listDeliveryInbound(params);
          return { data: result.data, total: result.total, success: result.code === 0 };
        }}
        scroll={{ x: 1400 }}
      />
    </PageContainer>
  );
}
