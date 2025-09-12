// Checkout modal and form logic

// Create and insert checkout modal HTML on DOMContentLoaded
document.addEventListener('DOMContentLoaded', () => {
	// Only render on cart page
	if (!window.location.pathname.includes('cart.html')) return;

	const modal = document.createElement('div');
	modal.id = 'checkout-modal';
	modal.className = 'modal hidden';
	modal.innerHTML = `
		<div class="modal-backdrop" data-close></div>
		<div class="modal-content" role="dialog" aria-modal="true" aria-labelledby="checkout-title">
			<button class="modal-close" title="Close" data-close>&times;</button>
			<h3 id="checkout-title">Checkout</h3>
			
			<div class="modal-scrollable">
				<form id="checkout-form" novalidate>
					<div class="form-row">
						<label for="client-name">Name</label>
						<input id="client-name" name="name" type="text" required placeholder="Jane Doe" />
						<span class="error" data-error-for="client-name"></span>
					</div>

					<div class="form-row">
						<label for="client-email">Email</label>
						<input id="client-email" name="email" type="email" required placeholder="jane@example.com" />
						<span class="error" data-error-for="client-email"></span>
					</div>

					<div class="form-row">
						<label for="client-phone">Phone</label>
						<input id="client-phone" name="phone" type="tel" required placeholder="(555) 123-4567" />
						<span class="error" data-error-for="client-phone"></span>
					</div>

					<div class="form-row">
						<label for="delivery-date">Delivery date</label>
						<input id="delivery-date" name="deliveryDate" type="date" required />
						<span class="hint">Must be at least 2 days from today</span>
						<span class="error" data-error-for="delivery-date"></span>
					</div>

					<div class="form-row">
						<label for="order-note">Note (optional)</label>
						<textarea id="order-note" name="note" rows="3" placeholder="Any special requests..."></textarea>
					</div>
				</form>
				
				<div class="order-summary">
					<h4>Order Summary</h4>
					<div id="modal-cart-items"></div>
					<div class="order-total">
						<div class="total-row">
							<span>Subtotal:</span>
							<span id="modal-subtotal">$0.00</span>
						</div>
						<div class="total-row">
							<span>Tax (8.5%):</span>
							<span id="modal-tax">$0.00</span>
						</div>
						<div class="total-row final-total">
							<span>Total:</span>
							<span id="modal-final-total">$0.00</span>
						</div>
					</div>
				</div>
			</div>
			
			<div class="form-actions">
				<button type="submit" form="checkout-form" class="btn btn-primary">Place order</button>
				<button type="button" class="btn btn-secondary" data-close>Cancel</button>
			</div>
		</div>
	`;

	document.body.appendChild(modal);

	// Wire up open/close
	const checkoutBtn = document.getElementById('checkout-btn');
	if (checkoutBtn) {
		checkoutBtn.addEventListener('click', () => openCheckoutModal());
	}

	modal.addEventListener('click', (e) => {
		if ((e.target instanceof Element) && e.target.hasAttribute('data-close')) {
			closeCheckoutModal();
		}
	});

	// Set min date = today + 2 days
	const dateInput = document.getElementById('delivery-date');
	if (dateInput) {
		const today = new Date();
		today.setDate(today.getDate() + 2);
		const yyyy = today.getFullYear();
		const mm = String(today.getMonth() + 1).padStart(2, '0');
		const dd = String(today.getDate()).padStart(2, '0');
		dateInput.min = `${yyyy}-${mm}-${dd}`;
	}

	// Handle submit with validation
	const form = document.getElementById('checkout-form');
	if (form) {
		form.addEventListener('submit', (e) => {
			e.preventDefault();
			if (validateCheckoutForm()) {
				// Finalize order: simple success notification and clear cart via existing function
				const total = (typeof cart !== 'undefined')
					? cart.reduce((sum, item) => sum + (item.price * item.quantity), 0) * 1.085
					: 0;
				showNotification(`Thank you! Order placed for $${total.toFixed(2)}`);
				if (typeof clearCart === 'function') clearCart();
				closeCheckoutModal();
			}
		});
	}
});

