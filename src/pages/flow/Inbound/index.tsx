import { DownloadOutlined } from '@ant-design/icons';
import { ModalForm, PageContainer, ProColumns, ProFormDatePicker, ProTable } from '@ant-design/pro-components';
import { useLocation } from '@umijs/max';
import { Button, message, Table } from 'antd';
import type { Key } from 'react';
import { useState } from 'react';
import { downloadBlob } from '@/services/base';
import { DeliveryInboundRecord, exportDeliveryInbound, listDeliveryInbound } from '@/services/flow';
import { tablePagination } from '@/utils/pagination';
import { loadGoodsOptions, loadStoreOptions, loadTaskNoOptions } from '../taskOptions';

const monthValue = (value: any) => {
  if (!value) {
    return undefined;
  }
  const formatted = typeof value === 'string' ? value : value.format?.('YYYY-MM');
  return formatted?.slice(0, 7);
};

const inboundFilename = (exportMonth: string) => {
  const month = Number(exportMonth.slice(5, 7));
  return `中国中药${month}月.xlsx`;
};

const formatStore = (record: DeliveryInboundRecord) => [record.storeId, record.storeName].filter(Boolean).join(' ');
const formatGoods = (record: DeliveryInboundRecord) => [record.goodsId, record.genericName].filter(Boolean).join(' ');

export default function DeliveryInboundPage() {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const taskId = searchParams.get('taskId') || undefined;
  const taskNo = searchParams.get('taskNo') || undefined;
  const [selectedRowKeys, setSelectedRowKeys] = useState<Key[]>([]);
  const [monthOpen, setMonthOpen] = useState(false);
  const [excludeBatchNo, setExcludeBatchNo] = useState(false);

  const columns: ProColumns<DeliveryInboundRecord>[] = [
    {
      title: '任务编号',
      dataIndex: 'taskNo',
      valueType: 'select',
      hideInTable: true,
      order: 30,
      request: loadTaskNoOptions,
      fieldProps: { showSearch: true, filterOption: false },
    },
    {
      title: '门店',
      dataIndex: 'storeId',
      valueType: 'select',
      hideInTable: true,
      order: 29,
      request: loadStoreOptions,
      fieldProps: { showSearch: true, filterOption: false },
    },
    {
      title: '货品',
      dataIndex: 'goodsId',
      valueType: 'select',
      order: 28,
      request: loadGoodsOptions,
      fieldProps: { showSearch: true, filterOption: false },
    },
    { title: '业务日期', dataIndex: 'businessDateRange', valueType: 'dateRange', order: 27, hideInTable: true },
    {
      title: '业务日期',
      dataIndex: 'businessDate',
      valueType: 'date',
      search: false,
      sorter: true,
      defaultSortOrder: 'descend',
      width: 120,
    },
    {
      title: '门店',
      dataIndex: 'storeName',
      search: false,
      width: 280,
      ellipsis: true,
      renderText: (_, record) => formatStore(record),
    },
    {
      title: '药品',
      dataIndex: 'genericName',
      search: false,
      width: 280,
      ellipsis: true,
      renderText: (_, record) => formatGoods(record),
    },
    { title: '批号', dataIndex: 'batchNo', width: 120, ellipsis: true },
    { title: '有效期', dataIndex: 'expiryDate', valueType: 'date', search: false, width: 120 },
    { title: '入库数量', dataIndex: 'inboundQty', search: false, width: 110, align: 'right' },
  ];

  return (
    <PageContainer>
      <ProTable<DeliveryInboundRecord>
        rowKey="id"
        columns={columns}
        params={{ taskId, taskNo }}
        form={{ initialValues: { taskNo }, syncToUrl: true }}
        rowSelection={{
          selectedRowKeys,
          preserveSelectedRowKeys: true,
          onChange: (keys) => setSelectedRowKeys(keys),
        }}
        request={async (params, sort) => {
          const { businessDateRange, ...rest } = params;
          const result = await listDeliveryInbound({
            ...rest,
            businessDateStart: Array.isArray(businessDateRange) ? businessDateRange[0] : undefined,
            businessDateEnd: Array.isArray(businessDateRange) ? businessDateRange[1] : undefined,
            businessDateSort: sort?.businessDate || 'descend',
          });
          return { data: result.data, total: result.total, success: result.code === 0 };
        }}
        pagination={tablePagination}
        summary={(pageData) => {
          const total = pageData.reduce((sum, item) => sum + (Number(item.inboundQty) || 0), 0);
          return (
            <Table.Summary.Row>
              <Table.Summary.Cell index={0} />
              <Table.Summary.Cell index={1} colSpan={4}>
                合计数量
              </Table.Summary.Cell>
              <Table.Summary.Cell index={5} />
              <Table.Summary.Cell index={6} />
              <Table.Summary.Cell index={7} align="right">{total}</Table.Summary.Cell>
            </Table.Summary.Row>
          );
        }}
        toolBarRender={() => [
          <Button
            key="selectedExport"
            icon={<DownloadOutlined />}
            onClick={async () => {
              if (!selectedRowKeys.length) {
                message.warning('请先勾选要导出的入库数据');
                return;
              }
              const blob = await exportDeliveryInbound({ ids: selectedRowKeys.map(String) });
              downloadBlob(blob, '入库数据.xlsx');
            }}
          >
            导出勾选
          </Button>,
          <Button
            key="monthExport"
            icon={<DownloadOutlined />}
            onClick={() => {
              setExcludeBatchNo(false);
              setMonthOpen(true);
            }}
          >
            按月导出
          </Button>,
          <Button
            key="monthExportWithoutBatchNo"
            icon={<DownloadOutlined />}
            onClick={() => {
              setExcludeBatchNo(true);
              setMonthOpen(true);
            }}
          >
            按月导出无批号
          </Button>,
        ]}
        scroll={{ x: 1080 }}
      />
      <ModalForm<{ exportMonth: any }>
        title={excludeBatchNo ? '按月导出入库数据无批号' : '按月导出入库数据'}
        open={monthOpen}
        modalProps={{
          destroyOnClose: true,
          onCancel: () => {
            setMonthOpen(false);
            setExcludeBatchNo(false);
          },
        }}
        onFinish={async (values) => {
          const exportMonth = monthValue(values.exportMonth);
          if (!exportMonth) {
            message.warning('请选择导出月份');
            return false;
          }
          const blob = await exportDeliveryInbound({ exportMonth, excludeBatchNo });
          downloadBlob(blob, inboundFilename(exportMonth));
          setMonthOpen(false);
          setExcludeBatchNo(false);
          return true;
        }}
      >
        <ProFormDatePicker
          name="exportMonth"
          label="月份"
          fieldProps={{ picker: 'month' }}
          rules={[{ required: true, message: '请选择导出月份' }]}
        />
      </ModalForm>
    </PageContainer>
  );
}
