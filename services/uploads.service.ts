import apiClient from '../lib/axios';

const uploadsService = {
  uploadAvatar: async (file: File, onProgress?: (p: number) => void) => {
    const form = new FormData();
    form.append('avatar', file, file.name);
    const resp = await apiClient.upload('/uploads/avatar', form, (ev: any) => {
      if (onProgress && ev.total) onProgress(Math.round((ev.loaded * 100) / ev.total));
    });
    return resp.data; // expected { url: '...' } or similar
  },

  uploadBanner: async (file: File, onProgress?: (p: number) => void) => {
    const form = new FormData();
    form.append('banner', file, file.name);
    const resp = await apiClient.upload('/uploads/banner', form, (ev: any) => {
      if (onProgress && ev.total) onProgress(Math.round((ev.loaded * 100) / ev.total));
    });
    return resp.data;
  }
};

export default uploadsService;
