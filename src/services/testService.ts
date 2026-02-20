import api from './api';
import { Test, TestAttempt } from '../app/types';

export interface TestSubmission {
    testId: string;
    answers: { questionId: string; selectedAnswer: number }[];
    timeTaken: number;
}

export interface TestResult {
    attempt: TestAttempt;
    corrections: {
        questionId: string;
        questionText: string;
        userAnswer: number;
        correctAnswer: number;
        isCorrect: boolean;
        explanation: string;
    }[];
}

export interface TestSubmissionResponse {
    success: boolean;
    message: string;
    testAttempt: TestAttempt;
    score: number;
    passed: boolean;
    correctCount: number;
    totalQuestions: number;
    // Gamification
    xpEarned: number;
    oldXp: number;
    newTotalXp: number;
    oldLevel: number;
    newLevel: number;
    leveledUp: boolean;
    newLevelTitle: string;
    newBadges: {
        id: string;
        name: string;
        icon: string;
        earnedDate: string;
    }[];
    // Navigation
    nextTest: {
        id: string;
        title: string;
        category: string;
        duration: number;
    } | null;
}

export const testService = {
    // Get all tests
    async getTests(filters?: { difficulty?: string; isPremium?: boolean }): Promise<Test[]> {
        const params = new URLSearchParams();
        if (filters?.difficulty) params.append('difficulty', filters.difficulty);
        if (filters?.isPremium !== undefined) params.append('isPremium', String(filters.isPremium));

        const response = await api.get(`/tests?${params.toString()}`);
        return response.data.tests.map((test: any) => ({
            id: test._id,
            title: test.title,
            description: test.description,
            difficulty: test.difficulty,
            duration: test.duration,
            questions: test.questions?.length || test.questionCount || 0, // Handle populated array or count
            progress: 0, // Calculate from user data if needed
            category: 'Examen', // Default or fetch from test
            passThreshold: test.passThreshold
        }));
    },

    // Get single test by ID
    async getTestById(id: string): Promise<Test> {
        const response = await api.get(`/tests/${id}`);
        // Add safety check
        if (!response.data || !response.data.test) {
            throw new Error('Test data not found in response');
        }
        const test = response.data.test;
        return {
            id: test._id,
            title: test.title,
            description: test.description,
            difficulty: test.difficulty,
            duration: test.duration,
            questions: test.questions || 0, // Return array if populated, else 0/count
            progress: 0,
            category: 'Examen',
            passThreshold: test.passThreshold
        } as unknown as Test;
    },

    // Submit test answers
    async submitTest(submission: TestSubmission): Promise<TestSubmissionResponse> {
        const response = await api.post(`/tests/${submission.testId}/submit`, {
            answers: submission.answers,
            timeTaken: submission.timeTaken,
        });
        return response.data;
    },

    // Get user's test attempts
    async getTestAttempts(): Promise<TestAttempt[]> {
        const response = await api.get('/tests/attempts');
        return response.data.attempts;
    },

    // Get specific test attempt
    async getTestAttemptById(id: string): Promise<TestResult> {
        const response = await api.get(`/tests/attempts/${id}`);
        return response.data;
    },

    // Get test statistics
    async getTestStats(testId: string): Promise<any> {
        const response = await api.get(`/tests/${testId}/stats`);
        return response.data.stats;
    },

    // Admin: Create test
    async createTest(testData: Partial<Test>): Promise<Test> {
        const response = await api.post('/tests', testData);
        return response.data.test;
    },

    // Admin: Update test
    async updateTest(id: string, testData: Partial<Test>): Promise<Test> {
        const response = await api.put(`/tests/${id}`, testData);
        return response.data.test;
    },

    // Admin: Delete test
    async deleteTest(id: string): Promise<void> {
        await api.delete(`/tests/${id}`);
    },
};
