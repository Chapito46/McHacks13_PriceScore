// API service for fetching real product data
const API_BASE_URL = 'http://localhost:3001';

export const searchProducts = async (searchQuery) => {
    try {
        const response = await fetch(`${API_BASE_URL}/api/search?q=${encodeURIComponent(searchQuery)}`);

        if (!response.ok) {
            throw new Error('Failed to fetch product data');
        }

        const data = await response.json();
        return data.results;
    } catch (error) {
        console.error('Search API error:', error);
        throw error;
    }
};

export const sortResults = (results, sortBy) => {
    const sorted = [...results];

    switch (sortBy) {
        case 'price-low':
            return sorted.sort((a, b) => a.price - b.price);
        case 'price-high':
            return sorted.sort((a, b) => b.price - b.price);
        default:
            return sorted;
    }
};
