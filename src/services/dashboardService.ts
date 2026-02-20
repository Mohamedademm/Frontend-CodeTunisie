const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

function getAuthHeaders() {
    const token = localStorage.getItem('accessToken');
    return {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
}

export interface DashboardUser {
    _id: string;
    name: string;
    avatar: string;
    isPremium: boolean;
    xp: number;
    level: number;
    xpForNextLevel: number;
    xpProgress: number;
    streak: number;
    lastActivityDate: string;
    badges: { id: string; name: string; icon: string; earnedDate: string }[];
}

export interface DashboardStats {
    totalTests: number;
    passedTests: number;
    failedTests: number;
    averageScore: number;
    coursesCompleted: number;
    coursesInProgress: number;
    totalCourses: number;
}

export interface DashboardData {
    user: DashboardUser;
    stats: DashboardStats;
    weeklyActivity: { day: string; tests: number }[];
    categoryProgress: { name: string; value: number }[];
    recentAttempts: any[];
    newBadges: any[];
}

export const dashboardService = {
    async getDashboard(): Promise<DashboardData> {
        const res = await fetch(`${API_BASE}/users/dashboard`, {
            headers: getAuthHeaders(),
        });
        if (!res.ok) throw new Error('Erreur tableau de bord');
        const data = await res.json();
        return data.dashboard;
    },

    async getIncorrectAnswers() {
        const res = await fetch(`${API_BASE}/users/incorrect-answers`, {
            headers: getAuthHeaders(),
        });
        if (!res.ok) throw new Error('Erreur révision');
        return res.json();
    },
};
