// Product data - fallback local data when API is not available
const localProducts = [
    {
        id: 1,
        name: "Croissant de Chocolate",
        description: "Croissant mantecoso y hojaldrado relleno de rico chocolate oscuro",
        price: 3.99,
        image: "https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=400&h=300&fit=crop",
        quantity: 0,
        stock: 20,
        available: true,
        status: 'active'
    },
    {
        id: 2,
        name: "Muffin de Arándanos",
        description: "Muffin húmedo repleto de arándanos frescos con una dulce cobertura crujiente",
        price: 2.99,
        image: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=300&fit=crop",
        quantity: 0,
        stock: 18,
        available: true,
        status: 'active'
    },
    {
        id: 3,
        name: "Pan de Masa Madre",
        description: "Pan de masa madre artesanal con corteza crujiente y sabor ácido",
        price: 5.99,
        image: "https://images.unsplash.com/photo-1586444248902-2f64eddc13df?w=400&h=300&fit=crop",
        quantity: 0,
        stock: 15,
        available: true,
        status: 'active'
    },
    {
        id: 4,
        name: "Rollito de Canela",
        description: "Rollito de canela suave y pegajoso con glaseado de queso crema",
        price: 4.49,
        image: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=300&fit=crop",
        quantity: 0,
        stock: 22,
        available: true,
        status: 'active'
    },
    {
        id: 5,
        name: "Pastel de Manzana",
        description: "Pastel de manzana clásico con corteza hojaldrada y manzanas con canela calientes",
        price: 6.99,
        image: "https://images.unsplash.com/photo-1624353365286-3f8d62daad51?w=400&h=300&fit=crop",
        quantity: 0,
        stock: 13,
        available: true,
        status: 'active'
    },
    {
        id: 6,
        name: "Galletas de Chips de Chocolate",
        description: "Galletas tibias y masticables cargadas de chips de chocolate",
        price: 2.49,
        image: "https://images.unsplash.com/photo-1499636136210-6f4ee915583e?w=400&h=300&fit=crop",
        quantity: 0,
        stock: 25,
        available: true,
        status: 'active'
    }
];

// Global products array - will be populated from API or local data
let products = [];

// Cart array to store items
let cart = [];

// Initialize the application when the page loads
document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 DOMContentLoaded event fired');
    
    // Load cart from localStorage immediately
    loadCart();
    console.log(`📦 Cart loaded: ${cart.length} items`);
    
    // Load products from API or use local data
    loadProducts().then(() => {
        console.log(`🛍️ Products loaded: ${products.length} items`);
        
        // Check which page we're on and initialize accordingly
        console.log('🔍 Current pathname:', window.location.pathname);
        
        if (window.location.pathname.includes('index.html') || window.location.pathname === '/') {
            console.log('🏠 Initializing home page');
            initializeHomePage();
        } else if (window.location.pathname.includes('cart.html')) {
            console.log('🛒 Initializing cart page');
            initializeCartPage();
        } else {
            console.log('❓ Unknown page, forcing cart initialization');
            // Force cart initialization for any page that might be the cart
            if (document.getElementById('cart-items')) {
                console.log('🛒 Found cart elements, initializing cart page');
                initializeCartPage();
            }
        }
        
        // Update cart count display
        updateCartCount();
        console.log('✅ Initialization complete');
        
        // Force cart display after a short delay (for production)
        setTimeout(() => {
            console.log('🔄 Force displaying cart after initialization');
            if (document.getElementById('cart-items')) {
                displayCart();
                calculateTotal();
                updateCartCount();
            }
        }, 100);
        
        // Additional fallback for production
        setTimeout(() => {
            console.log('🔄 Additional fallback for production');
            checkAndFixCart();
        }, 500);
    }).catch(error => {
        console.error('❌ Error loading products:', error);
        // Use local products as fallback
        products = [...localProducts];
        initializeCartPage();
    });
});

