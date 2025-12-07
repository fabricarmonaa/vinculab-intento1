import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../auth/context/AuthContext';
import { createJob } from '../../jobs/services/jobService';

export const CreateJobPage = () => {
    const { token } = useAuth(); // Token para autenticar la petición
    const navigate = useNavigate();

    // Estado del formulario
    const [formData, setFormData] = useState({
        title: '',
        specialty: '',
        description: '',
        requirements: '',
        location: '',
        salaryRange: '',
        modality: 'PRESENCIAL', // Valor por defecto
    });
    const [saving, setSaving] = useState(false); // Indicador de carga al guardar
    const [error, setError] = useState(null);

    // Manejo de cambios en los inputs
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        // Validaciones básicas
        if (!formData.title.trim() || !formData.specialty.trim() || !formData.description.trim()) {
            setError('Título, Especialidad y Descripción son obligatorios');
            return;
        }
        try {
            setError(null);
            setSaving(true);
            // Llamamos al servicio para crear la oferta
            await createJob(token, formData);
            // Redirigimos a la lista de propuestas tras el éxito
            navigate('/company/mis-propuestas');
        } catch (err) {
            console.error('[CreateJobPage] Error:', err);
            setError(err.message || 'No se pudo crear la propuesta');
        } finally {
            setSaving(false);
        }
    };

    const inputStyle = "w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-md focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500";
    const textareaStyle = `${inputStyle} min-h-[120px]`;
    const selectStyle = "w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-md focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500";
    const labelStyle = "block text-gray-600 text-sm font-medium mb-2";

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
            <div className="bg-white p-8 rounded-xl shadow-lg border border-slate-100 w-full max-w-2xl relative overflow-hidden my-8">

                {/* Decoración superior */}
                <div className="absolute top-0 left-0 w-full h-1 bg-blue-500"></div>

                <div className="mb-6">
                    <Link to="/company/dashboard" className="text-sm text-blue-600 hover:underline">
                        &larr; Volver al Panel
                    </Link>
                </div>

                <h2 className="text-3xl font-bold text-center text-slate-800 mb-2">
                    Crear Nueva Propuesta
                </h2>
                <p className="text-center text-slate-500 mb-8">
                    Publicá una nueva oportunidad laboral para los estudiantes
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
                            placeholder="Ej: Desarrollador/a Frontend Jr."
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
                            placeholder="Ej: Programación, Electromecánica"
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
                            placeholder="Ej: $300.000 - $400.000"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={saving}
                        className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium uppercase tracking-wide shadow-md hover:bg-blue-700 transition-all disabled:opacity-60"
                    >
                        {saving ? 'Publicando...' : 'PUBLICAR PROPUESTA'}
                    </button>
                </form>
            </div>
        </div>
    );
};