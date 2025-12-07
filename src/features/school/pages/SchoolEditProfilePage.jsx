import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../auth/context/AuthContext';
import client from '../../../api/client';

export const SchoolEditProfilePage = () => {
    const { user, token } = useAuth();
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        name: '',
        cue: '',
        email: '',
        phone: '',
        address: '',
        directorName: ''
    });
    const [loading, setLoading] = useState(false);
    const [loadingProfile, setLoadingProfile] = useState(true);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const response = await client.get('/schools/profile', { token });
                const data = response.data || response;
                setFormData({
                    name: data.name || '',
                    cue: data.cue || '',
                    email: data.email || '',
                    phone: data.phone || '',
                    address: data.address || '',
                    directorName: data.directorName || ''
                });
            } catch (err) {
                console.error("Error loading profile:", err);
                setError('No se pudo cargar el perfil');
            } finally {
                setLoadingProfile(false);
            }
        };

        if (token) {
            fetchProfile();
        }
    }, [token]);

    const handleChange = (e) => {
        let { name, value } = e.target;

        if (name === 'phone') {
            value = value.replace(/[^0-9]/g, '');
        } else if (name === 'directorName') {
            value = value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, '');
        }

        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setSuccess(null);

        try {
            await client.put('/schools/profile', formData, { token });
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

    if (loadingProfile) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-slate-600">Cargando perfil...</p>
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
                    <Link to="/school/dashboard" className="text-sm text-blue-600 hover:underline">
                        &larr; Volver al Panel
                    </Link>
                </div>

                <h2 className="text-3xl font-bold text-center text-slate-800 mb-2">
                    Editar Perfil de Institución
                </h2>
                <p className="text-center text-slate-500 mb-8">
                    Actualizá la información de la escuela
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
                        <label className={labelStyle}>Nombre de la Institución</label>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            required
                            className={inputStyle}
                            placeholder="Escuela Técnica..."
                        />
                    </div>

                    <div>
                        <label className={labelStyle}>Nombre del Director/a</label>
                        <input
                            type="text"
                            name="directorName"
                            value={formData.directorName}
                            onChange={handleChange}
                            className={inputStyle}
                            placeholder="Nombre del director..."
                        />
                    </div>

                    <div>
                        <label className={labelStyle}>CUE</label>
                        <input
                            type="text"
                            name="cue"
                            value={formData.cue}
                            disabled
                            className="w-full px-4 py-2 bg-slate-100 border border-slate-200 rounded-md text-slate-500 cursor-not-allowed"
                        />
                        <p className="text-xs text-slate-400 mt-1">El CUE no se puede modificar.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className={labelStyle}>Email Institucional</label>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                required
                                className={inputStyle}
                                placeholder="contacto@escuela.edu.ar"
                            />
                        </div>

                        <div>
                            <label className={labelStyle}>Teléfono</label>
                            <input
                                type="tel"
                                name="phone"
                                value={formData.phone}
                                onChange={handleChange}
                                className={inputStyle}
                                placeholder="+54 11 ..."
                            />
                        </div>
                    </div>

                    <div>
                        <label className={labelStyle}>Dirección</label>
                        <textarea
                            name="address"
                            value={formData.address}
                            onChange={handleChange}
                            className={textareaStyle}
                            placeholder="Calle, número, localidad, código postal..."
                        ></textarea>
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
