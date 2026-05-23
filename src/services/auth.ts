import { request } from '@umijs/max';
import type { ApiResponse } from './base';

export type CurrentUser = {
  id: string;
  name?: string;
  loginName: string;
  workNum?: string;
  email?: string;
  description?: string;
  roleCode?: string;
  roleName?: string;
};

export type LoginParams = {
  loginName: string;
  password: string;
};

export type ProfileParams = {
  name?: string;
  email?: string;
  description?: string;
  password?: string;
};

export type AuthorizedMenu = {
  id: string;
  name: string;
  icon?: string;
  path: string;
  children?: AuthorizedMenu[];
};

export const login = (data: LoginParams) =>
  request<ApiResponse<CurrentUser>>('/api/sys/admin/login', { method: 'POST', data });

export const logout = () =>
  request<ApiResponse<void>>('/api/sys/admin/logout', { method: 'POST' });

export const currentUser = () =>
  request<ApiResponse<CurrentUser>>('/api/sys/admin/info', { method: 'GET' });

export const authorizedMenus = () =>
  request<ApiResponse<AuthorizedMenu[]>>('/api/sys/admin/menus', { method: 'GET' });

export const updateProfile = (data: ProfileParams) =>
  request<ApiResponse<void>>('/api/sys/admin/update', { method: 'POST', data });
