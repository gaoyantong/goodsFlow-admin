import { request } from '@umijs/max';
import type { ApiResponse } from './base';

export type CommonRecord = { id?: string; sortedNum?: number };

export type ResourceRecord = CommonRecord & {
  name: string;
  nameCh?: string;
  icon?: string;
  path?: string;
  parentId?: string;
  type?: string;
  description?: string;
  children?: ResourceRecord[];
};

export type RoleRecord = CommonRecord & { name: string; roleCode: string };

export type UserRecord = CommonRecord & {
  name?: string;
  loginName: string;
  password?: string;
  workNum?: string;
  email?: string;
  sex?: string;
  description?: string;
  role?: string;
  roleName?: string;
};

export type ConstantRecord = CommonRecord & {
  code: string;
  name?: string;
  parent?: string;
  vals?: string;
  remarks?: string;
  children?: ConstantRecord[];
};

export type DictRecord = CommonRecord & {
  code: string;
  nameEnus?: string;
  nameZhcn?: string;
  nameZhtw?: string;
  parent?: string;
  vals?: string;
  remarks?: string;
  children?: DictRecord[];
};

const post = <T>(url: string, data: unknown) => request<ApiResponse<T>>(url, { method: 'POST', data });
const get = <T>(url: string, params: Record<string, unknown>) =>
  request<ApiResponse<T>>(url, { method: 'GET', params });

export const listResources = (data: Record<string, unknown>) => post<ResourceRecord[]>('/api/sys/resource/list', data);
export const resourceInfo = (id: string) => get<ResourceRecord>('/api/sys/resource/info', { id });
export const saveResource = (data: ResourceRecord) => post<void>('/api/sys/resource/modify', data);
export const deleteResource = (id: string) => post<void>('/api/sys/resource/delete', { id });

export const listRoles = (data: Record<string, unknown>) => post<RoleRecord[]>('/api/sys/role/list', data);
export const allRoles = () => get<RoleRecord[]>('/api/sys/role/allList', {});
export const roleInfo = (id: string) => get<RoleRecord>('/api/sys/role/info', { id });
export const saveRole = (data: RoleRecord) => post<void>('/api/sys/role/modify', data);
export const deleteRole = (id: string) => post<void>('/api/sys/role/delete', { id });
export const roleResources = () => post<any[]>('/api/sys/role/resources', {});
export const checkedRoleResources = (id: string) => post<string[]>('/api/sys/role/getCheckedResources', { id });
export const allocateRoleResources = (roleId: string, resourcesId: string[]) =>
  post<void>('/api/sys/role/allocate', { roleId, resourcesId });

export const listUsers = (data: Record<string, unknown>) => post<UserRecord[]>('/api/sys/user/list', data);
export const userInfo = (id: string) => get<UserRecord>('/api/sys/user/info', { id });
export const userRoles = () => get<RoleRecord[]>('/api/sys/user/roles', {});
export const saveUser = (data: UserRecord) => post<void>('/api/sys/user/modify', data);
export const deleteUser = (id: string) => post<void>('/api/sys/user/delete', { id });

export const listConstants = (data: Record<string, unknown>) => post<ConstantRecord[]>('/api/sys/constant/list', data);
export const constantInfo = (id: string) => get<ConstantRecord>('/api/sys/constant/info', { id });
export const saveConstant = (data: ConstantRecord) => post<void>('/api/sys/constant/modify', data);
export const deleteConstant = (id: string) => post<void>('/api/sys/constant/delete', { id });

export const listDicts = (data: Record<string, unknown>) => post<DictRecord[]>('/api/sys/dict/list', data);
export const dictInfo = (id: string) => get<DictRecord>('/api/sys/dict/info', { id });
export const saveDict = (data: DictRecord) => post<void>('/api/sys/dict/modify', data);
export const deleteDict = (id: string) => post<void>('/api/sys/dict/delete', { id });
