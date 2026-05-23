import { defineConfig } from '@umijs/max';
import defaultSettings from './defaultSettings';
import routes from './routes';

export default defineConfig({
  antd: {},
  hash: true,
  layout: {
    locale: false,
    ...defaultSettings,
  },
  model: {},
  initialState: {},
  request: {},
  routes,
  npmClient: 'npm',
  proxy: {
    '/api': {
      target: 'http://127.0.0.1:8080',
      changeOrigin: true,
      pathRewrite: { '^/api': '' },
    },
  },
});
