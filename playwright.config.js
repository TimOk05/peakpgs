const { defineConfig } = require('@playwright/test');
const os = require('os');
const path = require('path');

module.exports = defineConfig({
  testDir: './tests',
  outputDir: path.join(os.tmpdir(), 'peakpgs-playwright-results'),
  timeout: 30000,
  fullyParallel: true,
  use: {
    baseURL: 'http://127.0.0.1:4178',
    trace: 'retain-on-failure'
  },
  webServer: {
    command: 'node server.js',
    port: 4178,
    reuseExistingServer: true,
    timeout: 30000
  },
  reporter: [['list']]
});
