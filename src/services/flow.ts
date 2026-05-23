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
  status?: string;
  generatedAt?: number;
  storeIds?: string[];
};

export type DeliveryInboundRecord = {
  id?: string;
  taskId: string;
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

export async function listDeliveryInbound(params: Record<string, unknown>) {
  return request<ApiResponse<DeliveryInboundRecord[]>>('/api/flow/inbound/list', {
    method: 'POST',
    data: params,
  });
}

export async function listRetailOutbound(params: Record<string, unknown>) {
  return request<ApiResponse<RetailOutboundRecord[]>>('/api/flow/retail/list', {
    method: 'POST',
    data: params,
  });
}
