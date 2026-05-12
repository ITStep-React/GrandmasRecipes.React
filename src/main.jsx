import ReactDOM from 'react-dom/client';

import App from '@/app/App';
import { StoreProvider } from '@/app/providers/StoreProvider';
import { I18nProvider } from '@/app/providers/I18nProvider';
import store from './app/store/store';
import { bootstrapAuth } from '@/features/authSlice';
import { BrowserRouter } from "react-router";

import '@/app/styles/style.scss';

store.dispatch(bootstrapAuth());

ReactDOM.createRoot(document.getElementById('root')).render(
    <StoreProvider>
        <I18nProvider>
            <BrowserRouter>
                <App />
            </BrowserRouter>
        </I18nProvider>
    </StoreProvider>
);