import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../auth/context/AuthContext';
import client from '../../../api/client';

export const CompanyEditProfilePage = () => {
    const { user, token } = useAuth();
    const navigate = useNavigate();

    // Estado para el formulario con todos los campos posibles
    const [formData, setFormData] = useState({
        legalName: '',
        tradeName: '',
        contactEmail: '',
        contactPhone: '',
        website: '',
        industry: '',
        size: '',
        address: '',
        city: '',
        province: '',
        country: ''
    });
    const [loading, setLoading] = useState(false); // Cargando al guardar
    const [loadingProfile, setLoadingProfile] = useState(true); // Cargando al obtener datos iniciales
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                // Hacemos GET al endpoint de perfil de empresa
                const response = await client.get('/companies/profile', { token });
                const data = response.data || response;
                // Rellenamos el formulario con los datos recibidos
                setFormData({
                    legalName: data.legalName || '',
                    tradeName: data.tradeName || '',
                    contactEmail: data.contactEmail || '',
                    contactPhone: data.contactPhone || '',
                    website: data.website || '',
                    industry: data.industry || '',
                    size: data.size || '',
                    address: data.address || '',
                    city: data.city || '',
                    province: data.province || '',
                    country: data.country || ''
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

    // Manejo de cambios en los inputs
    const handleChange = (e) => {
        let { name, value } = e.target;
        if (name === 'contactPhone') {
            value = value.replace(/[^0-9]/g, '');
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
            await client.put('/companies/profile', formData, { token });
            setSuccess('Perfil actualizado correctamente.');
        } catch (err) {
            console.error("Error updating profile:", err);
            setError(err.message || 'Error al actualizar el perfil.');
        } finally {
            setLoading(false);
        }
    };

    const inputStyle = "w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-md focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500";
    const selectStyle = "w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-md focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500";
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
            <div className="bg-white p-8 rounded-xl shadow-lg border border-slate-100 w-full max-w-3xl relative overflow-hidden my-8">

                {/* Decoración superior */}
                <div className="absolute top-0 left-0 w-full h-1 bg-blue-500"></div>

                <div className="mb-6">
                    <Link to="/company/dashboard" className="text-sm text-blue-600 hover:underline">
                        &larr; Volver al Panel
                    </Link>
                </div>

                <h2 className="text-3xl font-bold text-center text-slate-800 mb-2">
                    Editar Perfil de Empresa
                </h2>
                <p className="text-center text-slate-500 mb-8">
                    Actualizá la información de tu compañía
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
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className={labelStyle}>Razón Social</label>
                            <input
                                type="text"
                                name="legalName"
                                value={formData.legalName}
                                onChange={handleChange}
                                required
                                className={inputStyle}
                                placeholder="Nombre legal de la empresa"
                            />
                        </div>

                        <div>
                            <label className={labelStyle}>Nombre Comercial</label>
                            <input
                                type="text"
                                name="tradeName"
                                value={formData.tradeName}
                                onChange={handleChange}
                                className={inputStyle}
                                placeholder="Nombre de fantasía"
                            />
                        </div>

                        <div>
                            <label className={labelStyle}>Email de Contacto</label>
                            <input
                                type="email"
                                name="contactEmail"
                                value={formData.contactEmail}
                                onChange={handleChange}
                                required
                                className={inputStyle}
                                placeholder="contacto@empresa.com"
                            />
                        </div>

                        <div>
                            <label className={labelStyle}>Teléfono de Contacto</label>
                            <input
                                type="tel"
                                name="contactPhone"
                                value={formData.contactPhone}
                                onChange={handleChange}
                                className={inputStyle}
                                placeholder="+54 11 ..."
                            />
                        </div>

                        <div>
                            <label className={labelStyle}>Sitio Web</label>
                            <input
                                type="url"
                                name="website"
                                value={formData.website}
                                onChange={handleChange}
                                className={inputStyle}
                                placeholder="https://..."
                            />
                        </div>

                        <div>
                            <label className={labelStyle}>Industria</label>
                            <input
                                type="text"
                                name="industry"
                                value={formData.industry}
                                onChange={handleChange}
                                className={inputStyle}
                                placeholder="Ej: Tecnología, Salud, etc."
                            />
                        </div>

                        <div>
                            <label className={labelStyle}>Tamaño</label>
                            <select
                                name="size"
                                value={formData.size}
                                onChange={handleChange}
                                className={selectStyle}
                            >
                                <option value="">Seleccionar...</option>
                                <option value="1-10">1-10 empleados</option>
                                <option value="11-50">11-50 empleados</option>
                                <option value="51-200">51-200 empleados</option>
                                <option value="201-500">201-500 empleados</option>
                                <option value="500+">500+ empleados</option>
                            </select>
                        </div>

                        <div>
                            <label className={labelStyle}>Ciudad</label>
                            <input
                                type="text"
                                name="city"
                                value={formData.city}
                                onChange={handleChange}
                                className={inputStyle}
                                placeholder="Buenos Aires"
                            />
                        </div>

                        <div>
                            <label className={labelStyle}>Provincia</label>
                            <input
                                type="text"
                                name="province"
                                value={formData.province}
                                onChange={handleChange}
                                className={inputStyle}
                                placeholder="CABA"
                            />
                        </div>

                        <div>
                            <label className={labelStyle}>País</label>
                            <input
                                type="text"
                                name="country"
                                value={formData.country}
                                onChange={handleChange}
                                className={inputStyle}
                                placeholder="Argentina"
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
                            placeholder="Calle, número, piso, departamento, código postal..."
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
