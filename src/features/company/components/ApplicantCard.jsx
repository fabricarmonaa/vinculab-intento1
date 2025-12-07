import { useState } from 'react';
import { decideApplication } from '../../applications/services/applicationService';


export const ApplicantCard = ({ application, onUpdate }) => {
    const [deciding, setDeciding] = useState(false);
    const [showProfile, setShowProfile] = useState(false);

    const handleDecision = async (status) => {
        if (!window.confirm(`¿Confirmar ${status === 'ACCEPTED' ? 'aceptación' : 'rechazo'}?`)) return;

        try {
            setDeciding(true);
            const token = localStorage.getItem('token');
            // Llamamos al servicio para guardar la decisión en el backend
            await decideApplication(application.applicationId || application.id, status, token);
            // Avisamos al padre (ApplicantsPage) para que recargue la lista
            if (onUpdate) onUpdate();
        } catch (err) {
            alert('Error al procesar decisión');
        } finally {
            setDeciding(false);
        }
    };

    // --- DESCARGA DE CV ---
    const handleDownloadCV = () => {
        if (application.studentCvPath) {
            // Abrimos el PDF en una pestaña nueva
            window.open(`http://localhost:3000${application.studentCvPath}`, '_blank');
        } else {
            alert('CV no disponible');
        }
    };

    const parseSkills = (skills) => {
        if (!skills) return [];
        if (typeof skills === 'string') {
            try {
                return JSON.parse(skills);
            } catch {
                return skills.split(',').map(s => s.trim()).filter(Boolean);
            }
        }
        if (Array.isArray(skills)) return skills;
        return [];
    };

    const skills = parseSkills(application.studentSkills);

    if (!application) return null;

    const formatDate = (dateString) => {
        if (!dateString) return 'Fecha desconocida';
        const d = new Date(dateString);
        return isNaN(d.getTime()) ? 'Fecha inválida' : d.toLocaleDateString();
    };

    return (
        <>
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-xl font-bold text-slate-800">{application.studentName || 'Estudiante'}</h3>
                            {application.studentVerified === 'VERIFIED' && (
                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100">
                                    ✓ Verificado
                                </span>
                            )}
                        </div>

                        {application.studentHeadline && (
                            <p className="text-sm text-slate-600 mb-2 italic">"{application.studentHeadline}"</p>
                        )}

                        <div className="space-y-1 text-sm text-slate-600">
                            {application.studentEmail && (
                                <div className="flex items-center gap-2">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                    </svg>
                                    {application.studentEmail}
                                </div>
                            )}
                        </div>

                        <p className="text-xs text-slate-400 mt-3">
                            Postuló el: {formatDate(application.appliedAt || application.createdAt || application.created_at)}
                        </p>
                    </div>
                </div>

                {/* Botones de Acción */}
                <div className="flex gap-2 flex-wrap">
                    <button
                        onClick={() => setShowProfile(true)}
                        className="flex-1 min-w-[120px] px-4 py-2 rounded-lg font-medium text-sm bg-blue-600 text-white hover:bg-blue-700 transition-colors"
                    >
                        Ver Perfil Completo
                    </button>

                    {/* Solo mostramos Aceptar/Rechazar si está PENDIENTE */}
                    {application.status === 'PENDING' && (
                        <>
                            <button
                                onClick={() => handleDecision('ACCEPTED')}
                                disabled={deciding}
                                className="flex-1 min-w-[120px] px-4 py-2 rounded-lg font-medium text-sm bg-emerald-600 text-white hover:bg-emerald-700 transition-colors disabled:opacity-50"
                            >
                                {deciding ? 'Procesando...' : 'Aceptar'}
                            </button>
                            <button
                                onClick={() => handleDecision('REJECTED')}
                                disabled={deciding}
                                className="flex-1 min-w-[120px] px-4 py-2 rounded-lg font-medium text-sm bg-red-50 text-red-700 hover:bg-red-100 border border-red-200 transition-colors disabled:opacity-50"
                            >
                                {deciding ? 'Procesando...' : 'Rechazar'}
                            </button>
                        </>
                    )}
                </div>
            </div>

            {/* --- MODAL DE PERFIL COMPLETO --- */}
            {showProfile && (
                <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-all" onClick={() => setShowProfile(false)}>
                    <div className="bg-slate-50 rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl" onClick={(e) => e.stopPropagation()}>
                        {/* Header Azul */}
                        <div className="sticky top-0 bg-blue-600 text-white p-8 rounded-t-2xl border-b-4 border-blue-700">
                            <div className="flex items-start justify-between">
                                <div className="flex-1">
                                    <h2 className="text-3xl font-bold mb-2 text-white">{application.studentName || 'Estudiante'}</h2>
                                    {application.studentHeadline && application.studentHeadline.trim() && (
                                        <p className="text-blue-100 text-lg italic mb-3">"{application.studentHeadline}"</p>
                                    )}
                                    <div className="flex flex-wrap gap-2">
                                        {application.studentVerified === 'VERIFIED' && (
                                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-green bg-opacity-20 border border-white border-opacity-40 text-white">
                                                ✓ Verificado por Institución
                                            </span>
                                        )}
                                        {application.studentCareer && application.studentCareer.trim() && (
                                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-white bg-opacity-20 border border-white border-opacity-40 text-white">
                                                🎓 {application.studentCareer}
                                            </span>
                                        )}
                                    </div>
                                </div>
                                <button
                                    onClick={() => setShowProfile(false)}
                                    className="text-white hover:bg-white hover:bg-opacity-20 rounded-full p-2 transition-all ml-4"
                                >
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                        </div>

                        {/* Contenido con fondo suave */}
                        <div className="p-8 space-y-6">
                            {/* CV Download */}
                            {application.studentCvPath && (
                                <div className="bg-white border-2 border-blue-200 rounded-xl p-6 shadow-sm">
                                    <h3 className="text-sm font-bold text-blue-900 uppercase tracking-wide mb-4 flex items-center gap-2">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                        </svg>
                                        Curriculum Vitae
                                    </h3>
                                    <button
                                        onClick={handleDownloadCV}
                                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center justify-center gap-3"
                                    >
                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                        </svg>
                                        <span className="text-lg">Descargar / Ver CV</span>
                                    </button>
                                    <p className="text-center text-xs text-blue-600 mt-3 font-medium">
                                        Se abrirá en una nueva pestaña
                                    </p>
                                </div>
                            )}

                            {/* Información Académica */}
                            {(application.studentSchool || application.studentCareer) && (
                                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                                    <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wide mb-4 flex items-center gap-2">
                                        <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                                        </svg>
                                        Formación Académica
                                    </h3>
                                    <div className="space-y-2">
                                        {application.studentSchool && (
                                            <div className="flex items-start gap-3">
                                                <span className="text-slate-600 font-semibold min-w-[100px]">Institución:</span>
                                                <span className="text-slate-800 font-medium">{application.studentSchool}</span>
                                            </div>
                                        )}
                                        {application.studentCareer && (
                                            <div className="flex items-start gap-3">
                                                <span className="text-slate-600 font-semibold min-w-[100px]">Carrera:</span>
                                                <span className="text-slate-800 font-medium">{application.studentCareer}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Skills/Habilidades */}
                            {skills.length > 0 && (
                                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                                    <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wide mb-4 flex items-center gap-2">
                                        <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                                        </svg>
                                        Habilidades
                                    </h3>
                                    <div className="flex flex-wrap gap-2">
                                        {skills.map((skill, idx) => (
                                            <span
                                                key={idx}
                                                className="px-4 py-2 bg-emerald-50 text-emerald-700 rounded-full text-sm font-semibold border border-emerald-200"
                                            >
                                                {skill}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Contacto */}
                            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                                <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wide mb-4 flex items-center gap-2">
                                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                    </svg>
                                    Información de Contacto
                                </h3>
                                <div className="grid md:grid-cols-2 gap-4">
                                    {application.studentEmail && (
                                        <div className="flex items-center gap-4 p-4 bg-blue-50 rounded-xl border border-blue-100">
                                            <div className="flex-shrink-0 w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                                                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                                </svg>
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <p className="text-xs text-blue-600 font-semibold uppercase">Email</p>
                                                <p className="text-slate-800 font-medium truncate">{application.studentEmail}</p>
                                            </div>
                                        </div>
                                    )}
                                    {application.studentPhone && (
                                        <div className="flex items-center gap-4 p-4 bg-emerald-50 rounded-xl border border-emerald-100">
                                            <div className="flex-shrink-0 w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center">
                                                <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                                </svg>
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <p className="text-xs text-emerald-600 font-semibold uppercase">Teléfono</p>
                                                <p className="text-slate-800 font-medium truncate">{application.studentPhone}</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Acciones finales en el modal */}
                            {application.status === 'PENDING' && (
                                <div className="flex gap-3 pt-4 border-t border-slate-300">
                                    <button
                                        onClick={() => {
                                            handleDecision('ACCEPTED');
                                            setShowProfile(false);
                                        }}
                                        disabled={deciding}
                                        className="flex-1 px-6 py-3 rounded-xl font-bold text-white bg-emerald-600 hover:bg-emerald-700 transition-colors disabled:opacity-50 shadow-lg"
                                    >
                                        ✓ Aceptar Postulante
                                    </button>
                                    <button
                                        onClick={() => {
                                            handleDecision('REJECTED');
                                            setShowProfile(false);
                                        }}
                                        disabled={deciding}
                                        className="flex-1 px-6 py-3 rounded-xl font-bold text-red-700 bg-red-50 hover:bg-red-100 border-2 border-red-200 transition-colors disabled:opacity-50"
                                    >
                                        ✗ Rechazar
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};