// Function to load products from API or use local data
const loadProducts = async () => {
    try {
        if (CONFIG.features.enableApiIntegration) {
            debugLog('Loading products from API...');
            const apiProducts = await apiService.getProducts();
            
            // Filter only active products and transform to match our local format
            products = apiProducts
                .filter(product => product.status === 'active')
                .map(product => ({
                    id: product.id_product,
                    name: product.name,
                    description: product.description,
                    price: parseFloat(product.price),
                    image: product.image_urls && product.image_urls.length > 0 
                        ? product.image_urls[0] // Use complete Cloudinary URL
                        : 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=400&h=300&fit=crop', // Fallback image
                    quantity: 0,
                    stock: product.stock || 0,
                    available: product.available,
                    status: product.status
                }));
            
            debugLog(`Products loaded from API: ${products.length} active products (filtered from ${apiProducts.length} total)`, products);
        } else {
            debugLog('Using local products data');
            products = [...localProducts];
        }
    } catch (error) {
        errorLog('Failed to load products from API, falling back to local data:', error);
        products = [...localProducts];
        
        // Show user-friendly notification
        if (CONFIG.features.enableNotifications) {
            showNotification('Usando modo sin conexión - algunas funciones pueden estar limitadas', 'warning');
        }
    }
};

// Function to refresh products from API
const refreshProducts = async () => {
    if (CONFIG.features.enableApiIntegration) {
        await loadProducts();
        
        // Update the display if we're on the home page
        if (window.location.pathname.includes('index.html') || window.location.pathname === '/') {
            const productsGrid = document.getElementById('products-grid');
            if (productsGrid) {
                displayProducts(productsGrid);
            }
        }
    }
};

// Function to initialize the home page (product catalog)
const initializeHomePage = () => {
    const productsGrid = document.getElementById('products-grid');
    if (productsGrid) {
        displayProducts(productsGrid);
    }
};

// Function to initialize the cart page
const initializeCartPage = () => {
    console.log('🛒 Initializing cart page');
    console.log(`📊 Cart state: ${cart.length} items, Products state: ${products.length} items`);
    
    // Simple and direct approach
    displayCart();
    calculateTotal();
    updateCartCount();
    
    console.log('✅ Cart page initialized');
};

// Function to display products in the catalog
const displayProducts = (container) => {
    container.innerHTML = '';
    
    products.forEach(product => {
        const productCard = createProductCard(product);
        container.appendChild(productCard);
    });
    
    // Update quantity displays after creating cards
    products.forEach(product => {
        const cartItem = cart.find(item => item.id === product.id);
        const quantity = cartItem ? cartItem.quantity : 0;
        updateProductCardQuantity(product.id, quantity);
    });
};

// Function to create a product card element
const createProductCard = (product) => {
    const card = document.createElement('div');
    card.className = 'product-card';
    
    // Get current quantity from cart
    const cartItem = cart.find(item => item.id === product.id);
    const currentQuantity = cartItem ? cartItem.quantity : 0;
    
    // Check if product is available and has stock
    const isProductAvailable = product.available && product.status === 'active';
    const canAddMore = isProductAvailable && currentQuantity < product.stock;
    const addButtonDisabled = !canAddMore ? 'disabled' : '';
    const addButtonClass = canAddMore ? 'btn btn-primary' : 'btn btn-primary disabled';
    
    // Add unavailable indicator if product is not available
    const unavailableIndicator = !isProductAvailable ? '<div class="unavailable-overlay">No disponible</div>' : '';
    
    card.innerHTML = `
        <div class="product-image-container">
            <img src="${product.image}" alt="${product.name}" class="product-image">
            ${unavailableIndicator}
        </div>
        <div class="product-info">
            <h3 class="product-name">${product.name}</h3>
            <p class="product-description">${product.description}</p>
            <div class="product-price">$${product.price.toFixed(2)}</div>
            <div class="quantity-controls">
                <button class="btn btn-primary" onclick="updateQuantity(${product.id}, -1)">
                    -1
                </button>
                <span class="quantity-display">${currentQuantity}</span>
                <button class="${addButtonClass}" onclick="updateQuantity(${product.id}, 1)" ${addButtonDisabled}>
                    +1
                </button>
            </div>
        </div>
    `;
    
    return card;
};

// Function to add a product to the cart
const addToCart = (productId) => {
    const product = products.find(p => p.id === productId);
    if (!product) return;
    
    // Check if product is already in cart
    const existingItem = cart.find(item => item.id === productId);
    
    if (existingItem) {
        // Increment quantity if product already exists
        existingItem.quantity += 1;
    } else {
        // Add new product to cart
        cart.push({
            id: product.id,
            name: product.name,
            price: product.price,
            image: product.image,
            quantity: 1
        });
    }
    
    // Save cart to localStorage
    saveCart();
    
    // Update cart count display
    updateCartCount();
    
    // Show success message
    showNotification(`¡${product.name} agregado al carrito!`);
};

