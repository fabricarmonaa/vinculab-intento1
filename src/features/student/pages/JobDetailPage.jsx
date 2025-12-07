import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../auth/context/AuthContext';
import { getJobById } from '../../jobs/services/jobService';
import {
  createApplication,
  getApplicationsByStudent,
} from '../../applications/services/applicationService';

export const JobDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, token } = useAuth();

  const [job, setJob] = useState(null);
  const [myApplications, setMyApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [error, setError] = useState(null);

  const isVerified = !!user?.verified;

  useEffect(() => {
    let mounted = true;

    async function load() {
      try {
        setLoading(true);
        setError(null);
        const [j, apps] = await Promise.all([
          getJobById(id),
          token ? getApplicationsByStudent(token) : Promise.resolve([]),
        ]);
        if (!mounted) return;
        setJob(j);
        setMyApplications(apps || []);
      } catch (err) {
        console.error('[JobDetailPage] Error:', err);
        if (mounted) setError(err.message || 'Error al cargar la oferta');
      } finally {
        if (mounted) setLoading(false);
      }
    }

    if (id) load();
    return () => {
      mounted = false;
    };
  }, [id, token]);

  const alreadyApplied = myApplications.some((a) => a.offerId === id);

  const handleApply = async () => {
    if (!token) {
      navigate('/login');
      return;
    }
    if (!isVerified) {
      setError(
        'Solo estudiantes verificados por su escuela pueden postularse a ofertas'
      );
      return;
    }
    try {
      setError(null);
      setApplying(true);
      await createApplication(id, token);
      setMyApplications((prev) => [
        ...prev,
        { offerId: id, status: 'PENDING', id: 'temp-' + Date.now() },
      ]);
    } catch (err) {
      console.error('[JobDetailPage] Error apply:', err);
      setError(err.message || 'No se pudo completar la postulación');
    } finally {
      setApplying(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 text-slate-500">
        <p className="text-lg font-medium mb-4">Oferta no encontrada.</p>
        <Link to="/student/propuestas" className="text-blue-600 hover:underline">Volver al listado</Link>
      </div>
    );
  }

  const disabled = applying || !isVerified || alreadyApplied;

  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-12">
      {/* Header Banner (Optional, adds premium feel) */}
      <div className="h-48 bg-gradient-to-r from-blue-600 to-indigo-700 w-full absolute top-0 left-0 z-0"></div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 pt-12">

        {/* Breadcrumb */}
        <div className="mb-6">
          <Link
            to="/student/propuestas"
            className="inline-flex items-center text-white/80 hover:text-white transition-colors text-sm font-medium"
          >
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
            Volver a las ofertas
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">

            {/* Job Header Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
              <div className="flex items-start justify-between">
                <div>
                  <h1 className="text-3xl font-bold text-slate-900 leading-tight mb-2">
                    {job.title}
                  </h1>
                  <div className="flex items-center gap-2 text-slate-500 text-sm mb-4">
                    <span className="font-medium text-blue-600">{job.companyName || 'Empresa Confidencial'}</span>
                    <span>•</span>
                    <span>{job.location || 'Ubicación no especificada'}</span>
                    <span>•</span>
                    <span className="text-slate-400">{job.createdAt ? new Date(job.createdAt).toLocaleDateString() : 'Reciente'}</span>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {job.modality && (
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100">
                        {job.modality}
                      </span>
                    )}
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-100">
                      $ {job.salaryRange || 'Salario a convenir'}
                    </span>
                    {job.specialty && (
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-600 border border-slate-200">
                        {job.specialty}
                      </span>
                    )}
                  </div>
                </div>
                {/* Company Logo Placeholder */}
                <div className="hidden sm:flex h-16 w-16 bg-slate-100 rounded-xl items-center justify-center text-slate-400">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
                </div>
              </div>
            </div>

            {/* Description & Requirements */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 space-y-8">

              <section>
                <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center">
                  <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" /></svg>
                  Descripción del Puesto
                </h2>
                <div className="prose prose-slate max-w-none text-slate-600 leading-relaxed whitespace-pre-line">
                  {job.description || 'No hay descripción disponible para esta oferta.'}
                </div>
              </section>

              <hr className="border-slate-100" />

              <section>
                <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center">
                  <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  Requisitos
                </h2>
                <div className="prose prose-slate max-w-none text-slate-600 leading-relaxed whitespace-pre-line">
                  {job.requirements || 'No se especificaron requisitos particulares.'}
                </div>
              </section>

            </div>
          </div>

          {/* Sidebar / Action Card */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sticky top-24">
              <h3 className="text-lg font-bold text-slate-800 mb-4">Postulación</h3>

              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-100 text-red-700 text-sm rounded-lg">
                  {error}
                </div>
              )}

              <div className="space-y-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-500">Verificación:</span>
                  <span className={`font-medium ${isVerified ? 'text-emerald-600' : 'text-amber-600'}`}>
                    {isVerified ? 'Verificado' : 'Pendiente'}
                  </span>
                </div>

                {!isVerified && (
                  <div className="p-3 bg-amber-50 border border-amber-100 rounded-lg text-xs text-amber-700">
                    Tu cuenta debe ser verificada por tu escuela antes de postularte.
                  </div>
                )}

                {alreadyApplied && (
                  <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-lg text-xs text-emerald-700 font-medium flex items-center">
                    <svg className="w-4 h-4 mr-1.5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                    Ya te postulaste a esta oferta.
                  </div>
                )}

                <button
                  onClick={handleApply}
                  disabled={disabled}
                  className={`w-full py-3 px-4 rounded-xl text-sm font-bold shadow-sm transition-all transform active:scale-95
                    ${disabled
                      ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                      : 'bg-blue-600 text-white hover:bg-blue-700 hover:shadow-md'
                    }`}
                >
                  {applying
                    ? 'Enviando...'
                    : alreadyApplied
                      ? 'Postulación Enviada'
                      : 'Postularme Ahora'}
                </button>

                <p className="text-xs text-center text-slate-400 mt-2">
                  Al postularte, compartís tu perfil y CV con la empresa.
                </p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
