import { defineConfig } from '@apps-in-toss/web-framework/config';

export default defineConfig({
  appName: 'run', // 앱인토스 콘솔에서 설정한 앱 이름
  brand: {
    displayName: '달리기',
    primaryColor: '#3182F6',
    icon: '',
  },
  web: {
    host: 'localhost',
    port: 3000,
    commands: {
      dev: 'vite',
      build: 'vite build',
    },
  },
  permissions: [],
});
