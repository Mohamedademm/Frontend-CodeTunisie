import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authService, LoginCredentials, RegisterData, AuthResponse } from '@/services/authService';

interface User {
    id: string;
    name: string;
    email: string;
    avatar?: string;
    role: 'user' | 'admin';
    isPremium: boolean;
    premiumExpiryDate?: string;
}

interface AuthContextType {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (credentials: LoginCredentials) => Promise<void>;
    register: (data: RegisterData) => Promise<void>;
    logout: () => Promise<void>;
    updateUser: (user: User) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

interface AuthProviderProps {
    children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Load user from localStorage on mount
    useEffect(() => {
        const loadUser = () => {
            try {
                const storedUser = localStorage.getItem('user');
                const accessToken = localStorage.getItem('accessToken');

                if (storedUser && accessToken) {
                    setUser(JSON.parse(storedUser));
                }
            } catch (error) {
                console.error('Error loading user:', error);
                localStorage.removeItem('user');
                localStorage.removeItem('accessToken');
                localStorage.removeItem('refreshToken');
            } finally {
                setIsLoading(false);
            }
        };

        loadUser();
    }, []);

    const handleAuthResponse = (response: AuthResponse) => {
        const { user, accessToken, refreshToken } = response;

        // Store tokens and user data
        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', refreshToken);
        localStorage.setItem('user', JSON.stringify(user));

        setUser(user);
    };

    const login = async (credentials: LoginCredentials) => {
        try {
            const response = await authService.login(credentials);
            handleAuthResponse(response);
        } catch (error: any) {
            throw new Error(error.response?.data?.message || 'Login failed');
        }
    };

    const register = async (data: RegisterData) => {
        try {
            const response = await authService.register(data);
            handleAuthResponse(response);
        } catch (error: any) {
            throw new Error(error.response?.data?.message || 'Registration failed');
        }
    };

    const logout = async () => {
        try {
            await authService.logout();
        } finally {
            setUser(null);
        }
    };

    const updateUser = (updatedUser: User) => {
        setUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
    };

    const value: AuthContextType = {
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        logout,
        updateUser,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
