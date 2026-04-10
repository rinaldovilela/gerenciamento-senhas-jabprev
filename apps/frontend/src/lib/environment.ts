// Frontend configuration
export const config = {
  apiUrl: import.meta.env.VITE_API_URL || 'http://localhost:3001',
  wsUrl: import.meta.env.VITE_WS_URL || 'ws://localhost:3001',
  environment: (import.meta.env.MODE || 'development') as 'development' | 'staging' | 'production',
  debug: import.meta.env.DEV,
};

export default config;
