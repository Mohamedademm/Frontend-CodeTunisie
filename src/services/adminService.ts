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
    async getStats(): Promise<AdminStats> {
        const response = await api.get('/admin/stats');
        return response.data.stats;
    },

    async getUsers(filters?: { role?: string; isPremium?: boolean; search?: string }): Promise<UserProfile[]> {
        const params = new URLSearchParams();
        if (filters?.role) params.append('role', filters.role);
        if (filters?.isPremium !== undefined) params.append('isPremium', String(filters.isPremium));
        if (filters?.search) params.append('search', filters.search);

        const response = await api.get(`/admin/users?${params.toString()}`);
        return response.data.users;
    },

    async createUser(userData: Partial<UserProfile> & { password?: string }): Promise<UserProfile> {
        const response = await api.post('/admin/users', userData);
        return response.data.user;
    },

    async updateUser(userId: string, userData: Partial<UserProfile>): Promise<UserProfile> {
        const response = await api.put(`/admin/users/${userId}`, userData);
        return response.data.user;
    },

    async deleteUser(userId: string): Promise<void> {
        await api.delete(`/admin/users/${userId}`);
    },

    async getCourses(): Promise<Course[]> {
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

    async getVideos(): Promise<Video[]> {
        const response = await api.get('/admin/videos');
        return response.data.videos;
    },

    async createVideo(videoData: Partial<Video> | FormData): Promise<Video> {
        const isFormData = videoData instanceof FormData;
        const response = await api.post('/videos', videoData, isFormData ? {
            headers: { 'Content-Type': 'multipart/form-data' },
        } : undefined);
        return response.data.video;
    },

    async updateVideo(videoId: string, videoData: Partial<Video> | FormData): Promise<Video> {
        const isFormData = videoData instanceof FormData;
        const response = await api.put(`/videos/${videoId}`, videoData, isFormData ? {
            headers: { 'Content-Type': 'multipart/form-data' },
        } : undefined);
        return response.data.video;
    },

    async deleteVideo(videoId: string): Promise<void> {
        await api.delete(`/videos/${videoId}`);
    },

    async getTests(): Promise<Test[]> {
        const response = await api.get('/tests');
        return response.data.tests;
    },

    async getTestById(id: string): Promise<Test> {
        const response = await api.get(`/tests/${id}`);
        return response.data.test;
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

    async getPayments(filters?: { status?: string; userId?: string }): Promise<Payment[]> {
        const params = new URLSearchParams();
        if (filters?.status) params.append('status', filters.status);
        if (filters?.userId) params.append('userId', filters.userId);

        const response = await api.get(`/admin/payments?${params.toString()}`);
        return response.data.payments;
    },

    async getSettings(): Promise<any> {
        const response = await api.get('/admin/settings');
        return response.data.settings;
    },

    async updateSettings(settings: any): Promise<any> {
        const response = await api.put('/admin/settings', settings);
        return response.data.settings;
    },

    async uploadQuestionImage(formData: FormData): Promise<{ success: boolean; message: string; data: { url: string; filename: string; size: number; uploadedAt: Date } }> {
        const response = await api.post('/admin/upload-question-image', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    },

    async deleteQuestionImage(filename: string): Promise<void> {
        await api.delete(`/admin/delete-question-image/${filename}`);
    },
};

export default adminService;
