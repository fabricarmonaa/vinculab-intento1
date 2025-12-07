import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom'; // <-- Importamos Link para el botón "Volver"
import { getJobs } from '../../jobs/services/jobService';
import { JobCard } from '../../jobs/components/JobCard';
import { SearchComponent } from '../../../components/ui/SearchComponent'; // <-- La barra de búsqueda

export const JobFeedPage = () => {
    const [jobs, setJobs] = useState([]);
    const [filteredJobs, setFilteredJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const fetchJobs = async () => {
            try {
                const data = await getJobs();
                setJobs(data);
                setFilteredJobs(data);
            } catch (err) {
                setError(err.message || 'No se pudieron cargar las propuestas');
            } finally {
                setLoading(false);
            }
        };

        fetchJobs();
    }, []);

    // Efecto para filtrar cuando cambia el término de búsqueda
    useEffect(() => {
        if (!searchTerm.trim()) {
            setFilteredJobs(jobs);
            return;
        }
        const lowerTerm = searchTerm.toLowerCase();
        const filtered = jobs.filter(job =>
            job.title.toLowerCase().includes(lowerTerm) ||
            (job.specialty && job.specialty.toLowerCase().includes(lowerTerm)) ||
            (job.companyName && job.companyName.toLowerCase().includes(lowerTerm))
        );
        setFilteredJobs(filtered);
    }, [searchTerm, jobs]);

    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
    };

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-7xl mx-auto">

                {/* --- ¡¡AQUÍ ESTÁ EL BOTÓN QUE TE FALTA!! --- */}
                <div className="mb-6">
                    <Link
                        to="/student/dashboard" // <-- Apunta al dashboard
                        className="text-blue-500 hover:underline"
                    >
                        &larr; Volver al Panel
                    </Link>
                </div>
                {/* ------------------------------------------- */}

                <h2 className="text-3xl font-semibold text-gray-800 mb-6">
                    Propuestas Laborales Abiertas
                </h2>

                {/* --- La barra de búsqueda que movimos --- */}
                <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm mb-6">
                    <SearchComponent value={searchTerm} onChange={handleSearchChange} />
                </div>

                {/* --- El listado de trabajos --- */}
                {loading && <p className="text-center text-gray-600">Cargando propuestas...</p>}
                {error && <p className="text-center text-red-600">{error}</p>}

                {!loading && !error && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredJobs.length > 0 ? (
                            filteredJobs.map(job => (
                                <JobCard key={job.id} job={job} />
                            ))
                        ) : (
                            <p className="text-center text-gray-600 md:col-span-3">
                                No hay propuestas que coincidan con tu búsqueda.
                            </p>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};