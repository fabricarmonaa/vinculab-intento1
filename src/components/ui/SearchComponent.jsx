import React from 'react';

// Ícono de Búsqueda
const SearchIcon = () => (
    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
);

// Este es el componente de la barra de búsqueda
export const SearchComponent = ({ value, onChange }) => {

    // Estilo de input
    const inputStyle = "w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-300 rounded-md focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors";

    return (
        <div className="w-full relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <SearchIcon />
            </div>
            <input
                type="search"
                name="search"
                id="search"
                className={inputStyle}
                placeholder="Buscar por especialidad, puesto o empresa..."
                value={value}
                onChange={onChange}
            />
        </div>
    );
};