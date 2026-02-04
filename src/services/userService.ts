import api from './api';

export interface UserProfile {
    _id: string;
    name: string;
    email: string;
    phone?: string;
    avatar?: string;
    role: 'user' | 'admin';
    isPremium: boolean;
    premiumExpiryDate?: string;
    coursesCompleted: string[];
    testsTaken: string[];
    createdAt: string;
    updatedAt: string;
}

export interface UserProgress {
    totalCoursesCompleted: number;
    totalTestsTaken: number;
    totalTestsPassed: number;
    averageScore: number;
    recentActivity: {
        type: 'course' | 'test';
        title: string;
        date: string;
        score?: number;
    }[];
}

export interface UserStats {
    coursesCompleted: number;
    totalTests: number;
    passedTests: number;
    averageScore: number;
}

export interface DashboardData {
    user: UserProfile;
    stats: UserStats;
    recentAttempts: any[]; // We can import TestAttempt from types.ts if available
}

export const userService = {
    // Get current user profile with stats
    async getProfile(): Promise<DashboardData> {
        const response = await api.get('/users/profile');
        return {
            user: response.data.user,
            stats: response.data.stats,
            recentAttempts: response.data.recentAttempts
        };
    },

    // Update user profile
    async updateProfile(profileData: Partial<UserProfile>): Promise<UserProfile> {
        const response = await api.put('/users/profile', profileData);
        return response.data.user;
    },

    // Upload avatar
    async uploadAvatar(file: File): Promise<{ avatarUrl: string; user: UserProfile }> {
        const formData = new FormData();
        formData.append('avatar', file);

        const response = await api.post('/users/avatar', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return {
            avatarUrl: response.data.avatarUrl, // Assuming backend returns this
            user: response.data.user // Backend typically returns updated user
        };
    },

    // Get user progress
    async getProgress(): Promise<UserProgress> {
        const response = await api.get('/users/progress');
        return response.data.progress;
    },

    // Change password
    async changePassword(passwordData: { currentPassword: string; newPassword: string }): Promise<{ message: string }> {
        const response = await api.put('/users/change-password', passwordData);
        return response.data;
    },
};
