import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../features/auth/context/AuthContext';

export const Header = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    const getDashboardPath = () => {
        if (!user) return '/';
        const r = (user.role || '').toUpperCase();
        if (r === 'ESTUDIANTE' || r === 'STUDENT') return '/student/dashboard';
        if (r === 'EMPRESA' || r === 'COMPANY') return '/company/dashboard';
        if (r === 'ESCUELA' || r === 'SCHOOL' || r === 'COLEGIO') return '/school/dashboard';
        return '/';
    };

    return (
        <header className="bg-white border-b border-slate-200 shadow-sm sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                <div className="flex items-center justify-between">
                    <Link to="/" className="flex items-center gap-2">
                        <img src="/logo.png" alt="Logo" className="h-10 w-auto" />
                        <h1 className="text-2xl font-bold text-slate-800">VincuLab</h1>
                    </Link>

                    <div className="flex items-center gap-3">
                        {user ? (
                            <>
                                <Link
                                    to={getDashboardPath()}
                                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                                >
                                    Mi Panel
                                </Link>
                                <button
                                    onClick={handleLogout}
                                    className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors text-sm font-medium"
                                >
                                    Salir
                                </button>
                            </>
                        ) : (
                            <>
                                <Link to="/register" className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors text-sm font-medium">
                                    Registrarse
                                </Link>
                                <Link to="/login" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium">
                                    Ingresar
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
};