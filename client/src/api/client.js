import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

api.interceptors.response.use(
    (response) => response,
    (error) => {
        const isAuthRequest = error.config?.url?.startsWith('/auth/');
            if (error.response?.status === 401 && !isAuthRequest) {
                localStorage.removeItem('token');
                window.location.href = '/login';
            }
        return Promise.reject(error);
    }
);

export function getErrorMessage(err) {
    const data = err.response?.data;
    if (data?.details?.length) return data.details.join(', ');
        return data?.error || 'Something went wrong. Is the server running?';
}

export default api;