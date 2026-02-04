import api from './api';
import { Course } from '../app/types';

export interface CourseFilters {
    category?: string;
    isPremium?: boolean;
    search?: string;
}

export const courseService = {
    // Get all courses with optional filters
    async getCourses(filters?: CourseFilters): Promise<Course[]> {
        const params = new URLSearchParams();
        if (filters?.category) params.append('category', filters.category);
        if (filters?.isPremium !== undefined) params.append('isPremium', String(filters.isPremium));
        if (filters?.search) params.append('search', filters.search);

        const response = await api.get(`/courses?${params.toString()}`);

        // Map backend response to frontend Course type
        return response.data.courses.map((course: any) => ({
            id: course._id,
            title: course.title,
            description: course.description,
            category: course.category,
            duration: course.duration,
            progress: 0, // Initial progress, will be updated with user data
            icon: course.icon,
            lessons: course.lessons,
            difficulty: course.difficulty,
            isPremium: course.isPremium
        }));
    },

    // Get single course by ID
    async getCourseById(id: string): Promise<Course> {
        const response = await api.get(`/courses/${id}`);
        const course = response.data.course;

        return {
            id: course._id,
            title: course.title,
            description: course.description,
            category: course.category,
            duration: course.duration,
            progress: 0,
            icon: course.icon,
            lessons: course.lessons,
            difficulty: course.difficulty,
            isPremium: course.isPremium,
            content: course.content // Include content
        } as unknown as Course; // Cast as Course to avoid strict type mismatch if isPremium is missing in types
    },

    // Get courses by category
    async getCoursesByCategory(category: string): Promise<Course[]> {
        const response = await api.get(`/courses/category/${category}`);
        return response.data.courses.map((course: any) => ({
            id: course._id,
            title: course.title,
            description: course.description,
            category: course.category,
            duration: course.duration,
            progress: 0,
            icon: course.icon,
            lessons: course.lessons,
            difficulty: course.difficulty
        }));
    },

    // Increment view count
    async incrementViewCount(id: string): Promise<void> {
        await api.post(`/courses/${id}/view`);
    },

    // Mark course as completed
    async markAsCompleted(id: string): Promise<void> {
        await api.post(`/courses/${id}/complete`);
    },

    // Admin: Create course
    async createCourse(courseData: Partial<Course>): Promise<Course> {
        const response = await api.post('/courses', courseData);
        return response.data.course;
    },

    // Admin: Update course
    async updateCourse(id: string, courseData: Partial<Course>): Promise<Course> {
        const response = await api.put(`/courses/${id}`, courseData);
        return response.data.course;
    },

    // Admin: Delete course
    async deleteCourse(id: string): Promise<void> {
        await api.delete(`/courses/${id}`);
    },
};
