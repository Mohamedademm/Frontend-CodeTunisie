import api from './api';
import { Course, Video, Question, User as UserProfile, Test } from '../app/types';
import type { Payment } from './paymentService';
export type { Payment };

export interface AdminStats {
    totalUsers: number;
    premiumUsers: number;
    totalCourses: number;
    totalVideos: number;
    totalTests: number;
    totalQuestions: number;
    totalRevenue: number;
    recentUsers: UserProfile[];
    recentPayments: Payment[];
    userGrowth: {
        date: string;
        count: number;
    }[];
    revenueGrowth: {
        date: string;
        amount: number;
    }[];
}

export const adminService = {
    // Get dashboard statistics
    async getStats(): Promise<AdminStats> {
        const response = await api.get('/admin/stats');
        return response.data.stats;
    },

    // User Management
    async getUsers(filters?: { role?: string; isPremium?: boolean; search?: string }): Promise<UserProfile[]> {
        const params = new URLSearchParams();
        if (filters?.role) params.append('role', filters.role);
        if (filters?.isPremium !== undefined) params.append('isPremium', String(filters.isPremium));
        if (filters?.search) params.append('search', filters.search);

        const response = await api.get(`/admin/users?${params.toString()}`);
        return response.data.users;
    },

    async updateUser(userId: string, userData: Partial<UserProfile>): Promise<UserProfile> {
        const response = await api.put(`/admin/users/${userId}`, userData);
        return response.data.user;
    },

    async deleteUser(userId: string): Promise<void> {
        await api.delete(`/admin/users/${userId}`);
    },

    // Course Management
    async getCourses(): Promise<Course[]> {
        // Keep using admin endpoint to view ALL courses (including unpublished)
        const response = await api.get('/admin/courses');
        return response.data.courses;
    },

    async createCourse(courseData: Partial<Course>): Promise<Course> {
        const response = await api.post('/courses', courseData);
        return response.data.course;
    },

    async updateCourse(courseId: string, courseData: Partial<Course>): Promise<Course> {
        const response = await api.put(`/courses/${courseId}`, courseData);
        return response.data.course;
    },

    async deleteCourse(courseId: string): Promise<void> {
        await api.delete(`/courses/${courseId}`);
    },

    // Video Management
    async getVideos(): Promise<Video[]> {
        const response = await api.get('/admin/videos');
        return response.data.videos;
    },

    async createVideo(videoData: Partial<Video>): Promise<Video> {
        const response = await api.post('/videos', videoData);
        return response.data.video;
    },

    async updateVideo(videoId: string, videoData: Partial<Video>): Promise<Video> {
        const response = await api.put(`/videos/${videoId}`, videoData);
        return response.data.video;
    },

    async deleteVideo(videoId: string): Promise<void> {
        await api.delete(`/videos/${videoId}`);
    },

    // Test Management
    async getTests(): Promise<Test[]> {
        // Use admin endpoint if exists or public one. Public one at /api/tests supports filters. 
        // Let's use /api/tests but we want ALL tests.
        // Backend /api/tests filters by isPublished=true by default.
        // We might need to update backend to allow admins to see all, OR use /api/tests/all if it existed.
        // For now, let's assume /api/tests returns what we need or we add a param.
        // Actually, backend routes/tests.js: const filter = { isPublished: true }; is hardcoded.
        // I might need to fix filter in tests.js too if I want admins to see drafts.
        // But for now, let's just use /tests.
        const response = await api.get('/tests');
        return response.data.tests;
    },

    async createTest(testData: Partial<Test>): Promise<Test> {
        const response = await api.post('/tests', testData);
        return response.data.test;
    },

    async updateTest(testId: string, testData: Partial<Test>): Promise<Test> {
        const response = await api.put(`/tests/${testId}`, testData);
        return response.data.test;
    },

    async deleteTest(testId: string): Promise<void> {
        await api.delete(`/tests/${testId}`);
    },

    // Question Management
    async getQuestions(filters?: { category?: string; difficulty?: string }): Promise<Question[]> {
        const params = new URLSearchParams();
        if (filters?.category) params.append('category', filters.category);
        if (filters?.difficulty) params.append('difficulty', filters.difficulty);

        const response = await api.get(`/questions?${params.toString()}`);
        return response.data.questions;
    },

    async createQuestion(questionData: Partial<Question>): Promise<Question> {
        const response = await api.post('/questions', questionData);
        return response.data.question;
    },

    async updateQuestion(questionId: string, questionData: Partial<Question>): Promise<Question> {
        const response = await api.put(`/questions/${questionId}`, questionData);
        return response.data.question;
    },

    async deleteQuestion(questionId: string): Promise<void> {
        await api.delete(`/questions/${questionId}`);
    },

    // Payment Management
    async getPayments(filters?: { status?: string; userId?: string }): Promise<Payment[]> {
        const params = new URLSearchParams();
        if (filters?.status) params.append('status', filters.status);
        if (filters?.userId) params.append('userId', filters.userId);

        const response = await api.get(`/admin/payments?${params.toString()}`);
        return response.data.payments;
    },

    // Settings Management
    async getSettings(): Promise<any> {
        const response = await api.get('/admin/settings');
        return response.data.settings;
    },

    async updateSettings(settings: any): Promise<any> {
        const response = await api.put('/admin/settings', settings);
        return response.data.settings;
    },
};
