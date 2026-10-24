import React from 'react';
import ReactDOM from 'react-dom/client';
// Initialize i18n early
import './src/i18n/config';
import './index.css';
import App from './components/App';
import { UserProvider } from './contexts/UserContext';
import { LanguageProvider } from './contexts/LanguageContext';
import { TenantProvider } from './contexts/TenantContext';
import { DemoDataLoader } from './services/demoDataLoader';

// Seed realistic GCC Synthetic Enterprise Data on startup
DemoDataLoader.seedDemoData().catch(console.error);

import { RegionalComplianceProvider } from './contexts/RegionalComplianceContext';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <LanguageProvider>
      <UserProvider>
        <RegionalComplianceProvider>
          <TenantProvider>
            <App />
          </TenantProvider>
        </RegionalComplianceProvider>
      </UserProvider>
    </LanguageProvider>
  </React.StrictMode>
);

// Progressive Web App (PWA) Service Worker Lifecycle Management
if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
  const isDevHost = Boolean((import.meta as any).env?.DEV) || 
                    window.location.hostname.includes('localhost') || 
                    window.location.hostname.includes('ais-dev-') ||
                    window.location.hostname.includes('ais-pre-') ||
                    window.location.hostname.includes('run.app') ||
                    window.location.port === '3000' ||
                    window.location.port === '8080';

  if (isDevHost) {
    // In dev / preview environments, unregister service workers to avoid stale Vite chunk caching
    navigator.serviceWorker.getRegistrations().then((registrations) => {
      for (const registration of registrations) {
        registration.unregister();
      }
    });
    if ('caches' in window) {
      caches.keys().then((names) => {
        names.forEach((name) => caches.delete(name));
      });
    }
  } else {
    // Production Cloud Run / PWA mode
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js')
        .then((registration) => {
          console.log('[AD6 PWA] Service Worker registered successfully with scope:', registration.scope);
        })
        .catch((error) => {
          console.warn('[AD6 PWA] Service Worker registration failed:', error);
        });
    });
  }
}
