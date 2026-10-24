import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { PLATFORM_CONTRACT_VERSION } from '@portal/platform-contract';
import type { PlatformContract } from '@portal/platform-contract';
import { RemoteRoot } from '../exposes/RemoteRoot';

// Minimal local platform: platform-runtime targets React 19, the legacy app only needs the contract types.
const noop = () => {};
const platform: PlatformContract = {
  contractVersion: PLATFORM_CONTRACT_VERSION,
  auth: {
    getAccessToken: async () => 'standalone',
    getAccount: () => ({ id: 'dev', username: 'dev@local', displayName: 'Local developer' }),
    subscribe: () => noop,
    requestInteraction: async () => {},
  },
  env: { name: 'local', hostOrigin: window.location.origin },
  events: { emit: noop, subscribe: () => noop },
  telemetry: { logError: console.error, trackEvent: noop },
  locale: { language: 'en', subscribe: () => noop },
};

const container = document.getElementById('root');
if (!container) {
  throw new Error('#root not found');
}
createRoot(container).render(
  <StrictMode>
    <RemoteRoot platform={platform} />
  </StrictMode>,
);
