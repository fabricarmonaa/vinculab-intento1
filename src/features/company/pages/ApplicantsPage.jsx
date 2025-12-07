import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getApplicantsForJob } from '../../applications/services/applicationService';
import { getJobById } from '../../jobs/services/jobService';
import { ApplicantCard } from '../components/ApplicantCard';

export const ApplicantsPage = () => {
    const { id: jobId } = useParams();
    const [job, setJob] = useState(null);
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState('PENDING');

    const fetchPageData = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');

            const jobDataPromise = getJobById(jobId);
            const applicantsDataPromise = getApplicantsForJob(jobId, token);

            const [jobData, applicantsData] = await Promise.all([
                jobDataPromise,
                applicantsDataPromise
            ]);

            setJob(jobData);
            setApplications(Array.isArray(applicantsData) ? applicantsData : []);

        } catch (err) {
            setError(err.message || 'No se pudieron cargar los datos');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPageData();
    }, [jobId]);

    const filteredApplications = applications
        .filter(app => app && app.status === activeTab);

    const pendingCount = applications.filter(app => app.status === 'PENDING').length;
    const acceptedCount = applications.filter(app => app.status === 'ACCEPTED').length;
    const rejectedCount = applications.filter(app => app.status === 'REJECTED').length;

    const tabs = [
        { key: 'PENDING', label: 'Pendientes', count: pendingCount, color: 'text-amber-600' },
        { key: 'ACCEPTED', label: 'Aceptados', count: acceptedCount, color: 'text-emerald-600' },
        { key: 'REJECTED', label: 'Rechazados', count: rejectedCount, color: 'text-red-600' },
    ];

    return (
        <div className="min-h-screen bg-slate-50 p-8">
            <div className="max-w-4xl mx-auto">
                <div className="mb-6">
                    <Link to="/company/mis-propuestas" className="text-sm text-blue-600 hover:underline flex items-center">
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                        Volver a Mis Propuestas
                    </Link>
                </div>

                <h2 className="text-3xl font-semibold text-slate-800 mb-6">
                    Postulantes para: {loading ? '...' : (job?.title || 'Propuesta')}
                </h2>

                <div className="mb-6 border-b border-slate-200">
                    <div className="flex gap-4">
                        {tabs.map(tab => (
                            <button
                                key={tab.key}
                                onClick={() => setActiveTab(tab.key)}
                                className={`pb-3 px-2 font-medium text-sm transition-colors relative ${activeTab === tab.key
                                    ? `${tab.color} border-b-2 border-current`
                                    : 'text-slate-500 hover:text-slate-700'
                                    }`}
                            >
                                {tab.label}
                                {tab.count > 0 && (
                                    <span className={`ml-2 px-2 py-0.5 rounded-full text-xs font-semibold ${activeTab === tab.key
                                        ? 'bg-current text-white bg-opacity-20'
                                        : 'bg-slate-200 text-slate-600'
                                        }`}>
                                        {tab.count}
                                    </span>
                                )}
                            </button>
                        ))}
                    </div>
                </div>

                {loading && <p className="text-slate-600">Cargando...</p>}
                {error && <p className="text-red-600">{error}</p>}

                {!loading && !error && (
                    <div className="grid grid-cols-1 gap-6">
                        {filteredApplications.length > 0 ? (
                            filteredApplications.map(app => (
                                <ApplicantCard
                                    key={app.applicationId || app.id}
                                    application={app}
                                    onUpdate={fetchPageData}
                                />
                            ))
                        ) : (
                            <p className="text-center text-slate-600 bg-white p-8 rounded-2xl border border-slate-200">
                                No hay postulantes {activeTab === 'PENDING' ? 'pendientes' : activeTab === 'ACCEPTED' ? 'aceptados' : 'rechazados'} para esta propuesta.
                            </p>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};