# Sweet Dreams Bakery - Web Application

A simple, responsive bakery web application built with HTML, CSS, and vanilla JavaScript. No frameworks required!

## Features

- **Product Catalog**: Browse delicious bakery items with images, descriptions, and prices
- **Shopping Cart**: Add items to cart, adjust quantities, and remove items
- **Persistent Storage**: Cart data is saved in localStorage and persists between page visits
- **Responsive Design**: Works beautifully on both desktop and mobile devices
- **Modern UI**: Warm, pastel color scheme with smooth animations and hover effects

## File Structure

```
├── index.html          # Main page with product catalog
├── cart.html           # Shopping cart page
├── styles.css          # All styling and responsive design
├── script.js           # JavaScript functionality
└── README.md           # This file
```

## How to Open and Test

### Method 1: Direct File Opening
1. Simply double-click on `index.html` to open it in your default web browser
2. The application will load immediately with all functionality working

### Method 2: Using a Local Server (Recommended)
For the best experience, especially when testing localStorage functionality:

1. **Using Python (if installed):**
   ```bash
   # Python 3
   python -m http.server 8000
   
   # Python 2
   python -m SimpleHTTPServer 8000
   ```

2. **Using Node.js (if installed):**
   ```bash
   npx http-server
   ```

3. **Using Live Server (VS Code extension):**
   - Install the "Live Server" extension in VS Code
   - Right-click on `index.html` and select "Open with Live Server"

4. Then open your browser and navigate to:
   - `http://localhost:8000` (for Python/Node.js)
   - Or the URL provided by Live Server

## Testing the Cart Functionality

1. **Add Items to Cart:**
   - On the main page, click "Add to Cart" on any product
   - You'll see a notification and the cart count will update
   - Add multiple items or the same item multiple times

2. **View Cart:**
   - Click the "Cart" link in the header
   - You'll see all items you've added with quantities and totals

3. **Modify Cart:**
   - Use the "+" and "-" buttons to adjust quantities
   - Click the "×" button to remove items completely
   - Watch the totals update automatically

4. **Checkout:**
   - Click "Proceed to Checkout" to complete your order
   - The cart will be cleared after checkout

5. **Persistence:**
   - Close the browser and reopen the application
   - Your cart items will still be there (thanks to localStorage)

## Features Demonstrated

- **HTML Semantic Best Practices**: Proper use of `<header>`, `<main>`, `<section>`, `<nav>`, etc.
- **Responsive CSS Grid**: Product cards automatically adjust to screen size
- **CSS Animations**: Smooth hover effects and transitions
- **JavaScript ES6+**: Modern JavaScript with arrow functions, template literals, and array methods
- **localStorage API**: Persistent data storage across browser sessions
- **Event Handling**: Interactive buttons and dynamic content updates
- **DOM Manipulation**: Dynamic creation and modification of HTML elements

## Browser Compatibility

This application works in all modern browsers including:
- Chrome (recommended)
- Firefox
- Safari
- Edge

## Customization

You can easily customize the application by:
- Adding more products to the `products` array in `script.js`
- Changing colors in `styles.css`
- Modifying the tax rate in the `calculateTotal()` function
- Adding new features like product categories or search functionality

## Technical Notes

- Uses placeholder images from Unsplash for product photos
- Implements a 8.5% tax rate on all purchases
- Cart data is stored in browser's localStorage under the key 'bakeryCart'
- All prices are displayed with 2 decimal places
- Responsive breakpoints at 768px and 480px for mobile optimization

Enjoy your virtual bakery shopping experience! 🍰🥖🧁
