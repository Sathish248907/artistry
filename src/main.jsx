import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { hydrateGoldRates } from './data/hydrateGoldRates';
import './index.css';

// Gold rates come first: prices all over the storefront are built from them, some while their module loads.
// With no backend configured this resolves at once and the built-in rates are used.
hydrateGoldRates()
  .catch(() => false)
  .then(() => import('./App'))
  .then(({ default: App }) => {
    createRoot(document.getElementById('root')).render(
      <StrictMode>
        <App />
      </StrictMode>,
    );
  });
