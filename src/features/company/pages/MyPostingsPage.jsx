import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getJobsByCompany, deleteJob } from '../../jobs/services/jobService';
import { useAuth } from '../../auth/context/AuthContext';

export const MyPostingsPage = () => {
    const { token } = useAuth();
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchJobs = async () => {
        try {
            setLoading(true);
            const data = await getJobsByCompany(token);
            setJobs(data);
        } catch (err) {
            setError(err.message || 'No se pudieron cargar tus propuestas');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchJobs();
    }, [token]);

    const handleDelete = async (jobId) => {
        if (!window.confirm("¿Estás seguro de eliminar esta búsqueda?")) return;

        try {
            setError(null);
            await deleteJob(jobId, token);
            setJobs(prevJobs => prevJobs.filter(job => job.id !== jobId));
        } catch (err) {
            setError(err.message || "Error al borrar la propuesta");
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 p-6 md:p-10">
            <div className="max-w-6xl mx-auto">

                {/* Cabecera con navegación */}
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
                    <div>
                        <Link to="/company/dashboard" className="inline-flex items-center text-sm text-slate-500 hover:text-blue-600 transition-colors mb-2">
                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                            Volver al Panel
                        </Link>
                        <h2 className="text-3xl font-bold text-slate-800">Mis Búsquedas</h2>
                    </div>
                    <Link
                        to="/company/crear-propuesta"
                        className="inline-flex items-center justify-center px-5 py-2.5 bg-blue-600 text-white rounded-xl font-medium shadow-sm hover:bg-blue-700 transition-all active:scale-95"
                    >
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                        Nueva Oferta
                    </Link>
                </div>

                {loading && (
                    <div className="flex justify-center py-12">
                        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
                    </div>
                )}

                {error && <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded-r">{error}</div>}

                {!loading && !error && (
                    <div className="grid grid-cols-1 gap-6">
                        {jobs.length > 0 ? (
                            jobs.map(job => (
                                <div key={job.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all overflow-hidden flex flex-col md:flex-row">

                                    {/* Columna Principal: Info */}
                                    <div className="p-6 flex-1">
                                        <div className="flex items-start justify-between mb-2">
                                            <h3 className="text-xl font-bold text-slate-800">{job.title}</h3>
                                            {/* Chip de Especialidad */}
                                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100">
                                                {job.specialty}
                                            </span>
                                        </div>

                                        <p className="text-slate-600 text-sm mb-4 line-clamp-2">{job.description}</p>

                                        <div className="flex items-center text-xs text-slate-400 gap-4">
                                            <span className="flex items-center">
                                                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                                {job.createdAt ? new Date(job.createdAt).toLocaleDateString() : 'Reciente'}
                                            </span>
                                            {job.salaryRange && (
                                                <span className="flex items-center text-emerald-600 font-medium">
                                                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                                    {job.salaryRange}
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    {/* Columna Lateral: Acciones */}
                                    <div className="bg-slate-50 p-4 md:w-64 flex flex-col justify-center gap-3 border-t md:border-t-0 md:border-l border-slate-100">
                                        <Link
                                            to={`/company/propuesta/${job.id}/postulantes`}
                                            className="w-full flex items-center justify-center px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 transition-colors shadow-sm"
                                        >
                                            Ver Postulantes
                                        </Link>

                                        <div className="flex gap-2">
                                            <Link
                                                to={`/company/propuesta/editar/${job.id}`}
                                                className="flex-1 flex items-center justify-center px-3 py-2 bg-white border border-slate-300 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50 hover:text-blue-600 transition-colors"
                                            >
                                                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                                                Editar
                                            </Link>
                                            <button
                                                onClick={() => handleDelete(job.id)}
                                                className="flex-1 flex items-center justify-center px-3 py-2 bg-white border border-red-200 text-red-600 rounded-lg text-sm font-medium hover:bg-red-50 hover:border-red-300 transition-colors"
                                            >
                                                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                                Borrar
                                            </button>
                                        </div>
                                    </div>

                                </div>
                            ))
                        ) : (
                            <div className="text-center py-12 bg-white rounded-2xl border border-slate-200 border-dashed">
                                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-50 mb-4">
                                    <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                                </div>
                                <h3 className="text-lg font-medium text-slate-800">No tenés búsquedas activas</h3>
                                <p className="text-slate-500 mb-6">Comenzá publicando tu primera oferta laboral.</p>
                                <Link to="/company/crear-propuesta" className="text-blue-600 font-medium hover:underline">Crear Oferta Ahora &rarr;</Link>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};