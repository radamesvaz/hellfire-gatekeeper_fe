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
			<h3 id="checkout-title">Finalizar Compra</h3>
			
			<div class="modal-scrollable">
				<form id="checkout-form" novalidate>
					<div class="form-row">
						<label for="client-name">Nombre</label>
						<input id="client-name" name="name" type="text" required placeholder="María García" />
						<span class="error" data-error-for="client-name"></span>
					</div>

					<div class="form-row">
						<label for="client-email">Correo Electrónico</label>
						<input id="client-email" name="email" type="email" required placeholder="maria@ejemplo.com" />
						<span class="error" data-error-for="client-email"></span>
					</div>

					<div class="form-row">
						<label for="client-phone">Teléfono</label>
						<input id="client-phone" name="phone" type="tel" required placeholder="(555) 123-4567" />
						<span class="error" data-error-for="client-phone"></span>
					</div>

					<div class="form-row">
						<label for="delivery-date">Fecha de entrega</label>
						<input id="delivery-date" name="deliveryDate" type="date" required />
						<span class="hint">Debe ser al menos 2 días a partir de hoy</span>
						<span class="error" data-error-for="delivery-date"></span>
					</div>

					<div class="form-row">
						<label for="order-note">Nota (opcional)</label>
						<textarea id="order-note" name="note" rows="3" placeholder="Cualquier solicitud especial..."></textarea>
					</div>
				</form>
				
				<div class="order-summary">
					<h4>Resumen del Pedido</h4>
					<div id="modal-cart-items"></div>
					<div class="order-total">
						<div class="total-row">
							<span>Subtotal:</span>
							<span id="modal-subtotal">$0.00</span>
						</div>
						<div class="total-row">
							<span>Impuesto (8.5%):</span>
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
				<button type="submit" form="checkout-form" class="btn btn-primary">Realizar Pedido</button>
				<button type="button" class="btn btn-secondary" data-close>Cancelar</button>
			</div>
			
			<div class="whatsapp-backup" style="margin-top: 1rem; padding: 1rem; background: #f8f9fa; border-radius: 8px; text-align: center;">
				<p style="margin-bottom: 0.5rem; font-size: 0.9rem; color: #666;">¿Problemas con WhatsApp?</p>
				<button type="button" id="copy-message-btn" class="btn btn-secondary" style="font-size: 0.8rem; padding: 0.5rem 1rem;">
					Copiar mensaje al portapapeles
				</button>
			</div>
		</div>
	`;

	document.body.appendChild(modal);

	// Wire up open/close
	const checkoutBtn = document.getElementById('checkout-btn');
	if (checkoutBtn) {
		console.log('🛒 Checkout button found, adding event listener');
		checkoutBtn.addEventListener('click', (e) => {
			e.preventDefault();
			console.log('🛒 Checkout button clicked');
			openCheckoutModal();
		});
	} else {
		console.error('❌ Checkout button not found');
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
		form.addEventListener('submit', async (e) => {
			e.preventDefault();
			if (validateCheckoutForm()) {
				await submitOrder();
			}
		});
	}
	
	// Handle copy message button
	const copyMessageBtn = document.getElementById('copy-message-btn');
	if (copyMessageBtn) {
		copyMessageBtn.addEventListener('click', () => {
			// Crear mensaje de ejemplo para copiar
			const sampleMessage = `Hola! Quiero hacer un pedido:

Pedido: [Productos del carrito]
Total: $[Total]

Datos:
- Nombre: [Tu nombre]
- Telefono: [Tu telefono]
- Email: [Tu email]
- Fecha entrega: [Fecha seleccionada]

