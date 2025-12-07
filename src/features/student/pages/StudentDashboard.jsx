import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../auth/context/AuthContext';
import { getApplicationsByStudent, requestVerification } from '../../applications/services/applicationService';
import { Header } from '../../../components/Header';

// --- COMPONENTE SECUNDARIO: VerificationCard ---
const VerificationCard = ({ user, onUpdate }) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleClick = async () => {
        setLoading(true);
        setError(null);
        try {
            const token = localStorage.getItem('token');
            const updatedUser = await requestVerification(token);
            onUpdate({ ...user, status: 'pending_verification' });
        } catch (err) {
            setError(err.message || 'Error al conectar.');
            setLoading(false);
        }
    };

    const statusConfig = {
        verified: {
            color: 'text-emerald-700',
            bg: 'bg-emerald-50',
            border: 'border-emerald-100',
            icon: (
                <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center mb-3">
                    <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                </div>
            ),
            title: 'Verificado',
            text: 'Tu identidad está confirmada. Tenés acceso total.',
            action: null
        },
        pending_verification: {
            color: 'text-amber-700',
            bg: 'bg-amber-50',
            border: 'border-amber-100',
            icon: (
                <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center mb-3">
                    <svg className="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                </div>
            ),
            title: 'Pendiente',
            text: 'Tu solicitud está siendo revisada por el colegio.',
            action: null
        },
        rejected: {
            color: 'text-red-700',
            bg: 'bg-red-50',
            border: 'border-red-100',
            icon: (
                <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center mb-3">
                    <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </div>
            ),
            title: 'Rechazado',
            text: 'Contactá a tu institución para más detalles.',
            action: null
        },
        not_verified: {
            color: 'text-blue-700',
            bg: 'bg-white',
            border: 'border-slate-200',
            icon: (
                <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center mb-3">
                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                </div>
            ),
            title: 'No Verificado',
            text: 'Validá tu identidad para postularte a las ofertas.',
            action: true
        }
    };

    const current = statusConfig[user.status] || statusConfig.not_verified;

    return (
        <div className={`h-full p-6 rounded-2xl border ${current.border} ${current.bg} shadow-sm flex flex-col items-start transition-all`}>
            {current.icon}
            <h3 className={`text-lg font-bold ${current.color} mb-1`}>{current.title}</h3>
            <p className="text-sm text-slate-600 mb-4 leading-relaxed">
                {current.text}
            </p>

            {current.action && (
                <div className="mt-auto w-full">
                    <button
                        onClick={handleClick}
                        disabled={loading}
                        className="w-full py-2.5 px-4 bg-blue-600 text-white rounded-xl text-sm font-medium shadow-sm hover:bg-blue-700 hover:shadow-md active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? 'Enviando...' : 'Solicitar Verificación'}
                    </button>
                    {error && <p className="text-red-500 text-xs mt-2 text-center">{error}</p>}
                </div>
            )}
        </div>
    );
};

