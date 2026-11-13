import { api } from './api';
import { Category } from '../types';

export const categoriesService = {
  async getCategories(): Promise<Category[]> {
    try {
      const res = await api.get<any>('/categories');
      if (Array.isArray(res?.data)) return res.data;
      if (Array.isArray(res)) return res;
      return [];
    } catch (err) {
      console.error('Error al cargar categorías:', err);
      return [];
    }
  },

  async getCategoryById(id: string): Promise<Category | null> {
    try {
      const res = await api.get<any>(`/categories/${id}`);
      return res?.data || res || null;
    } catch (err) {
      console.error(`Error al cargar categoría ${id}:`, err);
      return null;
    }
  },
};
