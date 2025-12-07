import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../auth/context/AuthContext';
import { updateProfile } from '../../auth/services/authService';

export const StudentEditProfilePage = () => {
    const { user, token, updateUserContext } = useAuth();
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        about: '',
        skills: '',
        career: '',
        headline: ''
    });
    const [cvFile, setCvFile] = useState(null);
    const [cvPreview, setCvPreview] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);

    useEffect(() => {
        if (user) {
            setFormData({
                name: user.displayName || user.name || '',
                email: user.email || '',
                phone: user.phone || '',
                about: user.about || '',
                skills: Array.isArray(user.skills) ? user.skills.join(', ') : (user.skills || ''),
                career: user.career || '',
                headline: user.headline || ''
            });
            if (user.cvUrl) {
                setCvPreview(user.cvUrl);
            }
        }
    }, [user]);

    const handleChange = (e) => {
        let { name, value } = e.target;

        if (name === 'phone') {
            value = value.replace(/[^0-9]/g, '');
        } else if (name === 'name' || name === 'career' || name === 'headline') {
            value = value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s|]/g, ''); // Le agrego pipe por si usa separadores
        }

        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.type !== 'application/pdf') {
                setError('Solo se permiten archivos PDF');
                return;
            }
            if (file.size > 5 * 1024 * 1024) {
                setError('El archivo no debe superar 5MB');
                return;
            }
            setCvFile(file);
            setCvPreview(file.name);
            setError(null);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setSuccess(null);

        try {
            const formDataToSend = new FormData();
            formDataToSend.append('name', formData.name);
            formDataToSend.append('phone', formData.phone);
            formDataToSend.append('about', formData.about);
            const skillsArray = formData.skills.split(',').map(s => s.trim()).filter(Boolean);
            formDataToSend.append('skills', JSON.stringify(skillsArray));
            formDataToSend.append('career', formData.career);
            formDataToSend.append('headline', formData.headline);

            if (cvFile) {
                formDataToSend.append('cv', cvFile);
            }

            await updateProfile(formDataToSend, token);

            const response = await fetch('http://localhost:3000/api/v1/auth/me', {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.ok) {
                const freshData = await response.json();
                const userData = freshData.data || freshData;

                updateUserContext({
                    ...user,
                    ...userData,
                    displayName: userData.displayName || formData.name,
                    phone: userData.phone || formData.phone,
                    skills: userData.skills || formData.skills.split(',').map(s => s.trim()).filter(Boolean),
                    career: userData.career || formData.career,
                    headline: userData.headline || formData.headline,
                    about: userData.about || formData.about,
                    cvPath: userData.cvPath,
                    cvUrl: userData.cvPath
                });
            }

            setSuccess('Perfil actualizado correctamente.');

        } catch (err) {
            console.error("Error updating profile:", err);
            setError(err.message || 'Error al actualizar el perfil.');
        } finally {
            setLoading(false);
        }
    };

    // Material Design styles from LoginPage
    const inputStyle = "w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-md focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500";
    const textareaStyle = `${inputStyle} min-h-[100px]`;
    const labelStyle = "block text-gray-600 text-sm font-medium mb-2";

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
            <div className="bg-white p-8 rounded-xl shadow-lg border border-slate-100 w-full max-w-2xl relative overflow-hidden my-8">

                {/* Decoración superior */}
                <div className="absolute top-0 left-0 w-full h-1 bg-blue-500"></div>

                <div className="mb-6">
                    <Link to="/student/dashboard" className="text-sm text-blue-600 hover:underline">
                        &larr; Volver al Panel
                    </Link>
                </div>

                <h2 className="text-3xl font-bold text-center text-slate-800 mb-2">
                    Editar Perfil
                </h2>
                <p className="text-center text-slate-500 mb-8">
                    Actualizá tu información personal y profesional
                </p>

                {error && (
                    <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 mb-6 text-sm rounded-r">
                        <p className="font-bold">Error</p>
                        <p>{error}</p>
                    </div>
                )}

                {success && (
                    <div className="bg-emerald-50 border-l-4 border-emerald-500 text-emerald-700 p-4 mb-6 text-sm rounded-r">
                        <p className="font-bold">Éxito</p>
                        <p>{success}</p>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className={labelStyle}>Nombre Completo</label>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            required
                            className={inputStyle}
                            placeholder="Tu nombre y apellido"
                        />
                    </div>

                    <div>
                        <label className={labelStyle}>Titular Profesional</label>
                        <input
                            type="text"
                            name="headline"
                            value={formData.headline}
                            onChange={handleChange}
                            className={inputStyle}
                            placeholder="Ej: Desarrollador Full Stack | Estudiante de Ingeniería"
                        />
                    </div>

                    <div>
                        <label className={labelStyle}>Carrera / Especialidad</label>
                        <input
                            type="text"
                            name="career"
                            value={formData.career}
                            onChange={handleChange}
                            className={inputStyle}
                            placeholder="Ej: Tecnicatura en Programación"
                        />
                    </div>

                    <div>
                        <label className={labelStyle}>Habilidades (separadas por coma)</label>
                        <input
                            type="text"
                            name="skills"
                            value={formData.skills}
                            onChange={handleChange}
                            className={inputStyle}
                            placeholder="Ej: React, Node.js, SQL, Python"
                        />
                    </div>

                    <div>
                        <label className={labelStyle}>Email</label>
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            disabled
                            className="w-full px-4 py-2 bg-slate-100 border border-slate-200 rounded-md text-slate-500 cursor-not-allowed"
                        />
                        <p className="text-xs text-slate-400 mt-1">El email no se puede cambiar.</p>
                    </div>

                    <div>
                        <label className={labelStyle}>Teléfono</label>
                        <input
                            type="tel"
                            name="phone"
                            value={formData.phone}
                            onChange={handleChange}
                            className={inputStyle}
                            placeholder="+54 9 11 ..."
                        />
                    </div>

                    <div>
                        <label className={labelStyle}>Sobre Mí</label>
                        <textarea
                            name="about"
                            value={formData.about}
                            onChange={handleChange}
                            className={textareaStyle}
                            placeholder="Contanos brevemente sobre vos, tus intereses y objetivos..."
                        ></textarea>
                    </div>

                    <div>
                        <label className={labelStyle}>Curriculum Vitae (PDF)</label>
                        <div className="mt-1">
                            <label className="block">
                                <div className="w-full px-4 py-3 rounded-md border-2 border-dashed border-gray-300 hover:border-blue-400 transition-colors cursor-pointer bg-gray-50 hover:bg-blue-50/50">
                                    <div className="flex items-center justify-center gap-2">
                                        <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>
                                        <span className="text-sm text-slate-600">
                                            {cvPreview ? cvPreview : 'Seleccionar archivo PDF'}
                                        </span>
                                    </div>
                                </div>
                                <input
                                    type="file"
                                    accept=".pdf"
                                    onChange={handleFileChange}
                                    className="hidden"
                                />
                            </label>
                        </div>
                        <p className="text-xs text-slate-400 mt-1">Máximo 5MB, solo PDF</p>
                        {user?.cvUrl && !cvFile && (
                            <a
                                href={user.cvUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs text-blue-600 hover:underline mt-2 inline-block"
                            >
                                Ver CV actual
                            </a>
                        )}
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium uppercase tracking-wide shadow-md hover:bg-blue-700 transition-all disabled:opacity-60"
                    >
                        {loading ? 'Guardando...' : 'GUARDAR CAMBIOS'}
                    </button>
                </form>
            </div>
        </div>
    );
};
