// API service for Confettideli
// This file handles all API communications

class ApiService {
    constructor() {
        this.baseUrl = getApiBaseUrl();
        this.headers = CONFIG.api.headers;
    }

    // Generic method to make API requests
    async makeRequest(endpoint, options = {}) {
        const url = `${this.baseUrl}${endpoint}`;
        
        const defaultOptions = {
            method: 'GET',
            headers: this.headers,
            ...options
        };

        // Add body for POST/PUT requests
        if (defaultOptions.body && typeof defaultOptions.body === 'object') {
            defaultOptions.body = JSON.stringify(defaultOptions.body);
        }

        debugLog(`Making API request to: ${url}`, defaultOptions);

        try {
            const response = await fetch(url, defaultOptions);

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            debugLog(`API response from ${url}:`, data);
            return data;

        } catch (error) {
            errorLog(`API request failed for ${url}:`, error);
            throw error;
        }
    }

    // Get all products
    async getProducts() {
        try {
            const products = await this.makeRequest(CONFIG.api.endpoints.products);
            return products;
        } catch (error) {
            errorLog('Failed to fetch products:', error);
            throw error;
        }
    }

    // Get a specific product by ID
    async getProduct(id) {
        try {
            const product = await this.makeRequest(`${CONFIG.api.endpoints.products}/${id}`);
            return product;
        } catch (error) {
            errorLog(`Failed to fetch product ${id}:`, error);
            throw error;
        }
    }

    // Update product stock
    async updateProductStock(id, stock) {
        try {
            const product = await this.makeRequest(`${CONFIG.api.endpoints.products}/${id}`, {
                method: 'PATCH',
                body: { stock }
            });
            return product;
        } catch (error) {
            errorLog(`Failed to update stock for product ${id}:`, error);
            throw error;
        }
    }


    // Create an order
    async createOrder(orderData) {
        try {
            const order = await this.makeRequest(CONFIG.api.endpoints.orders, {
                method: 'POST',
                body: orderData
            });
            return order;
        } catch (error) {
            errorLog('Failed to create order:', error);
            throw error;
        }
    }

    // Get order by ID
    async getOrder(orderId) {
        try {
            const order = await this.makeRequest(`${CONFIG.api.endpoints.orders}/${orderId}`);
            return order;
        } catch (error) {
            errorLog(`Failed to fetch order ${orderId}:`, error);
            throw error;
        }
    }

    // Get user orders
    async getUserOrders(userId) {
        try {
            const orders = await this.makeRequest(`${CONFIG.api.endpoints.orders}/user/${userId}`);
            return orders;
        } catch (error) {
            errorLog(`Failed to fetch orders for user ${userId}:`, error);
            throw error;
        }
    }
}

// Create a global instance of the API service
const apiService = new ApiService();

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { ApiService, apiService };
} else {
    window.apiService = apiService;
}
