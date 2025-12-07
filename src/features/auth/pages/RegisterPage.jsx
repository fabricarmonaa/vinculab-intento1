import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { submitSchoolApplication, getSchools } from '../../school/services/schoolService';

// Permite crear cuentas para Estudiantes, Empresas y Colegios.
export const RegisterPage = () => {
    // Estado para saber qué botón apretó (Estudiante, Empresa o Colegio)
    const [role, setRole] = useState('NULL');

    // Traigo la función 'register' y 'login' de mi contexto global (AuthContext)
    const { register, login } = useAuth();
    const navigate = useNavigate();

    const MAT_INPUT = "block px-2.5 pb-2.5 pt-4 w-full text-sm text-gray-900 bg-transparent rounded-lg border-1 border-gray-300 appearance-none focus:outline-none focus:ring-0 focus:border-blue-600 peer";
    const MAT_LABEL = "absolute text-sm text-gray-500 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-white px-2 peer-focus:px-2 peer-focus:text-blue-600 peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto start-1 pointer-events-none";
    const MAT_TEXTAREA = "block px-2.5 pb-2.5 pt-4 w-full text-sm text-gray-900 bg-transparent rounded-lg border-1 border-gray-300 appearance-none focus:outline-none focus:ring-0 focus:border-blue-600 peer min-h-[100px]";
    const MAT_SELECT = "block px-2.5 pb-2.5 pt-4 w-full text-sm text-gray-900 bg-transparent rounded-lg border-1 border-gray-300 appearance-none focus:outline-none focus:ring-0 focus:border-blue-600 peer";

    // Un único objeto para guardar todos los datos, sin importar el rol.
    const [formData, setFormData] = useState({
        email: '', password: '',
        // Estudiante
        name: '', lastName: '', dni: '', skills: '', cv: null, description: '', schoolId: '',
        // Empresa
        legalName: '', companyName: '', cuit: '', contactEmail: '', phone: '', website: '', address: '', provinceCity: '',
        // Escuela
        schoolName: '', director: '', cue: '', schoolAddress: '',
    });

    const [schools, setSchools] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);

    // Al entrar a la página, buscamos las escuelas disponibles para que el estudiante elija.
    useEffect(() => {
        getSchools().then(setSchools).catch(console.error);
    }, []);

    // Función genérica para guardar lo que escriben en los inputs
    const handleChange = (e) => {
        let { name, value } = e.target;

        // Validaciones solicitadas:
        if (name === 'dni') {
            // Solo números y máximo 7-8 caracteres (usaremos 8 por compatibilidad, aunque pidió 7, recortaremos si excede)
            value = value.replace(/[^0-9]/g, '').slice(0, 8); // Permitimos hasta 8 para no romper DNI actuales, pero filtra solo números.
        } else if (name === 'cuit' || name === 'cue' || name === 'phone') {
            // Solo números
            value = value.replace(/[^0-9]/g, '');
        } else if (name === 'name' || name === 'lastName' || name === 'director') {
            // Solo letras (y espacios)
            value = value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, '');
        }

        setFormData(prev => ({ ...prev, [name]: value }));
        setError(null);
    };

    // Función especial para guardar el archivo PDF
    const handleFileChange = (e) => {
        setFormData(prev => ({ ...prev, cv: e.target.files[0] }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setSuccess(null);

        try {
            if (role === 'student' || role === 'company') {
                let dataToSubmit = { role, email: formData.email, password: formData.password };

                // Preparo los datos específicos según el rol
                if (role === 'student') {
                    if (!formData.schoolId) throw new Error('Debes seleccionar una escuela.');
                    dataToSubmit = {
                        ...dataToSubmit,
                        name: formData.name,
                        lastName: formData.lastName,
                        fullName: `${formData.name} ${formData.lastName}`,
                        dni: formData.dni,
                        skills: formData.skills,
                        cv: formData.cv?.name || 'cv_simulado.pdf',
                        description: formData.description,
                        schoolId: formData.schoolId,
                    };
                } else { // Empresa
                    if (!formData.legalName || !formData.cuit) throw new Error('Razón Social y CUIT son obligatorios.');
                    dataToSubmit = {
                        ...dataToSubmit,
                        legalName: formData.legalName,
                        companyName: formData.companyName,
                        taxId: formData.cuit,
                        contactEmail: formData.contactEmail,
                        phone: formData.phone,
                        website: formData.website,
                        address: formData.address,
                        city: formData.provinceCity,
                    };
                }

                const regResponse = await register(dataToSubmit);

                if (role === 'student' && formData.cv && regResponse) {
                    try {
                        // Primero logueo para obtener el token
                        const tempUser = await login(formData.email, formData.password);
                        if (tempUser && localStorage.getItem('token')) {
                            // Subo el archivo
                            const cvFormData = new FormData();
                            cvFormData.append('cv', formData.cv);

                            await fetch('http://localhost:3000/api/v1/auth/upload-cv', {
                                method: 'POST',
                                headers: {
                                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                                },
                                body: cvFormData
                            });
                        }
                    } catch (cvErr) {
                        console.error('Error uploading CV:', cvErr);
                    }
                }


                // Logueo automáticamente al usuario para que no tenga que hacerlo manual.
                if (regResponse) {
                    try {
                        const user = await login(formData.email, formData.password);
                        if (user) {
                            const userRole = user.role || role;
                            if (userRole === 'ESTUDIANTE' || userRole === 'student') navigate('/student/dashboard');
                            else if (userRole === 'EMPRESA' || userRole === 'company') navigate('/company/dashboard');
                            else navigate('/');
                        }
                    } catch (loginErr) {
                        console.error("Error en auto-login:", loginErr);
                        navigate('/login'); // Si falla el login automático, al login manual
                    }
                }

                // Las escuelas no se crean directo, requieren aprobación.
            } else if (role === 'school') {
                const schoolData = {
                    schoolName: formData.schoolName,
                    directorName: formData.director,
                    cue: formData.cue,
                    address: formData.schoolAddress,
                    email: formData.email,
                    phone: formData.phone,
                };

                const response = await submitSchoolApplication(schoolData);
                setSuccess(response.message || "Solicitud enviada correctamente.");
                setLoading(false);
            }
        } catch (err) {
            console.error(err);
            setError(err.message || 'Error al procesar el registro.');
            setLoading(false);
        }
    };

    // Si todavía no eligió rol, mostramos una pantalla pidiendo que seleccione uno.
    if (role === 'NULL') {
        const roles = [
            {
                id: 'student',
                label: 'Estudiante',
                icon: (
                    <svg className="w-8 h-8 mb-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                    </svg>
                )
            },
            {
                id: 'company',
                label: 'Empresa',
                desc: '',
                icon: (
                    <svg className="w-8 h-8 mb-2 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                )
            },
            {
                id: 'school',
                label: 'Institución',
                desc: '',
                icon: (
                    <svg className="w-8 h-8 mb-2 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z" />
                    </svg>
                )
            }
        ];

        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50 py-12 px-4">
                <div className="bg-white p-8 rounded-2xl shadow-xl border border-slate-100 w-full max-w-4xl text-center">
                    <h2 className="text-3xl font-bold text-slate-800 mb-2">Crear Cuenta</h2>
                    <p className="text-slate-500 mb-10 text-lg">
                        Elige el tipo de perfil que mejor se adapte a tus necesidades.
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {roles.map((r) => (
                            <button
                                key={r.id}
                                onClick={() => setRole(r.id)}
                                className="flex flex-col items-center p-6 bg-white border-2 border-slate-100 rounded-2xl hover:border-blue-500 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group"
                            >
                                <div className="p-4 rounded-full bg-slate-50 group-hover:bg-blue-50 transition-colors mb-4">
                                    {r.icon}
                                </div>
                                <h3 className="text-xl font-bold text-slate-800 mb-2 group-hover:text-blue-600 transition-colors">
                                    {r.label}
                                </h3>
                                <p className="text-sm text-slate-500 leading-relaxed">
                                    {r.desc}
                                </p>
                            </button>
                        ))}
                    </div>

                    <p className="text-center text-sm text-slate-400 mt-12">
                        ¿Ya tenés cuenta?{' '}
                        <Link to="/login" className="text-blue-600 font-semibold hover:underline">
                            Iniciá Sesión
                        </Link>
                    </p>
                </div>
            </div>
        );
    }


    // Muestra inputs diferentes según el rol seleccionado.
    const renderRoleFields = () => {
        if (role === 'student') {
            return (
                <div className="space-y-5 animate-fade-in">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="relative">
                            <input type="text" name="name" id="name" className={MAT_INPUT} placeholder=" " onChange={handleChange} required value={formData.name} />
                            <label htmlFor="name" className={MAT_LABEL}>Nombre</label>
                        </div>
                        <div className="relative">
                            <input type="text" name="lastName" id="lastName" className={MAT_INPUT} placeholder=" " onChange={handleChange} required value={formData.lastName} />
                            <label htmlFor="lastName" className={MAT_LABEL}>Apellido</label>
                        </div>
                    </div>
                    <div className="relative">
                        <input type="text" name="dni" id="dni" maxLength={8} className={MAT_INPUT} placeholder=" " onChange={handleChange} required value={formData.dni} />
                        <label htmlFor="dni" className={MAT_LABEL}>DNI</label>
                    </div>

                    <div className="relative">
                        <select name="schoolId" id="schoolId" className={MAT_SELECT} onChange={handleChange} required value={formData.schoolId}>
                            <option value="" disabled>Selecciona tu Escuela</option>
                            {schools.map(s => (
                                <option key={s.schoolId} value={s.schoolId}>{s.name}</option>
                            ))}
                        </select>
                        <label htmlFor="schoolId" className={MAT_LABEL}>Escuela</label>
                    </div>

                    <div className="relative">
                        <textarea name="skills" id="skills" className={MAT_TEXTAREA} placeholder=" " onChange={handleChange} value={formData.skills} />
                        <label htmlFor="skills" className={MAT_LABEL}>Skills / Habilidades</label>
                    </div>
                    <div className="relative">
                        <textarea name="description" id="description" className={MAT_TEXTAREA} placeholder=" " onChange={handleChange} value={formData.description} />
                        <label htmlFor="description" className={MAT_LABEL}>Perfil Profesional</label>
                    </div>
                    <div className="relative border border-gray-300 rounded-lg p-2 flex flex-col">
                        <span className="text-xs text-gray-500 mb-1 ml-1">Adjuntar CV (PDF)</span>
                        <input type="file" name="cv" onChange={handleFileChange} className="text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 transition-all" accept=".pdf" />
                    </div>
                </div>
            );
        }

        if (role === 'company') {
            return (
                <div className="space-y-5 animate-fade-in">
                    <h3 className="text-sm font-semibold text-blue-600 uppercase tracking-wider border-b pb-1 mt-2">Datos Legales</h3>
                    <div className="relative">
                        <input type="text" name="legalName" id="legalName" className={MAT_INPUT} placeholder=" " onChange={handleChange} required value={formData.legalName} />
                        <label htmlFor="legalName" className={MAT_LABEL}>Razón Social</label>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="relative">
                            <input type="text" name="companyName" id="companyName" className={MAT_INPUT} placeholder=" " onChange={handleChange} value={formData.companyName} />
                            <label htmlFor="companyName" className={MAT_LABEL}>Nombre Fantasía</label>
                        </div>
                        <div className="relative">
                            <input type="text" name="cuit" id="cuit" className={MAT_INPUT} placeholder=" " onChange={handleChange} required value={formData.cuit} />
                            <label htmlFor="cuit" className={MAT_LABEL}>CUIT</label>
                        </div>
                    </div>

                    <h3 className="text-sm font-semibold text-blue-600 uppercase tracking-wider border-b pb-1 mt-4">Contacto</h3>
                    <div className="relative">
                        <input type="email" name="contactEmail" id="contactEmail" className={MAT_INPUT} placeholder=" " onChange={handleChange} required value={formData.contactEmail} />
                        <label htmlFor="contactEmail" className={MAT_LABEL}>Email de Contacto</label>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="relative">
                            <input type="text" name="phone" id="phone" className={MAT_INPUT} placeholder=" " onChange={handleChange} value={formData.phone} />
                            <label htmlFor="phone" className={MAT_LABEL}>Teléfono</label>
                        </div>
                        <div className="relative">
                            <input type="url" name="website" id="website" className={MAT_INPUT} placeholder=" " onChange={handleChange} value={formData.website} />
                            <label htmlFor="website" className={MAT_LABEL}>Website</label>
                        </div>
                    </div>
                    <div className="relative">
                        <input type="text" name="address" id="address" className={MAT_INPUT} placeholder=" " onChange={handleChange} required value={formData.address} />
                        <label htmlFor="address" className={MAT_LABEL}>Dirección</label>
                    </div>
                    <div className="relative">
                        <input type="text" name="provinceCity" id="provinceCity" className={MAT_INPUT} placeholder=" " onChange={handleChange} required value={formData.provinceCity} />
                        <label htmlFor="provinceCity" className={MAT_LABEL}>Provincia / Ciudad</label>
                    </div>
                </div>
            );
        }

        if (role === 'school') {
            return (
                <div className="space-y-5 animate-fade-in">
                    <h3 className="text-sm font-semibold text-blue-600 uppercase tracking-wider border-b pb-1">Datos Institucionales</h3>
                    <div className="relative">
                        <input type="text" name="schoolName" id="schoolName" className={MAT_INPUT} placeholder=" " onChange={handleChange} required value={formData.schoolName} />
                        <label htmlFor="schoolName" className={MAT_LABEL}>Nombre de la Escuela</label>
                    </div>
                    <div className="relative">
                        <input type="text" name="director" id="director" className={MAT_INPUT} placeholder=" " onChange={handleChange} required value={formData.director} />
                        <label htmlFor="director" className={MAT_LABEL}>Director/a</label>
                    </div>
                    <div className="relative">
                        <input type="text" name="cue" id="cue" className={MAT_INPUT} placeholder=" " onChange={handleChange} required value={formData.cue} />
                        <label htmlFor="cue" className={MAT_LABEL}>CUE</label>
                    </div>
                    <div className="relative">
                        <input type="text" name="schoolAddress" id="schoolAddress" className={MAT_INPUT} placeholder=" " onChange={handleChange} required value={formData.schoolAddress} />
                        <label htmlFor="schoolAddress" className={MAT_LABEL}>Dirección</label>
                    </div>
                    <p className="text-xs text-slate-500 italic bg-slate-50 p-2 rounded border border-slate-200">
                        El email y contraseña ingresados arriba se usarán para generar la solicitud.
                    </p>
                </div>
            );
        }
        return null;
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 py-12 px-4">
            <div className="bg-white p-8 rounded-xl shadow-lg border border-slate-100 w-full max-w-lg relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-blue-500"></div>
                <h2 className="text-3xl font-bold text-center text-slate-800 mb-6">Crear Cuenta</h2>

                {/* Selector de Rol (Tabs) */}
                <div className="flex p-1 bg-slate-100 rounded-xl mb-8">
                    {['student', 'company', 'school'].map((r) => (
                        <button
                            key={r}
                            type="button"
                            onClick={() => setRole(r)}
                            className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${role === r
                                ? 'bg-white text-blue-600 shadow-sm'
                                : 'text-slate-500 hover:text-slate-700'
                                }`}
                        >
                            {r === 'student' ? 'Estudiante' : r === 'company' ? 'Empresa' : 'Colegio'}
                        </button>
                    ))}
                </div>

                {/* Mensajes de feedback */}
                {error && (
                    <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 mb-6 text-sm rounded-r">
                        <p className="font-bold">Error</p>
                        <p>{error}</p>
                    </div>
                )}
                {success && (
                    <div className="bg-green-50 border-l-4 border-green-500 text-green-700 p-4 mb-6 text-sm rounded-r">
                        <p className="font-bold">Solicitud Enviada</p>
                        <p>{success}</p>
                    </div>
                )}

                {/* Formulario Principal */}
                {!success && (
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="relative">
                            <input type="email" name="email" id="email" className={MAT_INPUT} placeholder=" " onChange={handleChange} required />
                            <label htmlFor="email" className={MAT_LABEL}>
                                {role === 'school' ? 'Email Institucional' : 'Email de Cuenta'}
                            </label>
                        </div>
                        {role !== 'school' && (
                            <div className="relative">
                                <input type="password" name="password" id="password" className={MAT_INPUT} placeholder=" " onChange={handleChange} required />
                                <label htmlFor="password" className={MAT_LABEL}>Contraseña</label>
                            </div>
                        )}

                        {/* Campos específicos del rol */}
                        {renderRoleFields()}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full mt-6 bg-blue-600 text-white py-3 rounded-lg font-medium uppercase tracking-wide shadow-md hover:bg-blue-700 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-50 active:shadow-sm active:scale-[0.98] transition-all disabled:opacity-60"
                        >
                            {loading ? 'Procesando...' : (role === 'school' ? 'Enviar Solicitud' : 'Registrarme')}
                        </button>
                    </form>
                )}

                <p className="text-center text-sm text-slate-600 mt-8">
                    ¿Ya tenés cuenta?{' '}
                    <Link to="/login" className="text-blue-600 font-semibold hover:underline transition-colors">
                        Iniciá Sesión
                    </Link>
                </p>
            </div>
        </div>
    );
};  