// Function to remove a product from the cart
const removeFromCart = async (productId) => {
    cart = cart.filter(item => item.id !== productId);
    
        // Cart is managed locally only - no API sync needed
    
    saveCart();
    updateCartCount();
    
    // Update all product cards to reflect the new cart state
    products.forEach(product => {
        const cartItem = cart.find(item => item.id === product.id);
        const quantity = cartItem ? cartItem.quantity : 0;
        updateProductCardQuantity(product.id, quantity);
    });
    
    displayCart();
    calculateTotal();
    showNotification('Artículo eliminado del carrito');
};

// Function to update product quantity in cart
const updateQuantity = (productId, change) => {
    console.log(`🔄 Updating quantity for product ${productId}, change: ${change}`);
    
    const product = products.find(p => p.id === productId);
    if (!product) {
        console.error('❌ Product not found:', productId);
        return;
    }
    
    const item = cart.find(item => item.id === productId);
    
    if (item) {
        // Product is already in cart
        const newQuantity = item.quantity + change;
        console.log(`📊 Current quantity: ${item.quantity}, new quantity: ${newQuantity}`);
        
        if (newQuantity <= 0) {
            // Remove item from cart
            console.log('🗑️ Removing item from cart');
            removeFromCart(productId);
        } else {
            // Update quantity
            item.quantity = newQuantity;
            console.log(`✅ Updated quantity to: ${item.quantity}`);
        }
    } else if (change > 0) {
        // Add new item to cart
        console.log('➕ Adding new item to cart');
        cart.push({
            id: product.id,
            name: product.name,
            price: product.price,
            image: product.image,
            quantity: 1
        });
    }
    
    // Always save and update display
    saveCart();
    updateCartCount();
    
    // Update display if on cart page
    if (window.location.pathname.includes('cart.html')) {
        displayCart();
        calculateTotal();
    }
    
    console.log(`✅ Cart updated: ${cart.length} items`);
};

// Function to update quantity display on product cards
const updateProductCardQuantity = (productId, quantity) => {
    const productCards = document.querySelectorAll('.product-card');
    productCards.forEach(card => {
        // Check if this card contains buttons for the specific product
        const minusButton = card.querySelector(`button[onclick*="updateQuantity(${productId}, -1)"]`);
        const plusButton = card.querySelector(`button[onclick*="updateQuantity(${productId}, 1)"]`);
        
        // Only update this card if it contains buttons for the specific product
        if (minusButton || plusButton) {
            const quantityDisplay = card.querySelector('.quantity-display');
            
            if (quantityDisplay) {
                quantityDisplay.textContent = quantity;
            }
            
            if (minusButton) {
                // Show/hide minus button based on quantity
                if (quantity > 0) {
                    minusButton.style.display = 'inline-block';
                } else {
                    minusButton.style.display = 'none';
                }
            }
            
            // Update plus button state based on stock limit and availability
            if (plusButton) {
                const product = products.find(p => p.id === productId);
                if (product) {
                    const isProductAvailable = product.available && product.status === 'active';
                    const canAddMore = isProductAvailable && quantity < product.stock;
                    if (canAddMore) {
                        plusButton.disabled = false;
                        plusButton.classList.remove('disabled');
                    } else {
                        plusButton.disabled = true;
                        plusButton.classList.add('disabled');
                    }
                }
            }
        }
    });
};

// Function to display cart items
const displayCart = () => {
    const cartItems = document.getElementById('cart-items');
    const emptyCart = document.getElementById('empty-cart');
    const cartSummary = document.getElementById('cart-summary');
    
    console.log(`🛒 Displaying cart: ${cart.length} items`);
    
    if (!cartItems) {
        console.error('❌ Cart items container not found');
        return;
    }
    
    if (cart.length === 0) {
        // Show empty cart message
        console.log('📭 Cart is empty, showing empty cart message');
        if (emptyCart) emptyCart.classList.remove('hidden');
        if (cartSummary) cartSummary.classList.add('hidden');
        cartItems.innerHTML = '';
    } else {
        // Show cart items
        console.log(`📦 Cart has ${cart.length} items, showing cart summary`);
        
        // Hide empty cart, show cart summary
        if (emptyCart) emptyCart.classList.add('hidden');
        if (cartSummary) {
            cartSummary.classList.remove('hidden');
            cartSummary.style.display = 'block';
        }
        
        // Clear and populate cart items
        cartItems.innerHTML = '';
        
        cart.forEach((item, index) => {
            console.log(`➕ Adding cart item ${index + 1}: ${item.name}`);
            const cartItem = createCartItemElement(item);
            cartItems.appendChild(cartItem);
        });
        
        console.log(`✅ Cart items populated: ${cart.length} items`);
    }
};