Puedes confirmar el pedido?`;
			
			navigator.clipboard.writeText(sampleMessage).then(() => {
				showNotification('Mensaje copiado al portapapeles', 'success');
			}).catch(() => {
				showNotification('Error al copiar mensaje', 'error');
			});
		});
	}
});

function openCheckoutModal() {
	console.log('🛒 Opening checkout modal');
	const modal = document.getElementById('checkout-modal');
	if (!modal) {
		console.error('❌ Checkout modal not found');
		return;
	}
	
	console.log('🛒 Modal found, populating order summary');
	// Populate order summary with current cart items
	populateOrderSummary();
	
	console.log('🛒 Showing modal');
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
		setFieldError('client-name', 'Por favor ingresa tu nombre completo');
		valid = false;
	} else {
		setFieldError('client-name', '');
	}

	// Email
	const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
	if (!email || !emailRegex.test(email.value)) {
		setFieldError('client-email', 'Por favor ingresa un correo electrónico válido');
		valid = false;
	} else {
		setFieldError('client-email', '');
	}

	// Phone (simple len check; can be refined)
	if (!phone || phone.value.trim().length < 7) {
		setFieldError('client-phone', 'Por favor ingresa un teléfono válido');
		valid = false;
	} else {
		setFieldError('client-phone', '');
	}

	// Delivery date >= min (today + 2)
	if (!date || !date.value) {
		setFieldError('delivery-date', 'Por favor elige una fecha de entrega');
		valid = false;
	} else {
		const chosen = new Date(date.value + 'T00:00:00');
		const min = new Date(date.min + 'T00:00:00');
		if (chosen < min) {
			setFieldError('delivery-date', 'La fecha debe ser al menos 2 días a partir de hoy');
			valid = false;
		} else {
			setFieldError('delivery-date', '');
		}
	}

	return valid;
}

function populateOrderSummary() {
	console.log('🛒 Populating order summary');
	const modalCartItems = document.getElementById('modal-cart-items');
	const modalSubtotal = document.getElementById('modal-subtotal');
	const modalTax = document.getElementById('modal-tax');
	const modalFinalTotal = document.getElementById('modal-final-total');
	
	if (!modalCartItems || !modalSubtotal || !modalTax || !modalFinalTotal) {
		console.error('❌ Modal elements not found');
		return;
	}
	
	// Check if cart is available (from script.js)
	console.log('🛒 Cart status:', typeof cart, cart ? cart.length : 'undefined');
	if (typeof cart === 'undefined' || !cart.length) {
		console.log('🛒 Cart is empty or undefined');
		modalCartItems.innerHTML = '<p class="empty-cart-message">No hay artículos en el carrito</p>';
		modalSubtotal.textContent = '$0.00';
		modalTax.textContent = '$0.00';
		modalFinalTotal.textContent = '$0.00';
		return;
	}
	
	console.log('🛒 Cart has items:', cart.length);
	
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

// Function to create order payload
function createOrderPayload() {
	const name = document.getElementById('client-name').value.trim();
	const email = document.getElementById('client-email').value.trim();
	const phone = document.getElementById('client-phone').value.trim();
	const deliveryDate = document.getElementById('delivery-date').value;
	const note = document.getElementById('order-note').value.trim();

	// Debug: verificar que la fecha se obtiene correctamente
	console.log('Delivery date from form:', deliveryDate);
	console.log('Form element:', document.getElementById('delivery-date'));

	// Create items array from cart
	const items = cart.map(item => ({
		id_product: item.id,
		quantity: item.quantity
	}));

	// Create the order payload matching the backend structure
	const orderPayload = {
		name: name,
		email: email,
		phone: phone,
		delivery_date: deliveryDate || 'No especificada',
		note: note || '',
		items: items
	};

	// Debug: verificar el payload completo
	console.log('Order payload:', orderPayload);

	return orderPayload;
}

// Function to submit order to API
async function submitOrder() {
	const submitBtn = document.querySelector('#checkout-form button[type="submit"]');
	let originalText = 'Realizar Pedido';
	
	try {
		// Show loading state
		if (submitBtn) {
			originalText = submitBtn.textContent;
			submitBtn.disabled = true;
			submitBtn.textContent = 'Procesando...';
		}

		// Create order payload
		const orderPayload = createOrderPayload();
		
		debugLog('Submitting order:', orderPayload);

		// Submit order to API
		const order = await apiService.createOrder(orderPayload);
		
		debugLog('Order created successfully:', order);

		// Show success notification
		const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0) * 1.085;
		showNotification(`¡Orden creada exitosamente! Total: $${total.toFixed(2)}`, 'success');

		// Open WhatsApp with order details
		openWhatsAppWithOrder(orderPayload, total);

		// Clear cart and close modal
		if (typeof clearCart === 'function') clearCart();
		closeCheckoutModal();

	} catch (error) {
		errorLog('Failed to create order:', error);
		
		// Show error notification
		showNotification('Error al crear la orden. Por favor intenta de nuevo.', 'error');
		
	} finally {
		// Reset button state
		if (submitBtn) {
			submitBtn.disabled = false;
			submitBtn.textContent = originalText;
		}
	}
}

// Function to open WhatsApp with order details
function openWhatsAppWithOrder(orderData, total) {
	// Verificar si WhatsApp está habilitado
	if (!CONFIG.whatsapp.enabled) {
		showNotification('Integración con WhatsApp deshabilitada', 'warning');
		return;
	}
	
	// Obtener número de WhatsApp de la configuración
	const phoneNumber = CONFIG.whatsapp.phoneNumber.replace(/[^\d]/g, ''); // Remover caracteres no numéricos
	
	// Crear lista de items formateada (más simple)
	const itemsList = orderData.items.map(item => {
		const product = cart.find(cartItem => cartItem.id === item.id_product);
		return `${product ? product.name : 'Producto'} x${item.quantity}`;
	}).join(', ');
	
	// Crear nota si existe
	const noteText = orderData.note ? `\nNota: ${orderData.note}` : '';
	
	// Formatear fecha de entrega
	const deliveryDateFormatted = orderData.delivery_date && orderData.delivery_date !== 'No especificada' 
		? new Date(orderData.delivery_date).toLocaleDateString('es-ES')
		: 'No especificada';

	// Crear mensaje más simple y corto
	const message = `Hola! Quiero hacer un pedido:

