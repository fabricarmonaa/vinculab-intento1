import { useState } from 'react';
import { updateStudentStatus } from '../services/schoolService'; // <-- ¡Usamos el nuevo servicio!

// Recibe el 'student' y la función 'onUpdate'
export const VerificationRow = ({ student, onUpdate }) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleUpdate = async (newStatus) => {
        setLoading(true);
        setError(null);
        try {
            const token = localStorage.getItem('token'); // Token del Colegio
            await updateStudentStatus(student.id, newStatus, token);
            onUpdate(); // Llama al padre para refrescar la lista
        } catch (err) {
            setError(err.message || 'Error al actualizar');
            setLoading(false);
        }
    };

    return (
        <tr className="border-b border-gray-200">
            <td className="p-4">{student.name}</td>
            <td className="p-4">{student.lastName}</td>
            <td className="p-4">{student.dni}</td>
            <td className="p-4">{student.email}</td>
            <td className="p-4">
                <div className="flex gap-2">
                    <button
                        onClick={() => handleUpdate('verified')} // Botón de Aprobar
                        disabled={loading}
                        className="bg-green-500 text-white px-3 py-1 rounded-md text-sm hover:bg-green-600 disabled:opacity-50"
                    >
                        Verificar
                    </button>
                    <button
                        onClick={() => handleUpdate('rejected')} // Botón de Rechazar
                        disabled={loading}
                        className="bg-red-500 text-white px-3 py-1 rounded-md text-sm hover:bg-red-600 disabled:opacity-50"
                    >
                        Rechazar
                    </button>
                </div>
                {error && <p className="text-red-600 text-xs mt-1">{error}</p>}
            </td>
        </tr>
    );
};