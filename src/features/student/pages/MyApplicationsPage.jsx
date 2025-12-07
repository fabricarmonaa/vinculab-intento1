import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../auth/context/AuthContext';
import { getApplicationsByStudent, cancelApplication } from '../../applications/services/applicationService';

export const MyApplicationsPage = () => {
    const { token } = useAuth();
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Cargar postulaciones
    useEffect(() => {
        const fetchApps = async () => {
            try {
                const data = await getApplicationsByStudent(token);
                setApplications(data);
            } catch (err) {
                setError('No pudimos cargar tus postulaciones.');
            } finally {
                setLoading(false);
            }
        };
        fetchApps();
    }, [token]);

    // Manejar cancelación
    const handleCancel = async (appId) => {
        if (!window.confirm("¿Seguro que querés cancelar esta postulación?")) return;

        try {
            await cancelApplication(appId, token);
            // Actualizamos la lista visualmente sacando la que borramos
            setApplications(prev => prev.filter(app => app.id !== appId));
        } catch (err) {
            alert("Error al cancelar la postulación");
        }
    };

    // Helper para colores de estado
    const getStatusBadge = (status) => {
        const styles = {
            PENDING: "bg-amber-100 text-amber-800 border-amber-200",
            ACCEPTED: "bg-emerald-100 text-emerald-800 border-emerald-200",
            REJECTED: "bg-red-100 text-red-800 border-red-200",
            DEFAULT: "bg-slate-100 text-slate-600 border-slate-200"
        };
        const style = styles[status] || styles.DEFAULT;
        const label = status === 'PENDING' ? 'Pendiente' : status === 'ACCEPTED' ? 'Aceptada' : status === 'REJECTED' ? 'Rechazada' : status;

        return (
            <span className={`px-3 py-1 rounded-full text-xs font-bold border ${style} uppercase tracking-wide`}>
                {label}
            </span>
        );
    };

    return (
        <div className="min-h-screen bg-slate-50 p-6 md:p-10 font-sans">
            <div className="max-w-4xl mx-auto">

                {/* Botón Volver */}
                <div className="mb-6">
                    <Link to="/student/dashboard" className="inline-flex items-center text-sm text-blue-600 hover:underline font-medium">
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                        Volver al Panel
                    </Link>
                </div>

                <h2 className="text-3xl font-bold text-slate-800 mb-2">Mis Postulaciones</h2>
                <p className="text-slate-500 mb-8">Seguí el estado de tus solicitudes laborales.</p>

                {loading && <div className="text-center py-12 text-slate-500">Cargando historial...</div>}

                {error && <div className="p-4 bg-red-50 text-red-600 rounded-lg border border-red-100">{error}</div>}

                {!loading && !error && (
                    <div className="space-y-4">
                        {applications.length > 0 ? (
                            applications.map(app => (
                                <div key={app.id} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all flex flex-col md:flex-row md:items-center justify-between gap-4">

                                    {/* Info Principal */}
                                    <div>
                                        <div className="flex items-center gap-3 mb-1">
                                            <h3 className="text-lg font-bold text-slate-800">{app.jobTitle}</h3>
                                            {getStatusBadge(app.status)}
                                        </div>
                                        <p className="text-slate-600 font-medium">{app.companyName}</p>
                                        <p className="text-xs text-slate-400 mt-2">
                                            Enviada el: {new Date(app.appliedAt).toLocaleDateString()}
                                        </p>
                                    </div>

                                    {/* Botón de Acción */}
                                    {app.status === 'PENDING' && (
                                        <button
                                            onClick={() => handleCancel(app.id)}
                                            className="shrink-0 text-sm font-medium text-red-500 hover:text-red-700 hover:bg-red-50 px-4 py-2 rounded-lg transition-colors border border-transparent hover:border-red-100"
                                        >
                                            Cancelar Solicitud
                                        </button>
                                    )}
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-16 bg-white rounded-2xl border border-slate-200 border-dashed">
                                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-slate-50 mb-3 text-slate-400">
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                                </div>
                                <p className="text-slate-500 font-medium">No tenés postulaciones activas.</p>
                                <Link to="/student/propuestas" className="text-blue-600 text-sm hover:underline mt-2 inline-block">
                                    Ir a buscar ofertas
                                </Link>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};