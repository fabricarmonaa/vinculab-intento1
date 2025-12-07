import { Routes, Route, Navigate } from 'react-router-dom';

// Layouts y Páginas Públicas
import { PublicLayout } from '../layouts/PublicLayout';
import { HomePage } from '../pages/HomePage';
import { LoginPage } from '../features/auth/pages/LoginPage';
import { RegisterPage } from '../features/auth/pages/RegisterPage';

// Seguridad (Componente que protege rutas privadas)
import { ProtectedRoute } from './ProtectedRoute';

// Estudiante (Páginas exclusivas para el rol Estudiante)
import { StudentDashboard } from '../features/student/pages/StudentDashboard';
import { JobFeedPage } from '../features/student/pages/JobFeedPage';
import { JobDetailPage } from '../features/student/pages/JobDetailPage';
import { MyApplicationsPage } from '../features/student/pages/MyApplicationsPage';
import { StudentEditProfilePage } from '../features/student/pages/StudentEditProfilePage';

// Empresa (Páginas exclusivas para el rol Empresa)
import { CompanyDashboard } from '../features/company/pages/CompanyDashboard';
import { CreateJobPage } from '../features/company/pages/CreateJobPage';
import { MyPostingsPage } from '../features/company/pages/MyPostingsPage';
import { EditJobPage } from '../features/company/pages/EditJobPage';
import { ApplicantsPage } from '../features/company/pages/ApplicantsPage';
import { CompanyEditProfilePage } from '../features/company/pages/CompanyEditProfilePage';

// Colegio (Páginas exclusivas para el rol Colegio)
import { SchoolDashboard } from '../features/school/pages/SchoolDashboard';
import { VerificationQueuePage } from '../features/school/pages/VerificationQueuePage';
import { SchoolStudentsPage } from '../features/school/pages/SchoolStudentsPage';
import { SchoolEditProfilePage } from '../features/school/pages/SchoolEditProfilePage';

export const AppRoutes = () => {
    return (
        <Routes>

            <Route element={<PublicLayout />}>
                <Route path="/" element={<HomePage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
            </Route>


            <Route element={<ProtectedRoute allowedRole="student" />}>
                <Route path="/student/dashboard" element={<StudentDashboard />} />
                <Route path="/student/propuestas" element={<JobFeedPage />} />
                <Route path="/student/propuesta/:id" element={<JobDetailPage />} />
                <Route path="/student/mis-postulaciones" element={<MyApplicationsPage />} />
                <Route path="/student/perfil/editar" element={<StudentEditProfilePage />} />
            </Route>


            <Route element={<ProtectedRoute allowedRole="company" />}>
                <Route path="/company/dashboard" element={<CompanyDashboard />} />
                <Route path="/company/crear-propuesta" element={<CreateJobPage />} />
                <Route path="/company/mis-propuestas" element={<MyPostingsPage />} />
                <Route path="/company/propuesta/editar/:id" element={<EditJobPage />} />
                <Route path="/company/propuesta/:id/postulantes" element={<ApplicantsPage />} />
                <Route path="/company/perfil/editar" element={<CompanyEditProfilePage />} />
            </Route>


            <Route element={<ProtectedRoute allowedRole="school" />}>
                <Route path="/school/dashboard" element={<SchoolDashboard />} />
                <Route path="/school/verificar" element={<VerificationQueuePage />} />
                <Route path="/school/alumnos" element={<SchoolStudentsPage />} />
                <Route path="/school/perfil/editar" element={<SchoolEditProfilePage />} />
            </Route>


            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    );
};