// Function to create a cart item element
const createCartItemElement = (item) => {
    const cartItem = document.createElement('div');
    cartItem.className = 'cart-item';
    
    const totalPrice = (item.price * item.quantity).toFixed(2);
    
    // Get product stock information
    const product = products.find(p => p.id === item.id);
    const canAddMore = product ? item.quantity < product.stock : false;
    const addButtonDisabled = !canAddMore ? 'disabled' : '';
    const addButtonClass = canAddMore ? 'quantity-btn' : 'quantity-btn disabled';
    
    cartItem.innerHTML = `
        <img src="${item.image}" alt="${item.name}" class="cart-item-image">
        <div class="cart-item-info">
            <div class="cart-item-name">${item.name}</div>
            <div class="cart-item-price">$${item.price.toFixed(2)} each</div>
        </div>
        <div class="cart-item-quantity">
            <button class="quantity-btn" data-product-id="${item.id}" data-quantity-change="-1">-</button>
            <span class="quantity-display">${item.quantity}</span>
            <button class="${addButtonClass}" data-product-id="${item.id}" data-quantity-change="1" ${addButtonDisabled}>+</button>
        </div>
        <div class="cart-item-total">$${totalPrice}</div>
        <button class="remove-btn" data-product-id="${item.id}" title="Remove item">×</button>
    `;
    
    // Add event listeners for quantity buttons
    const quantityButtons = cartItem.querySelectorAll('.quantity-btn');
    quantityButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            e.preventDefault();
            const productId = parseInt(button.dataset.productId);
            const change = parseInt(button.dataset.quantityChange);
            console.log(`🔄 Button clicked: product ${productId}, change: ${change}`);
            updateQuantity(productId, change);
        });
    });
    
    // Add event listener for remove button
    const removeButton = cartItem.querySelector('.remove-btn');
    if (removeButton) {
        removeButton.addEventListener('click', (e) => {
            e.preventDefault();
            const productId = parseInt(removeButton.dataset.productId);
            console.log(`🗑️ Remove button clicked: product ${productId}`);
            removeFromCart(productId);
        });
    }
    
    return cartItem;
};

// Function to calculate and display cart total
const calculateTotal = () => {
    console.log('💰 Calculating total');
    
    const subtotalElement = document.getElementById('subtotal');
    const taxElement = document.getElementById('tax');
    const totalElement = document.getElementById('total');
    
    if (!subtotalElement || !taxElement || !totalElement) {
        console.error('❌ Missing total elements');
        return;
    }
    
    // Calculate subtotal
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    console.log(`📊 Subtotal: $${subtotal.toFixed(2)}`);
    
    // Calculate tax (8.5%)
    const tax = subtotal * 0.085;
    console.log(`📊 Tax: $${tax.toFixed(2)}`);
    
    // Calculate total
    const total = subtotal + tax;
    console.log(`📊 Total: $${total.toFixed(2)}`);
    
    // Update display
    subtotalElement.textContent = `$${subtotal.toFixed(2)}`;
    taxElement.textContent = `$${tax.toFixed(2)}`;
    totalElement.textContent = `$${total.toFixed(2)}`;
    
    console.log('✅ Total display updated');
};

// Function to update cart count in header
const updateCartCount = () => {
    const cartCountElements = document.querySelectorAll('#cart-count');
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    
    cartCountElements.forEach(element => {
        element.textContent = totalItems;
    });
};

// Function to save cart to localStorage
const saveCart = () => {
    localStorage.setItem('bakeryCart', JSON.stringify(cart));
};

// Function to load cart from localStorage
const loadCart = () => {
    try {
        const savedCart = localStorage.getItem('bakeryCart');
        if (savedCart) {
            cart = JSON.parse(savedCart);
            debugLog(`Cart loaded from localStorage: ${cart.length} items`, cart);
        } else {
            debugLog('No cart found in localStorage');
            cart = [];
        }
    } catch (error) {
        errorLog('Error loading cart from localStorage:', error);
        cart = [];
    }
};

// Function to clear cart (for checkout)
const clearCart = () => {
    cart = [];
    saveCart();
    updateCartCount();
    displayCart();
    calculateTotal();
};

