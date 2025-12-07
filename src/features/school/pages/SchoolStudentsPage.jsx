import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getVerifiedStudents } from '../services/schoolService'; // Asegurate que este servicio exista
import { useAuth } from '../../auth/context/AuthContext';

export const SchoolStudentsPage = () => {
    const { token } = useAuth();
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchVerified = async () => {
            try {
                const data = await getVerifiedStudents(token);
                setStudents(data);
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };
        fetchVerified();
    }, [token]);

    return (
        <div className="min-h-screen bg-slate-50 p-6 md:p-10 font-sans">
            <div className="max-w-6xl mx-auto">

                <div className="mb-6">
                    <Link to="/school/dashboard" className="inline-flex items-center text-sm text-slate-500 hover:text-purple-600 transition-colors">
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                        Volver al Panel
                    </Link>
                </div>

                <header className="mb-8">
                    <h2 className="text-3xl font-bold text-slate-800">Nómina de Egresados</h2>
                    <p className="text-slate-500 mt-1">Listado de alumnos que ya han sido verificados por la institución.</p>
                </header>

                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                    {loading && <div className="p-8 text-center text-slate-500">Cargando nómina...</div>}

                    {!loading && students.length > 0 && (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                                        <th className="p-5">Nombre</th>
                                        <th className="p-5">Apellido</th>
                                        <th className="p-5">DNI</th>
                                        <th className="p-5">Email</th>
                                        <th className="p-5">Estado</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {students.map(student => (
                                        <tr key={student.id} className="hover:bg-slate-50 transition-colors">
                                            <td className="p-5 text-slate-700 font-medium">{student.studentName || student.fullName || student.name}</td>
                                            <td className="p-5 text-slate-700 font-medium">-</td>
                                            <td className="p-5 text-slate-600">{student.dni || '-'}</td>
                                            <td className="p-5 text-slate-600">{student.studentEmail || student.email}</td>
                                            <td className="p-5">
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
                                                    Verificado
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {!loading && students.length === 0 && (
                        <div className="p-12 text-center">
                            <p className="text-slate-500">Aún no hay alumnos verificados.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};