import { DownloadOutlined } from '@ant-design/icons';
import {
  ModalForm,
  PageContainer,
  ProColumns,
  ProFormDatePicker,
  ProFormDateRangePicker,
  ProTable,
} from '@ant-design/pro-components';
import { useLocation } from '@umijs/max';
import { Button, message, Table } from 'antd';
import { useState } from 'react';
import { downloadBlob } from '@/services/base';
import { exportRetailOutbound, listRetailOutbound, RetailOutboundRecord } from '@/services/flow';
import { tablePagination } from '@/utils/pagination';
import { loadGoodsOptions, loadStoreOptions, loadTaskNoOptions } from '../taskOptions';

const monthValue = (value: any) => {
  if (!value) {
    return undefined;
  }
  if (typeof value === 'string') {
    const match = value.match(/^(\d{4})年(\d{1,2})月$/);
    if (match) {
      return `${match[1]}-${match[2].padStart(2, '0')}`;
    }
    return value.slice(0, 7);
  }
  return value.format?.('YYYY-MM');
};

const dateValue = (value: any) => {
  if (!value) {
    return undefined;
  }
  return typeof value === 'string' ? value : value.format?.('YYYY-MM-DD');
};

const chineseMonth = (exportMonth: string) => {
  const names = ['一', '二', '三', '四', '五', '六', '七', '八', '九', '十', '十一', '十二'];
  const month = Number(exportMonth.slice(5, 7));
  return names[month - 1] || String(month);
};

const retailMonthFilename = (exportMonth: string) => `${chineseMonth(exportMonth)}月康每乐纯销流向.xlsx`;
const retailRangeFilename = (start: string, end: string) => `${start}_${end}月康每乐纯销流向.xlsx`;

const formatStore = (record: RetailOutboundRecord) => [record.storeId, record.storeName].filter(Boolean).join(' ');
const formatGoods = (record: RetailOutboundRecord) => [record.goodsId, record.genericName].filter(Boolean).join(' ');

export default function RetailOutboundPage() {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const taskId = searchParams.get('taskId') || undefined;
  const taskNo = searchParams.get('taskNo') || undefined;
  const [monthOpen, setMonthOpen] = useState(false);
  const [dateRangeOpen, setDateRangeOpen] = useState(false);
  const [excludeBatchNo, setExcludeBatchNo] = useState(false);

  const columns: ProColumns<RetailOutboundRecord>[] = [
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
      hideInTable: true,
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
      title: '货品',
      dataIndex: 'genericName',
      search: false,
      width: 280,
      ellipsis: true,
      renderText: (_, record) => formatGoods(record),
    },
    { title: '规格', dataIndex: 'specification', search: false, width: 140, ellipsis: true },
    { title: '生产厂商', dataIndex: 'manufacturer', search: false, width: 240, ellipsis: true },
    { title: '货品单位', dataIndex: 'unit', search: false, width: 96, ellipsis: true },
    { title: '批号', dataIndex: 'batchNo', width: 120, ellipsis: true },
    { title: '出库数量', dataIndex: 'outboundQty', search: false, width: 110, align: 'right' },
  ];

  return (
    <PageContainer>
      <ProTable<RetailOutboundRecord>
        rowKey="id"
        columns={columns}
        params={{ taskId, taskNo }}
        form={{ initialValues: { taskNo }, syncToUrl: true }}
        request={async (params, sort) => {
          const { businessDateRange, ...rest } = params;
          const result = await listRetailOutbound({
            ...rest,
            businessDateStart: Array.isArray(businessDateRange) ? businessDateRange[0] : undefined,
            businessDateEnd: Array.isArray(businessDateRange) ? businessDateRange[1] : undefined,
            businessDateSort: sort?.businessDate || 'descend',
          });
          return { data: result.data, total: result.total, success: result.code === 0 };
        }}
        pagination={tablePagination}
        summary={(pageData) => {
          const total = pageData.reduce((sum, item) => sum + (Number(item.outboundQty) || 0), 0);
          return (
            <Table.Summary.Row>
              <Table.Summary.Cell index={0} colSpan={6}>
                合计数量
              </Table.Summary.Cell>
              <Table.Summary.Cell index={6} />
              <Table.Summary.Cell index={7} align="right">{total}</Table.Summary.Cell>
            </Table.Summary.Row>
          );
        }}
        toolBarRender={() => [
          <Button
            key="dateRangeExport"
            icon={<DownloadOutlined />}
            onClick={() => setDateRangeOpen(true)}
          >
            日期范围导出
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
        scroll={{ x: 1340 }}
      />
      <ModalForm<{ exportMonth: any }>
        title={excludeBatchNo ? '按月导出零售数据无批号' : '按月导出零售数据'}
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
          const blob = await exportRetailOutbound({ exportMonth, excludeBatchNo });
          downloadBlob(blob, retailMonthFilename(exportMonth));
          setMonthOpen(false);
          setExcludeBatchNo(false);
          return true;
        }}
      >
        <ProFormDatePicker
          name="exportMonth"
          label="月份"
          fieldProps={{ picker: 'month', format: 'YYYY年M月' }}
          valueFormat="YYYY-MM"
          rules={[{ required: true, message: '请选择导出月份' }]}
        />
      </ModalForm>
      <ModalForm<{ exportDateRange: any[] }>
        title="日期范围导出零售数据"
        open={dateRangeOpen}
        modalProps={{ destroyOnClose: true, onCancel: () => setDateRangeOpen(false) }}
        onFinish={async (values) => {
          const range = values.exportDateRange || [];
          const start = dateValue(range[0]);
          const end = dateValue(range[1]);
          if (!start || !end) {
            message.warning('请选择导出日期范围');
            return false;
          }
          const blob = await exportRetailOutbound({ businessDateStart: start, businessDateEnd: end });
          downloadBlob(blob, retailRangeFilename(start, end));
          setDateRangeOpen(false);
          return true;
        }}
      >
        <ProFormDateRangePicker
          name="exportDateRange"
          label="业务日期"
          rules={[{ required: true, message: '请选择导出日期范围' }]}
        />
      </ModalForm>
    </PageContainer>
  );
}
