import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Admin } from './pages/Admin';
import './index.css';

createRoot(document.getElementById('admin-root')!).render(
  <StrictMode>
    <Admin />
  </StrictMode>,
);
