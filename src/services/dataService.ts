import { Quadricycle, Review } from '../types';

const API_BASE = '/api';

// Helper to check if API is available
async function isApiAvailable(): Promise<boolean> {
  try {
    const resp = await fetch(`${API_BASE}/quadricycles`, { method: 'HEAD' });
    return resp.ok;
  } catch {
    return false;
  }
}

// LocalStorage Keys
const LS_KEY = 'quadricycles_data';

export const dataService = {
  async getAll(): Promise<Quadricycle[]> {
    try {
      const resp = await fetch(`${API_BASE}/quadricycles`);
      if (resp.ok) {
        const data = await resp.json();
        localStorage.setItem(LS_KEY, JSON.stringify(data));
        return data;
      }
    } catch (e) {
      console.warn('API unavailable, loading from LocalStorage');
    }
    const saved = localStorage.getItem(LS_KEY);
    return saved ? JSON.parse(saved) : [];
  },

  async save(quad: Quadricycle): Promise<boolean> {
    try {
      const resp = await fetch(`${API_BASE}/quadricycles`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(quad),
      });
      if (resp.ok) return true;
    } catch (e) {
      console.warn('API save failed, using LocalStorage only');
    }
    // Fallback to LS
    const current = await this.getAll();
    localStorage.setItem(LS_KEY, JSON.stringify([quad, ...current]));
    return true;
  },

  async updateStatus(id: string, status: 'active' | 'completed'): Promise<boolean> {
    try {
      const resp = await fetch(`${API_BASE}/quadricycles/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (resp.ok) return true;
    } catch (e) {
      console.warn('API update failed');
    }
    const current = await this.getAll();
    const updated = current.map(q => q.id === id ? { ...q, status } : q);
    localStorage.setItem(LS_KEY, JSON.stringify(updated));
    return true;
  },

  async delete(id: string): Promise<boolean> {
    try {
      const resp = await fetch(`${API_BASE}/quadricycles/${id}`, {
        method: 'DELETE',
      });
      if (resp.ok) return true;
    } catch (e) {
      console.warn('API delete failed');
    }
    const current = await this.getAll();
    const filtered = current.filter(q => q.id !== id);
    localStorage.setItem(LS_KEY, JSON.stringify(filtered));
    return true;
  },

  async updateReview(quadId: string, reviewNumber: number, data: Partial<Review>): Promise<boolean> {
    try {
      const resp = await fetch(`${API_BASE}/quadricycles/${quadId}/reviews/${reviewNumber}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (resp.ok) return true;
    } catch (e) {
      console.warn('API review update failed');
    }
    const current = await this.getAll();
    const updated = current.map(q => {
      if (q.id === quadId) {
        return {
          ...q,
          reviews: q.reviews.map(r => r.id === reviewNumber ? { ...r, ...data } : r)
        };
      }
      return q;
    });
    localStorage.setItem(LS_KEY, JSON.stringify(updated));
    return true;
  }
};
