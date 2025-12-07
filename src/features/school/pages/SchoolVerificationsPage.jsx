// frontEnd/src/features/school/pages/SchoolVerificationsPage.jsx
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../auth/context/AuthContext';
import {
  getPendingStudents,
  updateStudentStatus,
} from '../services/schoolService';

export default function SchoolVerificationsPage() {
  const { token } = useAuth();
  const [pending, setPending] = useState([]);
  const [approved, setApproved] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;

    async function load() {
      if (!token) return;
      try {
        setLoading(true);
        setError(null);

        const pendingList = await getPendingStudents(token);

        const res = await fetch('http://localhost:3000/api/v1/verifications/school/approved', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        let approvedList = [];
        if (res.ok) {
          const data = await res.json();
          approvedList = data.data || [];
        }

        if (!mounted) return;
        setPending(pendingList || []);
        setApproved(approvedList || []);
      } catch (err) {
        console.error('[SchoolVerifications] Error:', err);
        if (mounted) setError(err.message || 'Error al cargar solicitudes');
      } finally {
        if (mounted) setLoading(false);
      }
    }

    load();
    return () => {
      mounted = false;
    };
  }, [token]);

  const handleDecision = async (verificationId, decision) => {
    try {
      setError(null);
      setUpdatingId(verificationId);
      await updateStudentStatus(verificationId, decision, token);

      if (decision === 'APPROVED') {
        const item = pending.find(v => v.verificationId === verificationId);
        if (item) {
          setApproved(prev => [item, ...prev]);
        }
      }

      setPending((prev) =>
        prev.filter((v) => v.verificationId !== verificationId)
      );
    } catch (err) {
      console.error('[SchoolVerifications] Error decisión:', err);
      setError(err.message || 'No se pudo registrar la decisión');
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-5xl mx-auto py-8 px-4">

        {/* Botón Volver */}
        <div className="mb-6">
          <Link to="/school/dashboard" className="inline-flex items-center text-sm text-blue-600 hover:underline font-medium">
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
            Volver al Panel
          </Link>
        </div>

        <header className="mb-8">
          <h1 className="text-2xl font-semibold text-slate-800">
            Panel de Verificaciones
          </h1>
          <p className="text-sm text-slate-500">
            Gestioná las verificaciones y visualizá tu nómina de egresados.
          </p>
        </header>

        {error && (
          <div className="mb-4 rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* SECCION PENDIENTES */}
        <section className="mb-10">
          <h2 className="text-lg font-bold text-slate-700 mb-4 flex items-center">
            <span className="w-2 h-2 bg-amber-400 rounded-full mr-2"></span>
            Solicitudes Pendientes
          </h2>

          {loading ? (
            <div className="text-slate-500 text-sm">Cargando solicitudes...</div>
          ) : pending.length === 0 ? (
            <div className="p-6 bg-white rounded-2xl border border-slate-200 text-center text-slate-500 text-sm">
              No hay solicitudes pendientes por el momento.
            </div>
          ) : (
            <div className="space-y-3">
              {pending.map((v) => (
                <article
                  key={v.verificationId}
                  className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm flex flex-col gap-2 md:flex-row md:items-center md:justify-between"
                >
                  <div>
                    <h3 className="text-sm font-semibold text-slate-800">
                      {v.studentName || 'Estudiante sin nombre'}
                    </h3>
                    <p className="text-xs text-slate-500">{v.studentEmail}</p>
                    <p className="text-xs text-slate-400 mt-1">
                      Fecha: <span className="font-medium">{v.createdAt || v.created_at}</span>
                    </p>
                  </div>

                  <div className="flex gap-2 mt-2 md:mt-0">
                    <button
                      onClick={() => handleDecision(v.verificationId, 'APPROVED')}
                      disabled={updatingId === v.verificationId}
                      className="px-3 py-1.5 rounded-xl text-xs font-medium bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-60 transition-colors"
                    >
                      {updatingId === v.verificationId ? '...' : 'Aprobar'}
                    </button>
                    <button
                      onClick={() => handleDecision(v.verificationId, 'REJECTED')}
                      disabled={updatingId === v.verificationId}
                      className="px-3 py-1.5 rounded-xl text-xs font-medium bg-rose-600 text-white hover:bg-rose-700 disabled:opacity-60 transition-colors"
                    >
                      {updatingId === v.verificationId ? '...' : 'Rechazar'}
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        {/* SECCION NOMINA (APROBADOS) */}
        <section>
          <h2 className="text-lg font-bold text-slate-700 mb-4 flex items-center">
            <span className="w-2 h-2 bg-emerald-500 rounded-full mr-2"></span>
            Nómina de Egresados Verificados
          </h2>

          {loading ? (
            <div className="text-slate-500 text-sm">Cargando nómina...</div>
          ) : approved.length === 0 ? (
            <div className="p-6 bg-white rounded-2xl border border-slate-200 text-center text-slate-500 text-sm">
              Aún no has verificado a ningún estudiante.
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-3 font-medium text-slate-600">Estudiante</th>
                    <th className="px-6 py-3 font-medium text-slate-600">Email</th>
                    <th className="px-6 py-3 font-medium text-slate-600">Fecha Verificación</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {approved.map((v) => (
                    <tr key={v.verificationId} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-3 font-medium text-slate-800">
                        {v.studentName || 'Sin nombre'}
                      </td>
                      <td className="px-6 py-3 text-slate-600">
                        {v.studentEmail}
                      </td>
                      <td className="px-6 py-3 text-slate-500">
                        {v.decidedAt || v.createdAt}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

      </div>
    </div>
  );
}