Pedido: ${itemsList}
Total: $${total.toFixed(2)}

Datos:
- Nombre: ${orderData.name}
- Telefono: ${orderData.phone}
- Email: ${orderData.email}
- Fecha entrega: ${deliveryDateFormatted}${noteText}

Puedes confirmar el pedido?`;

	// Detectar si es WhatsApp Web
	const isWhatsAppWeb = window.location.hostname.includes('web.whatsapp.com') || 
						  document.referrer.includes('web.whatsapp.com') ||
						  navigator.userAgent.includes('WhatsApp');
	
	// Debug: mostrar información
	console.log('WhatsApp URL:', `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`);
	console.log('Mensaje original:', message);
	console.log('Es WhatsApp Web:', isWhatsAppWeb);
	
	if (isWhatsAppWeb) {
		// Para WhatsApp Web, mostrar modal con instrucciones
		showWhatsAppWebInstructions(message, phoneNumber);
	} else {
		// Para WhatsApp móvil, usar método normal
		openWhatsAppMobile(message, phoneNumber);
	}
}

// Function to open WhatsApp mobile
function openWhatsAppMobile(message, phoneNumber) {
	const encodedMessage = encodeURIComponent(message);
	const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodedMessage}`;
	
	try {
		window.open(whatsappUrl, '_blank');
		showNotification('Abriendo WhatsApp para coordinar el pedido...', 'info');
	} catch (error) {
		console.error('Error abriendo WhatsApp:', error);
		showWhatsAppWebInstructions(message, phoneNumber);
	}
}

// Function to show instructions for WhatsApp Web
function showWhatsAppWebInstructions(message, phoneNumber) {
	// Crear modal con instrucciones
	const modal = document.createElement('div');
	modal.className = 'modal';
	modal.innerHTML = `
		<div class="modal-backdrop" data-close></div>
		<div class="modal-content" style="max-width: 500px;">
			<button class="modal-close" data-close>&times;</button>
			<h3>📱 Instrucciones para WhatsApp</h3>
			<div style="padding: 1rem;">
				<p><strong>WhatsApp Web detectado</strong></p>
				<p>Para enviar tu pedido:</p>
				<ol style="text-align: left; margin: 1rem 0;">
					<li>Copia el mensaje de abajo</li>
					<li>Abre WhatsApp Web</li>
					<li>Busca el número: <strong>+${phoneNumber}</strong></li>
					<li>Pega el mensaje y envía</li>
				</ol>
				<div style="background: #f8f9fa; padding: 1rem; border-radius: 8px; margin: 1rem 0;">
					<textarea readonly style="width: 100%; height: 150px; border: none; background: transparent; resize: none; font-family: monospace; font-size: 0.9rem;">${message}</textarea>
				</div>
				<div style="display: flex; gap: 1rem; justify-content: center;">
					<button id="copy-whatsapp-message" class="btn btn-primary">📋 Copiar Mensaje</button>
					<button class="btn btn-secondary" data-close>Cerrar</button>
				</div>
			</div>
		</div>
	`;
	
	document.body.appendChild(modal);
	
	// Mostrar modal
	setTimeout(() => modal.classList.remove('hidden'), 100);
	
	// Event listeners
	modal.addEventListener('click', (e) => {
		if (e.target.hasAttribute('data-close')) {
			modal.remove();
		}
	});
	
	// Copiar mensaje
	document.getElementById('copy-whatsapp-message').addEventListener('click', () => {
		navigator.clipboard.writeText(message).then(() => {
			showNotification('Mensaje copiado al portapapeles', 'success');
			modal.remove();
		}).catch(() => {
			showNotification('Error al copiar mensaje', 'error');
		});
	});
}


