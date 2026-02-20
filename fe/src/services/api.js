import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/smartroom/api';

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

export const getActionHistory = async (params) => {
    try {
        const response = await api.get('/action-histories', { params });
        return response.data;
    } catch (error) {
        console.error('Error fetching action history:', error);
        throw error;
    }
};

export const getSensorData = async (params) => {
    try {
        const response = await api.get('/sensors', { params });
        return response.data;
    } catch (error) {
        console.error('Error fetching sensor data:', error);
        throw error;
    }
};

export default api;
