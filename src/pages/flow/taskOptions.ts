import { listGoods, listStores } from '@/services/base';
import { listFlowTasks } from '@/services/flow';

export const loadTaskNoOptions = async (params?: { keyWords?: string }) => {
  const result = await listFlowTasks({
    current: 1,
    pageSize: 100,
    taskNo: params?.keyWords,
  });

  return (result.data || []).map((item) => ({
    label: item.taskNo || item.id,
    value: item.taskNo,
  }));
};

export const loadStoreOptions = async (params?: { keyWords?: string }) => {
  const result = await listStores({
    current: 1,
    pageSize: 100,
    storeName: params?.keyWords,
  });

  return (result.data || []).map((item) => ({
    label: `${item.storeId} ${item.storeName}`,
    value: item.storeId,
  }));
};

export const loadGoodsOptions = async (params?: { keyWords?: string }) => {
  const result = await listGoods({
    current: 1,
    pageSize: 100,
    genericName: params?.keyWords,
  });

  return (result.data || []).map((item) => ({
    label: `${item.goodsId} ${item.genericName}`,
    value: item.goodsId,
  }));
};
