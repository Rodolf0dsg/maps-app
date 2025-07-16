import { MapPage } from "./pages/MapPage"
import { SocketProvider } from './context/SocketProvider';

export const MapsApp = () => {
    return (
        <SocketProvider>
            <MapPage />
        </SocketProvider>
    );
};