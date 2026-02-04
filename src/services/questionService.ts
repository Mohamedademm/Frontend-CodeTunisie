import api from './api';
import { Question } from './testService';

export interface QuestionFilters {
    category?: string;
    difficulty?: 'easy' | 'medium' | 'hard';
    search?: string;
}

export const questionService = {
    // Get all questions (admin only)
    async getQuestions(filters?: QuestionFilters): Promise<Question[]> {
        const params = new URLSearchParams();
        if (filters?.category) params.append('category', filters.category);
        if (filters?.difficulty) params.append('difficulty', filters.difficulty);
        if (filters?.search) params.append('search', filters.search);

        const response = await api.get(`/questions?${params.toString()}`);
        return response.data.questions;
    },

    // Get single question by ID
    async getQuestionById(id: string): Promise<Question> {
        const response = await api.get(`/questions/${id}`);
        return response.data.question;
    },

    // Get random questions for practice
    async getRandomQuestions(count: number = 10, filters?: QuestionFilters): Promise<Question[]> {
        const params = new URLSearchParams();
        params.append('count', String(count));
        if (filters?.category) params.append('category', filters.category);
        if (filters?.difficulty) params.append('difficulty', filters.difficulty);

        const response = await api.get(`/questions/random?${params.toString()}`);
        return response.data.questions;
    },

    // Admin: Create question
    async createQuestion(questionData: Partial<Question>): Promise<Question> {
        const response = await api.post('/questions', questionData);
        return response.data.question;
    },

    // Admin: Update question
    async updateQuestion(id: string, questionData: Partial<Question>): Promise<Question> {
        const response = await api.put(`/questions/${id}`, questionData);
        return response.data.question;
    },

    // Admin: Delete question
    async deleteQuestion(id: string): Promise<void> {
        await api.delete(`/questions/${id}`);
    },
};
