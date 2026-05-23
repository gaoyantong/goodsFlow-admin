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
import { listGoods, listStores } from '@/services/base';
import { deleteFlowTask, FlowTaskRecord, listFlowTasks, saveFlowTask } from '@/services/flow';

const loadGoodsOptions = async (params?: { keyWords?: string }) => {
  const keyword = params?.keyWords;
  const result = await listGoods({
    current: 1,
    pageSize: 100,
    genericName: keyword,
  });
  return (result.data || []).map((item) => ({
    label: `${item.goodsId} ${item.genericName} ${item.specification}`,
    value: item.goodsId,
  }));
};

const loadStoreOptions = async (params?: { keyWords?: string }) => {
  const keyword = params?.keyWords;
  const result = await listStores({
    current: 1,
    pageSize: 100,
    storeName: keyword,
  });
  return (result.data || []).map((item) => ({
    label: `${item.storeId} ${item.storeName}`,
    value: item.storeId,
  }));
};

export default function FlowTaskPage() {
  const actionRef = useRef<ActionType>();
  const [open, setOpen] = useState(false);

  const columns: ProColumns<FlowTaskRecord>[] = [
    { title: '任务编号', dataIndex: 'taskNo', search: false },
    {
      title: '货品ID',
      dataIndex: 'goodsId',
      valueType: 'select',
      request: loadGoodsOptions,
      fieldProps: {
        showSearch: true,
        filterOption: false,
      },
    },
    { title: '待配送数量', dataIndex: 'pendingDeliveryQty', search: false },
    { title: '配送开始日期', dataIndex: 'deliveryStartDate', valueType: 'date', search: false },
    { title: '配送截止日期', dataIndex: 'deliveryEndDate', valueType: 'date', search: false },
    { title: '单笔零售最大数量', dataIndex: 'maxRetailQtyPerOrder', search: false },
    { title: '生成零售天数', dataIndex: 'retailDays', search: false },
    { title: '批号', dataIndex: 'batchNo' },
    { title: '有效期', dataIndex: 'expiryDate', valueType: 'date', search: false },
    {
      title: '状态',
      dataIndex: 'status',
      valueEnum: {
        GENERATED: { text: '已生成', status: 'Success' },
        PENDING: { text: '待处理', status: 'Default' },
      },
    },
    {
      title: '操作',
      valueType: 'option',
      width: 220,
      render: (_, record) => [
        <a key="inbound" onClick={() => history.push(`/flow/inbound?taskId=${record.id}`)}>
          入库数据
        </a>,
        <a key="retail" onClick={() => history.push(`/flow/retail?taskId=${record.id}`)}>
          零售数据
        </a>,
        <Popconfirm
          key="delete"
          title="确认删除该录入记录及生成的数据？"
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
        toolBarRender={() => [
          <Button key="create" type="primary" icon={<PlusOutlined />} onClick={() => setOpen(true)}>
            新增出入库记录
          </Button>,
        ]}
      />
      <ModalForm<FlowTaskRecord>
        title="新增出入库记录"
        open={open}
        modalProps={{ destroyOnClose: true, onCancel: () => setOpen(false) }}
        onFinish={async (values) => {
          const result = await saveFlowTask(values);
          if (result.code !== 0) {
            message.error(result.message);
            return false;
          }
          message.success('已生成配送入库和零售数据');
          setOpen(false);
          actionRef.current?.reload();
          return true;
        }}
      >
        <ProFormSelect
          name="goodsId"
          label="货品ID"
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
