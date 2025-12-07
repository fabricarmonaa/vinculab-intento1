
import { useState, useEffect } from 'react';
import { useNavigate, Link, useParams } from 'react-router-dom';
import { useAuth } from '../../auth/context/AuthContext';
import { getJobById, updateJob } from '../../jobs/services/jobService';

export const EditJobPage = () => {
    const { token } = useAuth();
    const navigate = useNavigate();
    const { id: jobId } = useParams(); // ID de la oferta desde la URL

    // Estado del formulario
    const [formData, setFormData] = useState({
        title: '',
        specialty: '',
        description: '',
        requirements: '',
        location: '',
        salaryRange: '',
        modality: 'PRESENCIAL',
    });
    const [loadingPage, setLoadingPage] = useState(true); // Cargando datos iniciales
    const [saving, setSaving] = useState(false); // Guardando cambios
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchJobData = async () => {
            try {
                setLoadingPage(true);
                setError(null);
                // Obtenemos los detalles de la oferta por ID
                const job = await getJobById(jobId);
                // Rellenamos el formulario
                setFormData({
                    title: job.title || '',
                    specialty: job.specialty || '',
                    description: job.description || '',
                    requirements: job.requirements || '',
                    location: job.location || '',
                    salaryRange: job.salaryRange || '',
                    modality: job.modality || 'PRESENCIAL',
                });
            } catch (err) {
                console.error("EditPage: Error al cargar!", err);
                setError(err.message || "No se pudo cargar la propuesta");
            } finally {
                setLoadingPage(false);
            }
        };
        fetchJobData();
    }, [jobId]);

    // Manejo de cambios en inputs
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    // --- GUARDAR CAMBIOS ---
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.title.trim()) {
            setError('El título es obligatorio');
            return;
        }
        try {
            setError(null);
            setSaving(true);
            // Llamamos al servicio para actualizar
            await updateJob(jobId, formData, token);
            navigate('/company/mis-propuestas');
        } catch (err) {
            console.error('[EditJobPage] Error:', err);
            setError(err.message || 'No se pudo guardar los cambios');
        } finally {
            setSaving(false);
        }
    };

    // Estilos reutilizables
    const inputStyle = "w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-md focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500";
    const textareaStyle = `${inputStyle} min - h - [120px]`;
    const selectStyle = "w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-md focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500";
    const labelStyle = "block text-gray-600 text-sm font-medium mb-2";

    if (loadingPage) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-slate-600">Cargando datos de la propuesta...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
            <div className="bg-white p-8 rounded-xl shadow-lg border border-slate-100 w-full max-w-2xl relative overflow-hidden my-8">

                {/* Decoración superior */}
                <div className="absolute top-0 left-0 w-full h-1 bg-blue-500"></div>

                <div className="mb-6">
                    <Link to="/company/mis-propuestas" className="text-sm text-blue-600 hover:underline">
                        &larr; Volver a Mis Propuestas
                    </Link>
                </div>

                <h2 className="text-3xl font-bold text-center text-slate-800 mb-2">
                    Editar Propuesta
                </h2>
                <p className="text-center text-slate-500 mb-8">
                    Modificá los detalles de tu oferta laboral
                </p>

                {error && (
                    <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 mb-6 text-sm rounded-r">
                        <p className="font-bold">Error</p>
                        <p>{error}</p>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className={labelStyle} htmlFor="title">
                            Título de la propuesta
                        </label>
                        <input
                            id="title" name="title"
                            className={inputStyle}
                            value={formData.title}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div>
                        <label className={labelStyle} htmlFor="specialty">
                            Especialidad Requerida
                        </label>
                        <input
                            id="specialty" name="specialty"
                            className={inputStyle}
                            value={formData.specialty}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className={labelStyle} htmlFor="location">
                                Ubicación
                            </label>
                            <input
                                id="location" name="location"
                                className={inputStyle}
                                value={formData.location}
                                onChange={handleChange}
                                placeholder="Ej: CABA, Buenos Aires"
                            />
                        </div>
                        <div>
                            <label className={labelStyle} htmlFor="modality">
                                Modalidad
                            </label>
                            <select
                                id="modality" name="modality"
                                className={selectStyle}
                                value={formData.modality}
                                onChange={handleChange}
                            >
                                <option value="PRESENCIAL">Presencial</option>
                                <option value="REMOTO">Remoto</option>
                                <option value="HIBRIDO">Híbrido</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className={labelStyle} htmlFor="description">
                            Descripción del Puesto
                        </label>
                        <textarea
                            id="description" name="description"
                            className={textareaStyle}
                            value={formData.description}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div>
                        <label className={labelStyle} htmlFor="requirements">
                            Requisitos (opcional)
                        </label>
                        <textarea
                            id="requirements" name="requirements"
                            className={textareaStyle}
                            value={formData.requirements}
                            onChange={handleChange}
                        />
                    </div>

                    <div>
                        <label className={labelStyle} htmlFor="salaryRange">
                            Rango Salarial (opcional)
                        </label>
                        <input
                            id="salaryRange" name="salaryRange"
                            className={inputStyle}
                            value={formData.salaryRange}
                            onChange={handleChange}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={saving}
                        className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium uppercase tracking-wide shadow-md hover:bg-blue-700 transition-all disabled:opacity-60"
                    >
                        {saving ? 'Guardando...' : 'GUARDAR CAMBIOS'}
                    </button>
                </form>
            </div>
        </div>
    );
};
