import httpClient from '../shared/api/httpClient';

export const getTopRatedReleasesByType = async (type, page = 0, size = 10, filters = {}) => {
    try {
        const params = new URLSearchParams({
            page: page.toString(),
            size: size.toString()
        });

        if (filters.year) {
            params.append('year', filters.year.toString());
        }
        if (filters.month) {
            params.append('month', filters.month.toString());
        }

        const url = `/api/releases/top-rated/${type}?${params.toString()}`;
        console.log('Fetching top rated releases by type:', url);
        const response = await httpClient.get(url);
        return response.data;
    } catch (error) {
        console.error('Error fetching top rated releases by type:', error);
        throw error;
    }
};

// Получение доступных годов для фильтрации
export const getAvailableYears = async () => {
    try {
        const response = await httpClient.get('/api/releases/years');
        return response.data;
    } catch (error) {
        console.error('Error fetching available years:', error);
        throw error;
    }
};

// Получение доступных годов для определенного типа релиза
export const getAvailableYearsByType = async (type) => {
    try {
        const response = await httpClient.get(`/api/releases/years/${type}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching available years by type:', error);
        throw error;
    }
};

// Получение доступных месяцев для года
export const getAvailableMonthsByYear = async (year) => {
    try {
        const response = await httpClient.get(`/api/releases/months?year=${year}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching available months by year:', error);
        throw error;
    }
};

// Получение доступных месяцев для года и типа релиза
export const getAvailableMonthsByYearAndType = async (year, type) => {
    try {
        const response = await httpClient.get(`/api/releases/months/${type}?year=${year}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching available months by year and type:', error);
        throw error;
    }
}; 