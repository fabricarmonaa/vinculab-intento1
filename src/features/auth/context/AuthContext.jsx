import React, { createContext, useState, useContext, useEffect } from 'react';
import { loginUser, registerUser } from '../services/authService';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('token') || null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const initAuth = async () => {
            const storedToken = localStorage.getItem('token');

            if (storedToken && storedToken !== "undefined") {
                try {
                    const response = await fetch('http://localhost:3000/api/v1/auth/me', {
                        headers: { 'Authorization': `Bearer ${storedToken}` }
                    });

                    if (response.ok) {
                        const data = await response.json();
                        const userData = data.data || data;

                        const userObj = {
                            userId: userData.userId,
                            role: userData.role,
                            email: userData.email,
                            verified: userData.status === 'verified',
                            status: userData.status || 'not_verified' // Usamos el status que viene del backend
                        };

                        setUser(userObj);
                        setToken(storedToken);
                        localStorage.setItem('user', JSON.stringify(userObj));
                    } else {
                        // Si el token no es válido, limpiamos todo
                        console.warn('Token inválido o expirado');
                        localStorage.removeItem('token');
                        localStorage.removeItem('user');
                        setToken(null);
                        setUser(null);
                    }
                } catch (error) {
                    console.error('Error validando sesión:', error);
                    // En caso de error de red, limpiamos por seguridad
                    localStorage.removeItem('token');
                    localStorage.removeItem('user');
                    setToken(null);
                    setUser(null);
                }
            }
            setLoading(false);
        };

        initAuth();
    }, []);

    // Función para LOGUEARSE
    const login = async (email, password) => {
        const data = await loginUser(email, password);

        const userObj = {
            userId: data.userId,
            role: data.role,
            email: data.email,
            verified: data.status === 'verified',
            status: data.status || 'not_verified'
        };

        setUser(userObj);
        setToken(data.token);
        localStorage.setItem('user', JSON.stringify(userObj));
        localStorage.setItem('token', data.token);
        return userObj;
    };

    // Función para REGISTRARSE
    const register = async (formData) => {
        if (formData.role === 'student') {
            formData.status = 'not_verified';
        }
        const data = await registerUser(formData);
        return data;
    };

    // Función para SALIR
    const logout = () => {
        setUser(null);
        setToken(null);
        localStorage.removeItem('user');
        localStorage.removeItem('token');
    };

    // Función extra para actualizar datos
    const updateUserContext = (newUserData) => {
        setUser(newUserData);
        localStorage.setItem('user', JSON.stringify(newUserData));
    };

    return (
        <AuthContext.Provider value={{ user, token, login, register, logout, updateUserContext }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

// Hook para usar esto rápido en cualquier componente
export const useAuth = () => useContext(AuthContext);