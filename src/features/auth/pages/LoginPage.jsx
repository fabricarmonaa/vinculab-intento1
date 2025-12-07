
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

// Formulario para que los usuarios (de cualquier rol) inicien sesión.
export const LoginPage = () => {
    // Estados locales para los inputs
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const [authLoading, setAuthLoading] = useState(false);
    const [authError, setAuthError] = useState(null);

    // Hooks de navegación y autenticación
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault(); 
        setAuthLoading(true);
        setAuthError(null);

        try {
            // Intentamos loguear con la función del AuthContext
            const user = await login(email, password);

            // Si el login es exitoso, redirigimos según el rol
            if (user) {
                const role = user.role || '';
                if (role === 'student' || role === 'ESTUDIANTE') navigate('/student/dashboard');
                else if (role === 'company' || role === 'EMPRESA') navigate('/company/dashboard');
                else if (role === 'school' || role === 'ESCUELA') navigate('/school/dashboard');
                else navigate('/');
            }
        } catch (err) {
            // Si falla, mostramos mensaje de error
            setAuthError('Credenciales incorrectas. Por favor, verificá tus datos.');
            setAuthLoading(false);
        }
    };

    const inputStyle = "w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-md focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500";

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
            <div className="bg-white p-8 rounded-xl shadow-lg border border-slate-100 w-full max-w-md relative overflow-hidden">

                {/* Decoración superior */}
                <div className="absolute top-0 left-0 w-full h-1 bg-blue-500"></div>

                <h2 className="text-3xl font-bold text-center text-slate-800 mb-2">
                    Iniciar Sesión
                </h2>
                <p className="text-center text-slate-500 mb-8">
                    Accedé a tu cuenta de VincuLab
                </p>

                {/* Mensaje de Error */}
                {authError && (
                    <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 mb-6 text-sm rounded-r">
                        <p className="font-bold">Error de acceso</p>
                        <p>{authError}</p>
                    </div>
                )}

                {/* Formulario */}
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-gray-600 text-sm font-medium mb-2">Correo Electrónico</label>
                        <input
                            type="email"
                            className={inputStyle}
                            placeholder="nombre@ejemplo.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-gray-600 text-sm font-medium mb-2">Contraseña</label>
                        <input
                            type="password"
                            className={inputStyle}
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={authLoading}
                        className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium uppercase tracking-wide shadow-md hover:bg-blue-700 transition-all disabled:opacity-60"
                    >
                        {authLoading ? 'Ingresando...' : 'INGRESAR'}
                    </button>

                </form>

                <p className="text-center text-sm text-slate-600 mt-8">
                    ¿No tenés cuenta?{' '}
                    <Link to="/register" className="text-blue-600 font-semibold hover:underline transition-colors">
                        Registrate aquí
                    </Link>
                </p>
            </div>
        </div>
    );
};