function openCheckoutModal() {
	const modal = document.getElementById('checkout-modal');
	if (!modal) return;
	
	// Populate order summary with current cart items
	populateOrderSummary();
	
	modal.classList.remove('hidden');
}

function closeCheckoutModal() {
	const modal = document.getElementById('checkout-modal');
	if (!modal) return;
	modal.classList.add('hidden');
}

function setFieldError(inputId, message) {
	const input = document.getElementById(inputId);
	const error = document.querySelector(`[data-error-for="${inputId}"]`);
	if (error) error.textContent = message || '';
	if (input) input.classList.toggle('input-error', Boolean(message));
}

function validateCheckoutForm() {
	let valid = true;

	const name = /** @type {HTMLInputElement|null} */ (document.getElementById('client-name'));
	const email = /** @type {HTMLInputElement|null} */ (document.getElementById('client-email'));
	const phone = /** @type {HTMLInputElement|null} */ (document.getElementById('client-phone'));
	const date = /** @type {HTMLInputElement|null} */ (document.getElementById('delivery-date'));

	// Name
	if (!name || name.value.trim().length < 2) {
		setFieldError('client-name', 'Please enter your full name');
		valid = false;
	} else {
		setFieldError('client-name', '');
	}

	// Email
	const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
	if (!email || !emailRegex.test(email.value)) {
		setFieldError('client-email', 'Please enter a valid email');
		valid = false;
	} else {
		setFieldError('client-email', '');
	}

	// Phone (simple len check; can be refined)
	if (!phone || phone.value.trim().length < 7) {
		setFieldError('client-phone', 'Please enter a valid phone');
		valid = false;
	} else {
		setFieldError('client-phone', '');
	}

	// Delivery date >= min (today + 2)
	if (!date || !date.value) {
		setFieldError('delivery-date', 'Please choose a delivery date');
		valid = false;
	} else {
		const chosen = new Date(date.value + 'T00:00:00');
		const min = new Date(date.min + 'T00:00:00');
		if (chosen < min) {
			setFieldError('delivery-date', 'Date must be at least 2 days from today');
			valid = false;
		} else {
			setFieldError('delivery-date', '');
		}
	}

	return valid;
}

function populateOrderSummary() {
	const modalCartItems = document.getElementById('modal-cart-items');
	const modalSubtotal = document.getElementById('modal-subtotal');
	const modalTax = document.getElementById('modal-tax');
	const modalFinalTotal = document.getElementById('modal-final-total');
	
	if (!modalCartItems || !modalSubtotal || !modalTax || !modalFinalTotal) return;
	
	// Check if cart is available (from script.js)
	if (typeof cart === 'undefined' || !cart.length) {
		modalCartItems.innerHTML = '<p class="empty-cart-message">No items in cart</p>';
		modalSubtotal.textContent = '$0.00';
		modalTax.textContent = '$0.00';
		modalFinalTotal.textContent = '$0.00';
		return;
	}
	
	// Clear previous items
	modalCartItems.innerHTML = '';
	
	// Add each cart item
	cart.forEach(item => {
		const itemElement = document.createElement('div');
		itemElement.className = 'modal-cart-item';
		itemElement.innerHTML = `
			<div class="modal-item-info">
				<span class="modal-item-name">${item.name}</span>
				<span class="modal-item-quantity">× ${item.quantity}</span>
			</div>
			<span class="modal-item-price">$${(item.price * item.quantity).toFixed(2)}</span>
		`;
		modalCartItems.appendChild(itemElement);
	});
	
	// Calculate totals
	const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
	const tax = subtotal * 0.085;
	const total = subtotal + tax;
	
	// Update totals
	modalSubtotal.textContent = `$${subtotal.toFixed(2)}`;
	modalTax.textContent = `$${tax.toFixed(2)}`;
	modalFinalTotal.textContent = `$${total.toFixed(2)}`;
}


