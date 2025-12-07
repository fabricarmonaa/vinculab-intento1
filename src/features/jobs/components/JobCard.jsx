import { Link } from 'react-router-dom';

export const JobCard = ({ job }) => {
    return (
        <div className="group bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:border-blue-300 hover:-translate-y-1 transition-all duration-300 flex flex-col h-full">

            {/* Encabezado de la Tarjeta */}
            <div className="mb-4">
                <div className="flex justify-between items-start mb-2">
                    <h3 className="text-lg font-bold text-slate-800 leading-tight group-hover:text-blue-600 transition-colors">
                        {job.title}
                    </h3>
                    {/* Chip de Especialidad - solo si existe */}
                    {job.specialty && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100 shrink-0 ml-2">
                            {job.specialty}
                        </span>
                    )}
                </div>
                <p className="text-sm font-medium text-slate-500 mb-2">
                    {job.companyName || 'Empresa Confidencial'} • {job.location || 'Ubicación no especificada'}
                </p>
                <div className="flex flex-wrap gap-2 mb-3">
                    {job.modality && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-600">
                            {job.modality}
                        </span>
                    )}
                    {job.salaryRange && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-emerald-50 text-emerald-700">
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                            $ {job.salaryRange}
                        </span>
                    )}
                </div>
            </div>

            {/* Descripción (cortada) */}
            <p className="text-slate-600 text-sm mb-6 flex-grow line-clamp-3 leading-relaxed">
                {job.description || 'Sin descripción disponible.'}
            </p>

            {/* Pie de la tarjeta */}
            <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs text-slate-400 font-medium">
                    {job.createdAt ? new Date(job.createdAt).toLocaleDateString() : 'Recién publicado'}
                </span>

                <Link
                    to={`/student/propuesta/${job.id}`}
                    className="inline-flex items-center text-sm font-semibold text-blue-600 hover:text-blue-800 transition-colors group-hover:underline decoration-2 underline-offset-2"
                >
                    Ver Detalles
                    <svg className="w-4 h-4 ml-1 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                </Link>
            </div>
        </div>
    );
};