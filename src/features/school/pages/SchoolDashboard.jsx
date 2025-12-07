import { useAuth } from '../../auth/context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { Header } from '../../../components/Header';

export const SchoolDashboard = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    // Estilo base de tarjeta
    const cardClass = "group relative bg-white p-8 rounded-2xl border border-slate-200 shadow-sm flex flex-col h-full transition-all duration-300 hover:shadow-md hover:-translate-y-1 cursor-pointer hover:border-purple-300";

    return (
        <div className="min-h-screen bg-slate-50 font-sans">
            <Header />

            {/* Contenido Principal */}
            <main className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8 animate-fade-in">

                <div className="mb-10 flex justify-between items-end">
                    <div>
                        <h2 className="text-3xl font-bold text-slate-800 mb-2">Gestión Educativa</h2>
                        <p className="text-slate-500">Seleccioná una opción para comenzar.</p>
                    </div>
                    <Link
                        to="/school/perfil/editar"
                        className="px-4 py-2 bg-white text-purple-600 border border-purple-200 rounded-lg text-sm font-medium hover:bg-purple-50 transition-colors shadow-sm"
                    >
                        Editar Perfil
                    </Link>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl">

                    {/* OPCIÓN 1: Verificar Alumnos (Pendientes) */}
                    <Link to="/school/verificar" className={cardClass}>
                        <div className="w-14 h-14 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center mb-6 transition-colors group-hover:bg-purple-600 group-hover:text-white">
                            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        </div>

                        <h3 className="text-xl font-bold text-slate-800 mb-2 group-hover:text-purple-600 transition-colors">
                            Solicitudes Pendientes
                        </h3>
                        <p className="text-slate-600 text-sm leading-relaxed mb-6 flex-grow">
                            Validar identidad de nuevos estudiantes que solicitan acceso.
                        </p>

                        <div className="mt-auto pt-4 border-t border-slate-100 w-full flex justify-between items-center">
                            <span className="text-xs font-semibold text-purple-600 bg-purple-50 px-2 py-1 rounded">Acción Requerida</span>
                            <span className="text-sm font-medium text-purple-600 flex items-center group-hover:underline">
                                Ir a la cola <span className="ml-1">&rarr;</span>
                            </span>
                        </div>
                    </Link>

                    {/* OPCIÓN 2: Ver Nómina (Verificados) */}
                    <Link to="/school/alumnos" className={cardClass}>
                        <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mb-6 transition-colors group-hover:bg-emerald-600 group-hover:text-white">
                            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                        </div>

                        <h3 className="text-xl font-bold text-slate-800 mb-2 group-hover:text-emerald-600 transition-colors">
                            Nómina de Egresados
                        </h3>
                        <p className="text-slate-600 text-sm leading-relaxed mb-6 flex-grow">
                            Consultar el listado de alumnos que ya han sido verificados y aprobados.
                        </p>

                        <div className="mt-auto pt-4 border-t border-slate-100 w-full flex justify-end">
                            <span className="text-sm font-medium text-emerald-600 flex items-center group-hover:underline">
                                Ver listado <span className="ml-1">&rarr;</span>
                            </span>
                        </div>
                    </Link>

                </div>
            </main>
        </div>
    );
};