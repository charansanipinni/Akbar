import { defineConfig } from '@playwright/test';
export default defineConfig({ testDir: './tests', use: { baseURL: 'http://127.0.0.1:5175', headless: true }, reporter: 'list', webServer: { command: 'npm.cmd run dev -- --port 5175', url: 'http://127.0.0.1:5175', reuseExistingServer: true }, projects: [{ name: 'desktop', use: { viewport: { width: 1440, height: 1000 } } }, { name: 'mobile', use: { viewport: { width: 375, height: 812 }, isMobile: true, hasTouch: true } }] });

