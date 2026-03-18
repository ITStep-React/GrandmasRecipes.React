import ReactDOM from 'react-dom/client';

import App from '@/app/App';
// import { StoreProvider } from '@/app/providers/StoreProvider';
import { I18nProvider } from '@/app/providers/I18nProvider';

import '@/app/styles/style.scss';

ReactDOM.createRoot(document.getElementById('root')).render(
  // <StoreProvider>
    <I18nProvider>
      <App />
    </I18nProvider>
  // </StoreProvider>
);