import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

import { useAuth } from '../features/auth/context/AuthContext';
import { getJobs } from '../features/jobs/services/jobService';
import { JobCard } from '../features/jobs/components/JobCard';

export const HomePage = () => {
    const { user, token } = useAuth();
    const [jobs, setJobs] = useState([]); // Estado para guardar TODAS las ofertas
    const [visibleCount, setVisibleCount] = useState(6); // Cantidad de ofertas visibles
    const [loading, setLoading] = useState(true); // Estado de carga
    const [error, setError] = useState(null); // Estado de error

    useEffect(() => {
        const fetchJobs = async () => {
            try {
                const data = await getJobs();
                if (Array.isArray(data)) {
                    setJobs(data); // Guardamos TODAS las ofertas
                } else {
                    setJobs([]);
                }
            } catch (err) {
                console.error("Error cargando ofertas:", err);
                setError('No pudimos cargar las últimas propuestas. Intentá más tarde.');
            } finally {
                setLoading(false);
            }
        };

        fetchJobs();
    }, []);

    const handleLoadMore = () => {
        setVisibleCount(prev => prev + 6); // Mostramos 6 más
    };

    return (
        <div className="min-h-screen bg-slate-50 font-sans">


            {/* --- SECCIÓN HERO (La parte de arriba) --- */}
            {/* Contiene el título principal, la descripción y los accesos directos */}
            <div className="bg-white border-b border-slate-200">
                <div className="max-w-5xl mx-auto px-4 py-16 text-center">
                    <h1 className="text-4xl font-bold text-slate-800 mb-4">
                        Vinculacion Laboral
                    </h1>
                    <p className="text-lg text-slate-600 mb-10 max-w-2xl mx-auto">
                        Plataforma de vinculación laboral entre estudiantes técnicos y empresas profesionales.
                    </p>

                    {/* Cards centradas */}
                    <div className="flex flex-col md:flex-row justify-center gap-4">

                        {/* Card Estudiantes */}
                        <div className="p-6 w-full md:w-1/3 border border-slate-200 rounded-xl hover:border-blue-400 transition-colors bg-slate-50 text-left">
                            <h3 className="font-semibold text-slate-800 mb-1">Registrate</h3>
                            <p className="text-sm text-slate-500 mb-4">
                                Creá tu perfil profesional y postulate.
                            </p>
                            <Link
                                to="/register"
                                className="inline-flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors shadow-sm w-full"
                            >
                                Crear cuenta
                            </Link>
                        </div>

                        {/* Card Empresas */}
                        <div className="p-6 w-full md:w-1/3 border border-slate-200 rounded-xl hover:border-blue-400 transition-colors bg-slate-50 text-left">
                            <h3 className="font-semibold text-slate-800 mb-1">Empresas</h3>
                            <p className="text-sm text-slate-500 mb-4">
                                Publicá búsquedas laborales.
                            </p>
                            <Link
                                to="/login"
                                className="inline-flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors shadow-sm w-full"
                            >
                                Ingresar
                            </Link>
                        </div>

                    </div>
                </div>
            </div>


            {/* --- SECCIÓN DE OFERTAS --- */}
            {/* Muestra una grilla con las últimas ofertas laborales cargadas */}
            <div className="max-w-5xl mx-auto py-12 px-4">
                <div className="flex items-center justify-between mb-8">
                    <h2 className="text-2xl font-bold text-slate-800">Últimas Publicaciones</h2>
                </div>

                {/* Muestro Spinner si está cargando */}
                {loading && (
                    <div className="text-center py-12">
                        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mx-auto"></div>
                        <p className="mt-4 text-slate-500">Cargando ofertas...</p>
                    </div>
                )}

                {/* Muestro Error si falló */}
                {error && (
                    <div className="p-4 bg-red-50 text-red-600 rounded-lg border border-red-100 text-center">
                        {error}
                    </div>
                )}

                {/* Si cargó bien, muestro la grilla */}
                {!loading && !error && (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {jobs.length > 0 ? (
                                jobs.slice(0, visibleCount).map(job => (
                                    <JobCard key={job.id} job={job} />
                                ))
                            ) : (
                                <div className="col-span-3 text-center py-12 bg-white rounded-xl border border-slate-200 border-dashed">
                                    <p className="text-slate-400 text-lg mb-2">No hay ofertas disponibles</p>
                                    <p className="text-slate-500 text-sm">Vuelve a intentar más tarde o contacta al administrador.</p>
                                </div>
                            )}
                        </div>

                        {/* Botón Ver Más Ofertas o Mensaje de Fin */}
                        {jobs.length > 0 && (
                            <div className="mt-10 text-center">
                                {jobs.length > visibleCount ? (
                                    <button
                                        onClick={handleLoadMore}
                                        className="inline-block px-6 py-2 bg-white border border-slate-300 text-slate-700 font-medium rounded-lg hover:bg-slate-50 transition-colors"
                                    >
                                        Ver más ofertas
                                    </button>
                                ) : (
                                    <p className="text-slate-500 font-medium">
                                        No hay más ofertas por el momento
                                    </p>
                                )}
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* --- FOOTER --- */}
            <footer className="border-t border-slate-200 bg-white py-8 text-center">
                <p className="text-sm text-slate-400">© 2025 VincuLab - Proyecto Final Técnica</p>
            </footer>
        </div>
    );
};