// Function to debug cart state
const debugCartState = () => {
    console.log('=== CART DEBUG INFO ===');
    console.log('Cart length:', cart.length);
    console.log('Cart contents:', cart);
    console.log('localStorage cart:', localStorage.getItem('bakeryCart'));
    console.log('Cart elements:');
    console.log('- cart-items:', document.getElementById('cart-items'));
    console.log('- empty-cart:', document.getElementById('empty-cart'));
    console.log('- cart-summary:', document.getElementById('cart-summary'));
    console.log('========================');
};

// Function to force reload cart from localStorage
const forceReloadCart = () => {
    debugLog('Force reloading cart from localStorage');
    loadCart();
    displayCart();
    calculateTotal();
    updateCartCount();
};

// Function to force show cart (for debugging)
const forceShowCart = () => {
    debugLog('Force showing cart');
    
    const cartItems = document.getElementById('cart-items');
    const emptyCart = document.getElementById('empty-cart');
    const cartSummary = document.getElementById('cart-summary');
    
    if (cart.length > 0) {
        // Force show cart summary
        if (cartSummary) {
            cartSummary.classList.remove('hidden');
            debugLog('Cart summary shown');
        }
        
        // Force hide empty cart
        if (emptyCart) {
            emptyCart.classList.add('hidden');
            debugLog('Empty cart hidden');
        }
        
        // Force populate cart items
        if (cartItems) {
            cartItems.innerHTML = '';
            cart.forEach(item => {
                const cartItem = createCartItemElement(item);
                cartItems.appendChild(cartItem);
            });
            debugLog(`Cart items populated: ${cart.length} items`);
        }
        
        // Force calculate total
        calculateTotal();
        updateCartCount();
    }
};

// Function to force calculate total (for debugging)
const forceCalculateTotal = () => {
    debugLog('Force calculating total');
    calculateTotal();
};

// Function to check cart display status
const checkCartDisplayStatus = () => {
    console.log('=== CART DISPLAY STATUS ===');
    
    const cartItems = document.getElementById('cart-items');
    const emptyCart = document.getElementById('empty-cart');
    const cartSummary = document.getElementById('cart-summary');
    
    console.log('Cart data:', {
        length: cart.length,
        items: cart
    });
    
    console.log('DOM elements:', {
        cartItems: {
            element: !!cartItems,
            hidden: cartItems ? cartItems.classList.contains('hidden') : 'N/A',
            children: cartItems ? cartItems.children.length : 'N/A'
        },
        emptyCart: {
            element: !!emptyCart,
            hidden: emptyCart ? emptyCart.classList.contains('hidden') : 'N/A'
        },
        cartSummary: {
            element: !!cartSummary,
            hidden: cartSummary ? cartSummary.classList.contains('hidden') : 'N/A'
        }
    });
    
    console.log('=== END STATUS ===');
    return 'Status check complete';
};

// Function to force complete cart initialization
const forceCompleteCartInit = () => {
    console.log('=== FORCE COMPLETE CART INIT ===');
    
    // Step 1: Reload cart from localStorage
    console.log('Step 1: Reloading cart from localStorage');
    loadCart();
    console.log(`Cart reloaded: ${cart.length} items`);
    
    // Step 2: Force display cart
    console.log('Step 2: Force displaying cart');
    displayCart();
    
    // Step 3: Force calculate total
    console.log('Step 3: Force calculating total');
    calculateTotal();
    
    // Step 4: Update cart count
    console.log('Step 4: Updating cart count');
    updateCartCount();
    
    // Step 5: Check final status
    console.log('Step 5: Checking final status');
    checkCartDisplayStatus();
    
    console.log('=== FORCE INIT COMPLETE ===');
    return 'Force init complete';
};

// Function to force cart refresh (for button updates)
const forceCartRefresh = () => {
    console.log('=== FORCE CART REFRESH ===');
    
    // Reload cart from localStorage
    loadCart();
    console.log(`Cart reloaded: ${cart.length} items`);
    
    // Force display cart
    displayCart();
    console.log('Cart displayed');
    
    // Force calculate total
    calculateTotal();
    console.log('Total calculated');
    
    // Update cart count
    updateCartCount();
    console.log('Cart count updated');
    
    console.log('=== CART REFRESH COMPLETE ===');
    return 'Cart refresh complete';
};

