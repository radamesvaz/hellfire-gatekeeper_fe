// Configuration file for Sweet Dreams Bakery
// This file contains environment-specific settings

const CONFIG = {
    // Environment settings
    environment: 'development', // 'development' | 'production'
    
    // API Configuration
    api: {
        // Base URLs for different environments
        baseUrl: {
            development: 'http://localhost:8080', // Local development server
            production: 'https://api.sweetdreamsbakery.com' // Production server
        },
        
        // API endpoints
        endpoints: {
            products: '/products',
            orders: '/orders'
        },
        
        
        // Default headers for API requests
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        }
    },
    
    // Application settings
    app: {
        name: 'Sweet Dreams Bakery',
        version: '1.0.0',
        currency: 'USD',
        taxRate: 0.085, // 8.5% tax rate
        maxCartItems: 50,
        notificationDuration: 4000 // milliseconds
    },
    
    // WhatsApp Configuration
    whatsapp: {
        phoneNumber: '+584142493918',
        enabled: true, // Habilitar/deshabilitar integración con WhatsApp
        messageTemplate: '¡Hola! Quiero hacer un pedido:\n\n📋 *Resumen del Pedido:*\n{items}\n\n💰 *Total: ${total}*\n\n👤 *Datos del Cliente:*\n• Nombre: {name}\n• Teléfono: {phone}\n• Email: {email}\n• Fecha de entrega: {deliveryDate}\n\n{note}\n\n¿Podrías confirmar el pedido y coordinar la entrega?'
    },
    
    // Feature flags
    features: {
        enableApiIntegration: false, // Toggle between API and local data
        enableNotifications: true,
        enableLocalStorage: true,
        enableStockValidation: true
    },
    
    // Debug settings
    debug: {
        enabled: true, // Set to false in production
        logApiCalls: true,
        logErrors: true
    }
};

// Helper function to get the current API base URL
const getApiBaseUrl = () => {
    return CONFIG.api.baseUrl[CONFIG.environment];
};

// Helper function to build full API endpoint URL
const buildApiUrl = (endpoint) => {
    const baseUrl = getApiBaseUrl();
    const endpointPath = CONFIG.api.endpoints[endpoint];
    
    if (!endpointPath) {
        throw new Error(`Unknown endpoint: ${endpoint}`);
    }
    
    return `${baseUrl}${endpointPath}`;
};

// Helper function to get full products API URL
const getProductsApiUrl = () => {
    return buildApiUrl('products');
};

// Helper function to get full orders API URL
const getOrdersApiUrl = () => {
    return buildApiUrl('orders');
};

// Helper function to log debug messages
const debugLog = (message, data = null) => {
    if (CONFIG.debug.enabled) {
        console.log(`[Sweet Dreams Bakery] ${message}`, data || '');
    }
};

// Helper function to log errors
const errorLog = (message, error = null) => {
    if (CONFIG.debug.logErrors) {
        console.error(`[Sweet Dreams Bakery Error] ${message}`, error || '');
    }
};

// Export configuration and helper functions
if (typeof module !== 'undefined' && module.exports) {
    // Node.js environment
    module.exports = {
        CONFIG,
        getApiBaseUrl,
        buildApiUrl,
        getProductsApiUrl,
        getCartApiUrl,
        getOrdersApiUrl,
        debugLog,
        errorLog
    };
} else {
    // Browser environment - make functions available globally
    window.CONFIG = CONFIG;
    window.getApiBaseUrl = getApiBaseUrl;
    window.buildApiUrl = buildApiUrl;
    window.getProductsApiUrl = getProductsApiUrl;
    window.getOrdersApiUrl = getOrdersApiUrl;
    window.debugLog = debugLog;
    window.errorLog = errorLog;
}