// --- DASHBOARD PRINCIPAL (MODIFICADO) ---
export const StudentDashboard = () => {
    const { user, token, logout, updateUserContext } = useAuth();
    const navigate = useNavigate();

    const [applications, setApplications] = useState([]);
    const [loadingApps, setLoadingApps] = useState(true);

    const isVerified = user?.status === 'verified';

    useEffect(() => {
        let mounted = true;
        if (!token) return;

        const loadData = async () => {
            try {
                const apps = await getApplicationsByStudent(token);
                if (mounted) setApplications(apps || []);

                const response = await fetch('http://localhost:3000/api/v1/auth/me', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });

                if (response.ok) {
                    const data = await response.json();
                    const userData = data.data || data;

                    // userData.status viene del backend ('verified', 'not_verified', etc.)
                    // userData.verificationStatus es el raw code ('VERIFIED', 'UNVERIFIED', etc.)

                    if (mounted && userData.status !== user.status) {
                        updateUserContext({
                            ...user,
                            verified: userData.status === 'verified',
                            status: userData.status
                        });
                    }
                }

            } catch (err) {
                console.error("Error loading dashboard data:", err);
                if (err.status === 401) {
                    logout();
                    navigate('/login');
                }
            } finally {
                if (mounted) setLoadingApps(false);
            }
        };

        loadData();

        return () => { mounted = false; };
    }, [token]);

    const pendingApps = applications.filter(a => a.status === 'PENDING').length;
    const acceptedApps = applications.filter(a => a.status === 'ACCEPTED').length;

    const cardClass = "group relative bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col h-full transition-all duration-300";

    return (
        <div className="min-h-screen bg-slate-50 font-sans">
            <Header />

            <main className="max-w-7xl mx-auto py-10 px-4 sm:px-6 lg:px-8 animate-fade-in">

                <header className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
                    <div>
                        <h2 className="text-2xl font-bold text-slate-800">Tu Panel de Control</h2>
                        <p className="text-slate-500 mt-1">Gestioná tu perfil, verificaciones y postulaciones desde aquí.</p>
                    </div>
                    <Link
                        to="/student/perfil/editar"
                        className="inline-flex items-center justify-center px-4 py-2 bg-white border border-slate-300 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50 hover:text-blue-600 transition-colors shadow-sm"
                    >
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                        Editar Perfil
                    </Link>
                </header>

                <section className="grid grid-cols-1 md:grid-cols-3 gap-6">

                    <div className="md:col-span-1 h-full">
                        {user && <VerificationCard user={user} onUpdate={updateUserContext} />}
                    </div>

                    {/*
                        *** TARJETA 1: MIS POSTULACIONES (AHORA BLOQUEADA SI NO ESTÁ VERIFICADO) ***
                    */}
                    <Link
                        to="/student/mis-postulaciones"
                        onClick={(e) => !isVerified && e.preventDefault()}
                        className={`${cardClass} 
                            ${isVerified
                                ? 'hover:shadow-md hover:border-purple-300 hover:-translate-y-1 cursor-pointer'
                                : 'opacity-70 cursor-not-allowed grayscale-[0.5]'
                            }`} >

                        <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-3 transition-colors ${isVerified ? 'bg-purple-50 text-purple-600 group-hover:bg-purple-600 group-hover:text-white' : 'bg-slate-100 text-slate-400'}`}>
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg>
                        </div>
                        <h3 className={`text-lg font-bold text-slate-800 mb-1 ${isVerified ? 'group-hover:text-purple-600' : 'text-slate-500'} transition-colors`}>Mis Postulaciones</h3>
                        {!isVerified && (
                            <div className="mt-3 p-2 bg-slate-100 rounded-lg text-xs font-medium text-slate-500 flex items-center">
                                <svg className="w-3 h-3 mr-1.5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" /></svg>
                                Requiere verificación
                            </div>
                        )}
                        <div className="mt-2 flex-grow">
                            {loadingApps ? (
                                <p className="text-sm text-slate-400">Cargando datos...</p>
                            ) : (
                                <>
                                    <p className="text-3xl font-bold text-slate-900">{applications.length}</p>
                                    <p className="text-sm text-slate-500 mt-1">
                                        <span className="font-medium text-amber-600">{pendingApps} pendientes</span> · <span className="font-medium text-emerald-600">{acceptedApps} activas</span>
                                    </p>
                                    {acceptedApps > 0 && (
                                        <div className="mt-3 p-2 bg-emerald-50 border border-emerald-100 rounded-lg">
                                            <p className="text-xs text-emerald-700 font-medium flex items-center">
                                                <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                                                ¡Tenés {acceptedApps} postulación(es) aceptada(s)!
                                            </p>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>

                        <div className="mt-4 pt-4 border-t border-slate-100 w-full">
                            <span className={`text-sm font-medium flex items-center justify-end ${isVerified ? 'text-purple-600 group-hover:underline' : 'text-slate-400'}`}>
                                {isVerified ? 'Ver historial' : 'Bloqueado'} <span className="ml-1">&rarr;</span>
                            </span>
                        </div>
                    </Link>

                    <Link
                        to="/student/propuestas"
                        className={`${cardClass} hover:shadow-md hover:border-blue-300 hover:-translate-y-1 cursor-pointer`}
                    >
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-3 transition-colors bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white`}>
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                        </div>

                        <h3 className="text-lg font-bold text-slate-800 mb-1 group-hover:text-blue-600 transition-colors">Buscar Ofertas</h3>
                        <div className="mt-2 flex-grow">
                            <p className="text-sm text-slate-600 leading-relaxed">
                                Explorá las nuevas oportunidades laborales y postulate hoy mismo.
                            </p>
                        </div>

                        <div className="mt-4 pt-4 border-t border-slate-100 w-full">
                            <span className={`text-sm font-medium flex items-center justify-end text-blue-600 group-hover:underline`}>
                                Ir al buscador <span className="ml-1">&rarr;</span>
                            </span>
                        </div>
                    </Link>

                </section>
            </main>
        </div>
    );
};