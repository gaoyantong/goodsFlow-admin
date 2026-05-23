import { request } from '@umijs/max';

export type ApiResponse<T> = {
  code: number;
  message: string;
  data: T;
  total?: number;
};

export type GoodsRecord = {
  id?: string;
  goodsId: string;
  genericName: string;
  manufacturer: string;
  specification: string;
  unit: string;
};

export type StoreRecord = {
  id?: string;
  storeId: string;
  storeName: string;
};

export async function listGoods(params: Record<string, unknown>) {
  return request<ApiResponse<GoodsRecord[]>>('/api/base/goods/list', {
    method: 'POST',
    data: params,
  });
}

export async function saveGoods(data: GoodsRecord) {
  return request<ApiResponse<void>>('/api/base/goods/modify', {
    method: 'POST',
    data,
  });
}

export async function deleteGoods(id: string) {
  return request<ApiResponse<void>>('/api/base/goods/delete', {
    method: 'POST',
    data: { id },
  });
}

export async function importGoods(file: File) {
  const data = new FormData();
  data.append('file', file);
  return request<ApiResponse<string>>('/api/base/goods/import', {
    method: 'POST',
    data,
  });
}

export async function exportGoods(params: Record<string, unknown>) {
  return request<Blob>('/api/base/goods/export', {
    method: 'POST',
    data: params,
    responseType: 'blob',
  });
}

export async function goodsTemplate() {
  return request<Blob>('/api/base/goods/template', {
    method: 'GET',
    responseType: 'blob',
  });
}

export async function listStores(params: Record<string, unknown>) {
  return request<ApiResponse<StoreRecord[]>>('/api/base/store/list', {
    method: 'POST',
    data: params,
  });
}

export async function saveStore(data: StoreRecord) {
  return request<ApiResponse<void>>('/api/base/store/modify', {
    method: 'POST',
    data,
  });
}

export async function deleteStore(id: string) {
  return request<ApiResponse<void>>('/api/base/store/delete', {
    method: 'POST',
    data: { id },
  });
}

export async function importStores(file: File) {
  const data = new FormData();
  data.append('file', file);
  return request<ApiResponse<string>>('/api/base/store/import', {
    method: 'POST',
    data,
  });
}

export async function exportStores(params: Record<string, unknown>) {
  return request<Blob>('/api/base/store/export', {
    method: 'POST',
    data: params,
    responseType: 'blob',
  });
}

export async function storeTemplate() {
  return request<Blob>('/api/base/store/template', {
    method: 'GET',
    responseType: 'blob',
  });
}

export function downloadBlob(blob: Blob, filename: string) {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
}
