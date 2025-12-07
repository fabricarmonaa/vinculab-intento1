// frontEnd/src/routes/ProtectedRoute.jsx
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../features/auth/context/AuthContext';


const ROLE_HOME = {
  student: '/student/dashboard',
  company: '/company/dashboard',
  school: '/school/dashboard',
};

const normalizeRole = (role) => {
  if (!role) return null;
  const r = role.toUpperCase();
  if (r === 'ESTUDIANTE' || r === 'STUDENT') return 'student';
  if (r === 'EMPRESA' || r === 'COMPANY') return 'company';
  if (r === 'ESCUELA' || r === 'SCHOOL' || r === 'COLEGIO') return 'school';
  return role;
};


export function ProtectedRoute({ allowedRole }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-slate-600">
        Cargando sesión...
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const userRole = normalizeRole(user.role);

  if (allowedRole && userRole !== allowedRole) {
    const redirectTo = ROLE_HOME[userRole] || '/';
    return <Navigate to={redirectTo} replace />;
  }

  return <Outlet />;
}
