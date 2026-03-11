import axios from 'axios';

const API_BASE_URL = 'http://localhost:12345/smartroom/api';

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

export const controlDevice = async (payload) => {
    try {
        const response = await api.post('/devices/control', payload);
        return response.data;
    } catch (error) {
        console.error('Error controlling device:', error);
        throw error;
    }
};

export const getDevices = async () => {
    try {
        const response = await api.get('/devices');
        return response.data;
    } catch (error) {
        console.error('Error fetching devices:', error);
        throw error;
    }
};

export default api;
