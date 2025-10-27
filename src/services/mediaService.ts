import api from './api';
import { Media } from '../types/media';

export const mediaService = {
  // Get media by ID
  getMediaById: async (id: string): Promise<Media> => {
    const response = await api.get(`/api/media/${id}`);
    return response.data;
  },

  // Delete media by ID
  deleteMedia: async (id: string): Promise<void> => {
    await api.delete(`/api/media/${id}`);
  },
};

export default mediaService;

