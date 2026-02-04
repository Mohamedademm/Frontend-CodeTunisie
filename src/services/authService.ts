import api, { API_BASE_URL } from './api';

export interface LoginCredentials {
    email: string;
    password: string;
}

export interface RegisterData {
    name: string;
    email: string;
    password: string;
    phone?: string;
}

export interface AuthResponse {
    user: {
        id: string;
        name: string;
        email: string;
        avatar?: string;
        role: 'user' | 'admin';
        isPremium: boolean;
        premiumExpiryDate?: string;
    };
    accessToken: string;
    refreshToken: string;
}

export const authService = {
    // Register new user
    async register(data: RegisterData): Promise<AuthResponse> {
        const response = await api.post('/auth/register', data);
        return response.data;
    },

    // Login user
    async login(credentials: LoginCredentials): Promise<AuthResponse> {
        const response = await api.post('/auth/login', credentials);
        return response.data;
    },

    // Logout user
    async logout(): Promise<void> {
        try {
            await api.post('/auth/logout');
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            localStorage.removeItem('user');
        }
    },

    // Refresh token
    async refreshToken(refreshToken: string): Promise<{ accessToken: string }> {
        const response = await api.post('/auth/refresh', { refreshToken });
        return response.data;
    },

    // Forgot password
    async forgotPassword(email: string): Promise<{ message: string }> {
        const response = await api.post('/auth/forgot-password', { email });
        return response.data;
    },

    // Reset password
    async resetPassword(token: string, newPassword: string): Promise<{ message: string }> {
        const response = await api.post('/auth/reset-password', { token, newPassword });
        return response.data;
    },

    // Google OAuth login
    getGoogleAuthUrl(): string {
        return `${API_BASE_URL}/auth/google`;
    },
};
