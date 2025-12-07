import { Outlet } from 'react-router-dom';
import { Header } from '../components/Header';

export const PublicLayout = () => {
    return (
        <div className="min-h-screen bg-gray-50">
            {/* 1. El Header que acabamos de crear */}
            <Header />

            {/* 2. Aquí se renderizará la página (HomePage, LoginPage, etc.) */}
            <main>
                <Outlet />
            </main>

            {/* (Aquí podría ir un Footer en el futuro) */}
        </div>
    );
};