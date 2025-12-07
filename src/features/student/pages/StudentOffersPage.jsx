import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../auth/context/AuthContext';
import { getJobs, createJob } from '../../jobs/services/jobService';
import {
  createApplication,
  getApplicationsByStudent,
} from '../../applications/services/applicationService';

export default function StudentOffersPage() {
  const { user, token } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [myApplications, setMyApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [applyingId, setApplyingId] = useState(null);
  const [error, setError] = useState(null);

  const isVerified = !!user?.verified;

  useEffect(() => {
    let mounted = true;

    async function load() {
      try {
        setLoading(true);
        setError(null);

        const [jobsRes, appsRes] = await Promise.all([
          getJobs(),
          token ? getApplicationsByStudent(token) : Promise.resolve([]),
        ]);

        if (!mounted) return;
        setJobs(jobsRes || []);
        setMyApplications(appsRes || []);
      } catch (err) {
        console.error('[StudentOffers] Error cargando datos:', err);
        if (mounted) setError(err.message || 'Error al cargar ofertas');
      } finally {
        if (mounted) setLoading(false);
      }
    }

    load();
    return () => {
      mounted = false;
    };
  }, [token]);

  function hasApplied(offerId) {
    return myApplications.some((a) => a.offerId === offerId);
  }

  const handleApply = async (offerId) => {
    if (!token) {
      setError('Necesitás iniciar sesión para postularte');
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
      setApplyingId(offerId);
      const app = await createApplication(token, offerId);
      setMyApplications((prev) => [...prev, app]);
    } catch (err) {
      console.error('[StudentOffers] Error al postularse:', err);
      setError(err.message || 'No se pudo completar la postulación');
    } finally {
      setApplyingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-5xl mx-auto py-8 px-4">

        {/* Botón Volver */}
        <div className="mb-6">
          <Link to="/student/dashboard" className="inline-flex items-center text-sm text-blue-600 hover:underline font-medium">
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
            Volver al Panel
          </Link>
        </div>

        <header className="mb-6 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-slate-800">
              Ofertas disponibles
            </h1>
            <p className="text-sm text-slate-500">
              Explora las oportunidades y postúlate según tu perfil.
            </p>
          </div>

          <div className="px-4 py-2 rounded-xl bg-white shadow-sm border border-slate-200 flex flex-col md:flex-row md:items-center gap-2">
            <span className="text-sm text-slate-500">Estado de verificación:</span>
            <span
              className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${isVerified
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                : 'bg-amber-50 text-amber-700 border border-amber-200'
                }`}
            >
              <span
                className={`w-2 h-2 rounded-full mr-2 ${isVerified ? 'bg-emerald-500' : 'bg-amber-500'
                  }`}
              />
              {isVerified ? 'Verificado por escuela' : 'Pendiente de verificación'}
            </span>
          </div>
        </header>

        {error && (
          <div className="mb-4 rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {loading ? (
          <div className="text-slate-500">Cargando ofertas...</div>
        ) : jobs.length === 0 ? (
          <div className="text-slate-500">
            No hay ofertas disponibles por el momento.
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {jobs.map((job) => {
              const alreadyApplied = hasApplied(job.id);
              const disabled = !isVerified || alreadyApplied || applyingId === job.id;

              return (
                <article
                  key={job.id}
                  className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow"
                >
                  <h2 className="text-lg font-semibold text-slate-800 mb-1">
                    {job.title}
                  </h2>
                  <p className="text-sm text-slate-500 mb-2">
                    {job.companyName || 'Empresa no disponible'}
                  </p>
                  <p className="text-xs text-slate-400 mb-4">
                    Estado: {job.status || 'ACTIVA'}
                  </p>

                  {alreadyApplied && (
                    <p className="text-xs text-emerald-600 mb-2">
                      Ya estás postuladx a esta oferta.
                    </p>
                  )}

                  {!isVerified && (
                    <p className="text-xs text-amber-600 mb-2">
                      Necesitás estar verificado por tu escuela para poder postularte.
                    </p>
                  )}

                  <button
                    onClick={() => handleApply(job.id)}
                    disabled={disabled}
                    className={`w-full inline-flex justify-center items-center px-4 py-2 rounded-xl text-sm font-medium
                      ${disabled
                        ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                        : 'bg-blue-600 text-white hover:bg-blue-700'
                      }`}
                  >
                    {applyingId === job.id
                      ? 'Enviando postulación...'
                      : alreadyApplied
                        ? 'Ya postulado'
                        : 'Postularme'}
                  </button>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
