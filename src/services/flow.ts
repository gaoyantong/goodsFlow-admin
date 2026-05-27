import { request } from '@umijs/max';
import type { ApiResponse } from './base';

export type FlowTaskRecord = {
  id?: string;
  taskNo?: string;
  goodsId: string;
  pendingDeliveryQty: number;
  deliveryStartDate: string;
  deliveryEndDate: string;
  maxRetailQtyPerOrder: number;
  retailDays: number;
  batchNo: string;
  expiryDate: string;
  storeScopeType?: string;
  storeCollectionId?: string;
  storeCollectionIds?: string[];
  status?: string;
  generatedAt?: number;
  storeIds?: string[];
};

export type DeliveryInboundRecord = {
  id?: string;
  taskId: string;
  taskNo?: string;
  businessDate: string;
  storeId: string;
  storeName: string;
  goodsId: string;
  genericName: string;
  specification: string;
  manufacturer: string;
  unit: string;
  batchNo: string;
  expiryDate: string;
  inboundQty: number;
};

export type RetailOutboundRecord = {
  id?: string;
  taskId: string;
  taskNo?: string;
  inboundId: string;
  businessDate: string;
  storeId: string;
  storeName: string;
  goodsId: string;
  genericName: string;
  specification: string;
  manufacturer: string;
  unit: string;
  batchNo: string;
  outboundQty: number;
};

export type StoreCollectionStoreRecord = {
  id?: string;
  collectionDbId?: string;
  collectionId?: string;
  storeId: string;
  storeName: string;
};

export type StoreCollectionRecord = {
  id?: string;
  collectionId?: string;
  collectionName: string;
  stores?: StoreCollectionStoreRecord[];
};

export async function listFlowTasks(params: Record<string, unknown>) {
  return request<ApiResponse<FlowTaskRecord[]>>('/api/flow/task/list', {
    method: 'POST',
    data: params,
  });
}

export async function saveFlowTask(data: FlowTaskRecord) {
  return request<ApiResponse<FlowTaskRecord>>('/api/flow/task/modify', {
    method: 'POST',
    data,
  });
}

export async function deleteFlowTask(id: string) {
  return request<ApiResponse<void>>('/api/flow/task/delete', {
    method: 'POST',
    data: { id },
  });
}

export async function deleteFlowTaskBatch(ids: string[]) {
  return request<ApiResponse<void>>('/api/flow/task/deleteBatch', {
    method: 'POST',
    data: ids,
  });
}

export async function listDeliveryInbound(params: Record<string, unknown>) {
  return request<ApiResponse<DeliveryInboundRecord[]>>('/api/flow/inbound/list', {
    method: 'POST',
    data: params,
  });
}

export async function exportDeliveryInbound(params: Record<string, unknown>) {
  return request<Blob>('/api/flow/inbound/export', {
    method: 'POST',
    data: params,
    responseType: 'blob',
  });
}

export async function listRetailOutbound(params: Record<string, unknown>) {
  return request<ApiResponse<RetailOutboundRecord[]>>('/api/flow/retail/list', {
    method: 'POST',
    data: params,
  });
}

export async function exportRetailOutbound(params: Record<string, unknown>) {
  return request<Blob>('/api/flow/retail/export', {
    method: 'POST',
    data: params,
    responseType: 'blob',
  });
}

export async function listStoreCollections(params: Record<string, unknown>) {
  return request<ApiResponse<StoreCollectionRecord[]>>('/api/flow/storeCollection/list', {
    method: 'POST',
    data: params,
  });
}

export async function saveStoreCollection(data: StoreCollectionRecord) {
  return request<ApiResponse<StoreCollectionRecord>>('/api/flow/storeCollection/modify', {
    method: 'POST',
    data,
  });
}

export async function deleteStoreCollection(id: string) {
  return request<ApiResponse<void>>('/api/flow/storeCollection/delete', {
    method: 'POST',
    data: { id },
  });
}

export async function importStoreCollectionStores(file: File) {
  const formData = new FormData();
  formData.append('file', file);
  return request<ApiResponse<StoreCollectionStoreRecord[]>>('/api/flow/storeCollection/importStores', {
    method: 'POST',
    data: formData,
    requestType: 'form',
  });
}

export async function storeCollectionTemplate() {
  return request<Blob>('/api/flow/storeCollection/template', {
    method: 'GET',
    responseType: 'blob',
  });
}
