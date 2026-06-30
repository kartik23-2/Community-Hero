const rawAPI = import.meta.env.VITE_API_URL || '';
export const API = rawAPI.endsWith('/') ? rawAPI.slice(0, -1) : rawAPI;

