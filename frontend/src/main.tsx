import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import { LoaderProvider } from './hooks/Loader';

const container = document.getElementById('root');
const root = createRoot(container!);
root.render(
  <React.StrictMode>
    <LoaderProvider>

      <App />
    </LoaderProvider>
  </React.StrictMode>
);