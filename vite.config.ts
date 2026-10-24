import { createRemoteViteConfig } from '@portal-poc/vite-config';

/**
 * Legacy remote on React 18: shares nothing (`isolated`) — own React, router and styles, so the host detects a
 * different React instance and mounts it through MF Bridge. No React Compiler (React 18 app outside the singleton).
 */
export default createRemoteViteConfig({
  name: 'legacy',
  port: 5175,
  configUrl: import.meta.url,
  exposesDir: 'src/exposes',
  isolated: true,
  compiler: false,
});
