import { PlusOutlined } from '@ant-design/icons';
import {
  ModalForm,
  PageContainer,
  ProColumns,
  ProFormDatePicker,
  ProFormDigit,
  ProFormSelect,
  ProFormText,
  ProTable,
} from '@ant-design/pro-components';
import type { ActionType } from '@ant-design/pro-components';
import { Button, message, Popconfirm } from 'antd';
import { history } from '@umijs/max';
import { useRef, useState } from 'react';
import { deleteFlowTask, FlowTaskRecord, listFlowTasks, saveFlowTask } from '@/services/flow';
import { tablePagination } from '@/utils/pagination';
import { loadGoodsOptions, loadStoreOptions, loadTaskNoOptions } from '../taskOptions';

const getDateValue = (value?: string) => {
  if (!value) return undefined;
  const time = new Date(value).getTime();
  return Number.isNaN(time) ? undefined : time;
};

const getDateRangeDays = (start?: string, end?: string) => {
  const startTime = getDateValue(start);
  const endTime = getDateValue(end);
  if (startTime === undefined || endTime === undefined) return undefined;
  return Math.floor((endTime - startTime) / 86400000) + 1;
};

export default function FlowTaskPage() {
  const actionRef = useRef<ActionType>();
  const [open, setOpen] = useState(false);

  const columns: ProColumns<FlowTaskRecord>[] = [
    {
      title: '任务编号',
      dataIndex: 'taskNo',
      valueType: 'select',
      order: 30,
      request: loadTaskNoOptions,
      width: 180,
      ellipsis: true,
      fieldProps: {
        showSearch: true,
        filterOption: false,
      },
    },
    {
      title: '货品',
      dataIndex: 'goodsId',
      valueType: 'select',
      order: 29,
      request: loadGoodsOptions,
      width: 220,
      ellipsis: true,
      fieldProps: {
        showSearch: true,
        filterOption: false,
      },
    },
    { title: '待配送数量', dataIndex: 'pendingDeliveryQty', search: false, width: 130, align: 'right' },
    { title: '配送开始日期', dataIndex: 'deliveryStartDate', valueType: 'date', search: false, width: 140 },
    { title: '配送截止日期', dataIndex: 'deliveryEndDate', valueType: 'date', search: false, width: 140 },
    { title: '单笔零售最大数量', dataIndex: 'maxRetailQtyPerOrder', search: false, width: 170, align: 'right' },
    { title: '生成零售天数', dataIndex: 'retailDays', search: false, width: 140, align: 'right' },
    { title: '批号', dataIndex: 'batchNo', order: 28, width: 140, ellipsis: true },
    { title: '有效期', dataIndex: 'expiryDate', valueType: 'date', search: false, width: 120 },
    {
      title: '操作',
      valueType: 'option',
      width: 220,
      fixed: 'right',
      render: (_, record) => [
        <a key="inbound" onClick={() => history.push(`/flow/inbound?taskId=${record.id}&taskNo=${encodeURIComponent(record.taskNo || '')}`)}>
          入库数据
        </a>,
        <a key="retail" onClick={() => history.push(`/flow/retail?taskId=${record.id}&taskNo=${encodeURIComponent(record.taskNo || '')}`)}>
          零售数据
        </a>,
        <Popconfirm
          key="delete"
          title="确认删除该药品录入记录及生成的数据？"
          onConfirm={async () => {
            const result = await deleteFlowTask(record.id!);
            result.code === 0 ? message.success('已删除') : message.error(result.message);
            actionRef.current?.reload();
          }}
        >
          <a>删除</a>
        </Popconfirm>,
      ],
    },
  ];

  return (
    <PageContainer>
      <ProTable<FlowTaskRecord>
        rowKey="id"
        actionRef={actionRef}
        columns={columns}
        request={async (params) => {
          const result = await listFlowTasks(params);
          return { data: result.data, total: result.total, success: result.code === 0 };
        }}
        scroll={{ x: 1500 }}
        form={{ syncToUrl: true }}
        pagination={tablePagination}
        toolBarRender={() => [
          <Button key="create" type="primary" icon={<PlusOutlined />} onClick={() => setOpen(true)}>
            新增药品录入
          </Button>,
        ]}
      />
      <ModalForm<FlowTaskRecord>
        title="新增药品录入"
        open={open}
        modalProps={{ destroyOnClose: true, onCancel: () => setOpen(false) }}
        onFinish={async (values) => {
          const rangeDays = getDateRangeDays(values.deliveryStartDate, values.deliveryEndDate);
          if (rangeDays !== undefined && rangeDays < 1) {
            message.warning('配送开始日期不能晚于配送截止日期');
            return false;
          }
          const result = await saveFlowTask(values);
          if (result.code !== 0) {
            message.error(result.message);
            return false;
          }
          message.success('已生成入库和零售数据');
          setOpen(false);
          actionRef.current?.reload();
          return true;
        }}
      >
        <ProFormSelect
          name="goodsId"
          label="货品"
          request={loadGoodsOptions}
          fieldProps={{
            showSearch: true,
            filterOption: false,
          }}
          rules={[{ required: true, message: '请选择货品' }]}
        />
        <ProFormDigit name="pendingDeliveryQty" label="待配送数量" min={1} rules={[{ required: true }]} />
        <ProFormDatePicker name="deliveryStartDate" label="配送开始日期" rules={[{ required: true }]} />
        <ProFormDatePicker name="deliveryEndDate" label="配送截止日期" rules={[{ required: true }]} />
        <ProFormDigit name="maxRetailQtyPerOrder" label="单笔零售最大数量" min={1} rules={[{ required: true }]} />
        <ProFormDigit name="retailDays" label="生成零售天数" min={1} rules={[{ required: true }]} />
        <ProFormText name="batchNo" label="批号" rules={[{ required: true }]} />
        <ProFormDatePicker name="expiryDate" label="有效期" rules={[{ required: true }]} />
        <ProFormSelect
          name="storeIds"
          label="指定门店"
          mode="multiple"
          request={loadStoreOptions}
          fieldProps={{
            showSearch: true,
            filterOption: false,
          }}
          tooltip="不选择时默认使用全部门店"
        />
      </ModalForm>
    </PageContainer>
  );
}