// Function to detect production environment
const isProduction = () => {
    return window.location.hostname !== 'localhost' && 
           window.location.hostname !== '127.0.0.1' &&
           !window.location.hostname.includes('localhost');
};

// Function to auto-fix cart if not visible
const autoFixCart = () => {
    console.log('🔧 Auto-fixing cart...');
    
    const cartSummary = document.getElementById('cart-summary');
    const isVisible = cartSummary && !cartSummary.classList.contains('hidden');
    
    if (!isVisible && cart.length > 0) {
        console.log('🚨 Cart not visible but has items - forcing display');
        forceCompleteCartInit();
    }
    
    return isVisible;
};

// Function to check and fix cart display
const checkAndFixCart = () => {
    console.log('🔍 Checking cart display...');
    
    const cartItems = document.getElementById('cart-items');
    const cartSummary = document.getElementById('cart-summary');
    
    if (cartItems && cartSummary) {
        console.log('🛒 Cart elements found');
        
        if (cart.length > 0) {
            console.log('📦 Cart has items, displaying cart');
            displayCart();
            calculateTotal();
            updateCartCount();
        } else {
            console.log('📭 Cart is empty');
        }
    } else {
        console.log('❌ Cart elements not found');
    }
};

// Make debug functions available globally for testing
window.debugCartState = debugCartState;
window.forceReloadCart = forceReloadCart;
window.forceShowCart = forceShowCart;
window.forceCalculateTotal = forceCalculateTotal;
window.checkCartDisplayStatus = checkCartDisplayStatus;
window.forceCompleteCartInit = forceCompleteCartInit;
window.forceCartRefresh = forceCartRefresh;
window.isProduction = isProduction;
window.autoFixCart = autoFixCart;
window.checkAndFixCart = checkAndFixCart;

// Function to show notification
const showNotification = (message, type = 'success') => {
    // Create notification element
    const notification = document.createElement('div');
    
    // Set background color based on type
    let backgroundColor = '#4CAF50'; // Default success (green)
    if (type === 'error') backgroundColor = '#f44336'; // Red
    if (type === 'warning') backgroundColor = '#ff9800'; // Orange
    if (type === 'info') backgroundColor = '#2196F3'; // Blue
    
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        left: 50%;
        transform: translateX(-50%) translateY(-100%);
        background: ${backgroundColor};
        color: white;
        padding: 1rem 2rem;
        border-radius: 10px;
        box-shadow: 0 4px 15px rgba(0,0,0,0.2);
        z-index: 1000;
        transition: transform 0.3s ease;
        display: flex;
        align-items: center;
        gap: 10px;
        min-width: 200px;
        max-width: 300px;
    `;
    
    // Create message text
    const messageText = document.createElement('span');
    messageText.textContent = message;
    messageText.style.flex = '1';
    
    // Create dismiss button
    const dismissBtn = document.createElement('button');
    dismissBtn.innerHTML = '×';
    dismissBtn.style.cssText = `
        background: none;
        border: none;
        color: white;
        font-size: 18px;
        font-weight: bold;
        cursor: pointer;
        padding: 0;
        width: 20px;
        height: 20px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 50%;
        transition: background-color 0.2s ease;
    `;
    
    // Add hover effect to dismiss button
    dismissBtn.addEventListener('mouseenter', () => {
        dismissBtn.style.backgroundColor = 'rgba(255,255,255,0.2)';
    });
    
    dismissBtn.addEventListener('mouseleave', () => {
        dismissBtn.style.backgroundColor = 'transparent';
    });
    
    // Add dismiss functionality
    const dismissNotification = () => {
        notification.style.transform = 'translateX(-50%) translateY(-100%)';
        setTimeout(() => {
            if (document.body.contains(notification)) {
                document.body.removeChild(notification);
            }
        }, 300);
    };
    
    dismissBtn.addEventListener('click', dismissNotification);
    
    // Add elements to notification
    notification.appendChild(messageText);
    notification.appendChild(dismissBtn);
    
    // Add to page
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => {
        notification.style.transform = 'translateX(-50%) translateY(0)';
    }, 100);
    
    // Auto-remove after 4 seconds (increased from 3 to give more time to read)
    const autoRemoveTimeout = setTimeout(dismissNotification, 4000);
    
    // Clear auto-remove timeout if manually dismissed
    dismissBtn.addEventListener('click', () => {
        clearTimeout(autoRemoveTimeout);
    });
};

// Checkout logic is handled in checkout.js (modal + validation)
