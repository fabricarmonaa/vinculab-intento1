import { useAuth } from '../../auth/context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { Header } from '../../../components/Header';

export const CompanyDashboard = () => {
    const { user, logout } = useAuth(); // Obtenemos datos del usuario y función logout
    const navigate = useNavigate();

    // Función para cerrar sesión 
    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <div className="min-h-screen bg-slate-50">
            {/* Header compartido con navegación */}
            <Header />

            {/* Contenido Principal */}
            <main className="max-w-7xl mx-auto py-10 px-4 sm:px-6 lg:px-8 animate-fade-in">

                {/* Encabezado del Dashboard */}
                <header className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
                    <div>
                        <h2 className="text-2xl font-bold text-slate-800">Gestión de Talentos</h2>
                        <p className="text-slate-500 mt-1">Administratus búsquedas y encontrá a los mejores técnicos.</p>
                    </div>
                    {/* Botón rápido para editar perfil */}
                    <Link
                        to="/company/perfil/editar"
                        className="inline-flex items-center justify-center px-4 py-2 bg-white border border-slate-300 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50 hover:text-blue-600 transition-colors shadow-sm"
                    >
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                        Editar Perfil
                    </Link>
                </header>

                {/* Grid de Opciones Principales */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                    {/* Card 1: Crear Propuesta */}
                    <Link
                        to="/company/crear-propuesta"
                        className="group relative bg-white p-8 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:border-blue-300 hover:-translate-y-1 transition-all duration-300 overflow-hidden"
                    >
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                            <svg className="w-24 h-24 text-blue-600" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" /></svg>
                        </div>

                        <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center mb-4 shadow-sm group-hover:bg-blue-600 group-hover:text-white transition-colors">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                        </div>

                        <h3 className="text-xl font-bold text-slate-800 mb-2 group-hover:text-blue-600 transition-colors">Publicar Nueva Oferta</h3>
                        <p className="text-slate-600 text-sm leading-relaxed">
                            Creá una nueva búsqueda laboral para los estudiantes. Definí los requisitos y la especialidad técnica necesaria.
                        </p>
                    </Link>

                    {/* Card 2: Ver Mis Propuestas */}
                    <Link
                        to="/company/mis-propuestas"
                        className="group relative bg-white p-8 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:border-emerald-300 hover:-translate-y-1 transition-all duration-300 overflow-hidden"
                    >
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                            <svg className="w-24 h-24 text-emerald-600" fill="currentColor" viewBox="0 0 20 20"><path d="M7 3a1 1 0 000 2h6a1 1 0 100-2H7zM4 7a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zM2 11a2 2 0 012-2h12a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2v-4z" /></svg>
                        </div>

                        <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center mb-4 shadow-sm group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg>
                        </div>

                        <h3 className="text-xl font-bold text-slate-800 mb-2 group-hover:text-emerald-600 transition-colors">Mis Búsquedas Activas</h3>
                        <p className="text-slate-600 text-sm leading-relaxed">
                            Administrá tus ofertas publicadas, editá detalles y revisá los perfiles de los estudiantes postulados.
                        </p>
                    </Link>
                </div>
            </main>
        </div>
    );
};
