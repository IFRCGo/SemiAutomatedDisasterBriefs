import { AlertContainer, Container } from '@ifrc-go/ui';
import { Navigate, Route, Routes } from 'react-router-dom';

import { AlertProvider } from './AlertProvider';
import { CountryListPage } from '../pages/CountryListPage';
import { CountryPage } from '../pages/CountryPage';

export function App(): JSX.Element {
    return (
        <AlertProvider>
            <Container>
                <Routes>
                    <Route path="/" element={<CountryListPage />} />
                    <Route path="/country/:countryId" element={<CountryPage />} />
                    <Route path="*" element={<Navigate to="/" replace={true} />} />
                </Routes>
            </Container>
            <AlertContainer />
        </AlertProvider>
    );
}
