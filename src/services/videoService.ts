import api from './api';
import { Video } from '../app/types';

export interface VideoFilters {
    category?: string;
    isPremium?: boolean;
    search?: string;
}

export const videoService = {
    async getVideos(filters?: VideoFilters): Promise<Video[]> {
        const params = new URLSearchParams();
        if (filters?.category) params.append('category', filters.category);
        if (filters?.isPremium !== undefined) params.append('isPremium', String(filters.isPremium));
        if (filters?.search) params.append('search', filters.search);

        const response = await api.get(`/videos?${params.toString()}`);
        return response.data.videos.map((video: any) => ({
            id: video._id,
            title: video.title,
            description: video.description,
            category: video.category,
            duration: video.duration || '0:00',
            progress: 0,
            thumbnail: video.thumbnail || video.imageUrl || '',
            url: video.videoUrl || video.url || '',
            videoType: video.videoType || 'url',
            views: video.viewCount || 0,
            isPremium: video.isPremium || false
        }));
    },

    async getVideoById(id: string): Promise<Video> {
        const response = await api.get(`/videos/${id}`);
        const video = response.data.video;
        return {
            id: video._id,
            title: video.title,
            description: video.description,
            category: video.category,
            duration: video.duration || '0:00',
            progress: 0,
            thumbnail: video.thumbnail || video.imageUrl || '',
            url: video.videoUrl || video.url || '',
            views: video.viewCount || 0
        };
    },

    async getVideosByCategory(category: string): Promise<Video[]> {
        const response = await api.get(`/videos/category/${category}`);
        return response.data.videos.map((video: any) => ({
            id: video._id,
            title: video.title,
            description: video.description,
            category: video.category,
            duration: video.duration || '0:00',
            progress: 0,
            thumbnail: video.thumbnail || video.imageUrl || '',
            url: video.videoUrl || video.url || '',
            views: video.viewCount || 0
        }));
    },

    async incrementViewCount(id: string): Promise<void> {
        await api.post(`/videos/${id}/view`);
    },

    async createVideo(videoData: Partial<Video>): Promise<Video> {
        const response = await api.post('/videos', videoData);
        return response.data.video;
    },

    async updateVideo(id: string, videoData: Partial<Video>): Promise<Video> {
        const response = await api.put(`/videos/${id}`, videoData);
        return response.data.video;
    },

    async deleteVideo(id: string): Promise<void> {
        await api.delete(`/videos/${id}`);
    },
};
