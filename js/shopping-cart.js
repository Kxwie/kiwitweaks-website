/**
 * Shopping Cart System
 * Handles cart functionality, storage, and UI updates
 */

class ShoppingCart {
    constructor() {
        this.items = this.loadCart();
        this.isOpen = false;
        this.init();
    }

    init() {
        this.createCartHTML();
        this.bindEvents();
        this.updateCartUI();
        console.log('✅ Shopping cart initialized');
    }

    // Create cart dropdown HTML
    createCartHTML() {
        const cartIcon = document.querySelector('.nav-cart');
        if (!cartIcon) return;

        // Add cart badge
        const badge = document.createElement('span');
        badge.className = 'cart-badge';
        badge.textContent = '0';
        cartIcon.appendChild(badge);

        // Create cart dropdown
        const dropdown = document.createElement('div');
        dropdown.className = 'cart-dropdown';
        dropdown.innerHTML = `
            <div class="cart-header">
                <h3><i class="fas fa-shopping-cart"></i> Shopping Cart</h3>
            </div>
            <div class="cart-content">
                <div class="cart-items"></div>
                <div class="cart-empty" style="display: none;">
                    <i class="fas fa-shopping-cart"></i>
                    <h4>Your cart is empty</h4>
                    <p>Add some items to get started!</p>
                </div>
            </div>
            <div class="cart-footer" style="display: none;">
                <div class="cart-total">
                    <span>Total:</span>
                    <span class="cart-total-amount">$0.00</span>
                </div>
                <div class="cart-actions">
                    <button class="cart-btn cart-btn-secondary" id="clearCart">
                        <i class="fas fa-trash"></i> Clear
                    </button>
                    <button class="cart-btn cart-btn-primary" id="checkoutCart">
                        <i class="fas fa-credit-card"></i> Checkout
                    </button>
                </div>
            </div>
        `;

        cartIcon.appendChild(dropdown);
    }

    // Bind event listeners
    bindEvents() {
        const cartIcon = document.querySelector('.nav-cart');
        const dropdown = document.querySelector('.cart-dropdown');
        
        if (!cartIcon || !dropdown) return;

        // Toggle cart dropdown
        cartIcon.addEventListener('click', (e) => {
            // Only toggle cart if clicking the icon itself, not the link
            if (e.target === cartIcon || e.target.closest('.nav-cart') === cartIcon) {
                e.preventDefault();
                e.stopPropagation();
                this.toggleCart();
            }
        });

        // Close cart when clicking outside
        document.addEventListener('click', (e) => {
            if (!cartIcon.contains(e.target)) {
                this.closeCart();
            }
        });

        // Clear cart button
        const clearBtn = dropdown.querySelector('#clearCart');
        if (clearBtn) {
            clearBtn.addEventListener('click', () => this.clearCart());
        }

        // Checkout button
        const checkoutBtn = dropdown.querySelector('#checkoutCart');
        if (checkoutBtn) {
            checkoutBtn.addEventListener('click', () => this.checkout());
        }

        // Add to cart buttons
        this.bindAddToCartButtons();
    }

    // Bind add to cart buttons
    bindAddToCartButtons() {
        const addButtons = document.querySelectorAll('[data-add-to-cart]');
        addButtons.forEach(button => {
            // Skip if already has cart handler
            if (button.hasAttribute('data-cart-handler')) return;
            button.setAttribute('data-cart-handler', 'true');
            
            button.addEventListener('click', (e) => {
                // Only add to cart, don't prevent modal from opening
                const productData = this.getProductData(button);
                this.addItem(productData);
                // Don't prevent default - let the modal still open
            }, { passive: false });
        });
    }

    // Get product data from button
    getProductData(button) {
        return {
            id: button.dataset.productId || 'kiwitweaks-premium',
            name: button.dataset.productName || 'KiwiTweaks Premium',
            price: parseFloat(button.dataset.productPrice || '29.99'),
            image: button.dataset.productImage || 'fas fa-rocket'
        };
    }

    // Add item to cart
    addItem(product) {
        const existingItem = this.items.find(item => item.id === product.id);
        
        if (existingItem) {
            // Show already in cart message
            this.showNotification('Item already in cart!', 'warning');
            return;
        }

        this.items.push({
            ...product,
            quantity: 1,
            addedAt: Date.now()
        });

        this.saveCart();
        this.updateCartUI();
        this.showNotification(`${product.name} added to cart!`, 'success');
        this.animateCartIcon();
    }

    // Remove item from cart
    removeItem(productId) {
        const itemElement = document.querySelector(`[data-cart-item="${productId}"]`);
        if (itemElement) {
            itemElement.classList.add('cart-item-remove-animation');
            setTimeout(() => {
                this.items = this.items.filter(item => item.id !== productId);
                this.saveCart();
                this.updateCartUI();
            }, 300);
        }
    }

    // Clear entire cart
    clearCart() {
        if (this.items.length === 0) return;
        
        if (confirm('Are you sure you want to clear your cart?')) {
            this.items = [];
            this.saveCart();
            this.updateCartUI();
            this.showNotification('Cart cleared!', 'info');
        }
    }

    // Update cart UI
    updateCartUI() {
        this.updateCartBadge();
        this.updateCartItems();
        this.updateCartTotal();
        this.updateCartVisibility();
    }

    // Update cart badge
    updateCartBadge() {
        const badge = document.querySelector('.cart-badge');
        if (!badge) return;

        const itemCount = this.items.length;
        badge.textContent = itemCount;
        
        if (itemCount > 0) {
            badge.classList.add('show');
        } else {
            badge.classList.remove('show');
        }
    }

    // Update cart items display
    updateCartItems() {
        const itemsContainer = document.querySelector('.cart-items');
        if (!itemsContainer) return;

        itemsContainer.innerHTML = '';

        this.items.forEach(item => {
            const itemElement = document.createElement('div');
            itemElement.className = 'cart-item cart-item-enter';
            itemElement.setAttribute('data-cart-item', item.id);
            
            itemElement.innerHTML = `
                <div class="cart-item-image">
                    <i class="${item.image}"></i>
                </div>
                <div class="cart-item-details">
                    <div class="cart-item-name">${item.name}</div>
                    <div class="cart-item-price">$${item.price.toFixed(2)}</div>
                </div>
                <button class="cart-item-remove" onclick="cart.removeItem('${item.id}')">
                    <i class="fas fa-times"></i>
                </button>
            `;

            itemsContainer.appendChild(itemElement);
        });
    }

    // Update cart total
    updateCartTotal() {
        const totalElement = document.querySelector('.cart-total-amount');
        if (!totalElement) return;

        const total = this.items.reduce((sum, item) => sum + item.price, 0);
        totalElement.textContent = `$${total.toFixed(2)}`;
    }

    // Update cart visibility
    updateCartVisibility() {
        const emptyState = document.querySelector('.cart-empty');
        const footer = document.querySelector('.cart-footer');
        
        if (this.items.length === 0) {
            emptyState.style.display = 'block';
            footer.style.display = 'none';
        } else {
            emptyState.style.display = 'none';
            footer.style.display = 'block';
        }
    }

    // Toggle cart dropdown
    toggleCart() {
        const dropdown = document.querySelector('.cart-dropdown');
        if (!dropdown) return;

        if (this.isOpen) {
            this.closeCart();
        } else {
            this.openCart();
        }
    }

    // Open cart dropdown
    openCart() {
        const dropdown = document.querySelector('.cart-dropdown');
        if (!dropdown) return;

        dropdown.classList.add('show');
        this.isOpen = true;
        document.body.style.overflow = 'hidden';
    }

    // Close cart dropdown
    closeCart() {
        const dropdown = document.querySelector('.cart-dropdown');
        if (!dropdown) return;

        dropdown.classList.remove('show');
        this.isOpen = false;
        document.body.style.overflow = '';
    }

    // Animate cart icon when item added
    animateCartIcon() {
        const cartIcon = document.querySelector('.nav-cart i');
        if (!cartIcon) return;

        cartIcon.style.animation = 'none';
        setTimeout(() => {
            cartIcon.style.animation = 'cartBounce 0.5s cubic-bezier(0.4, 0, 0.2, 1)';
        }, 10);
    }

    // Show notification
    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `cart-notification cart-notification-${type}`;
        notification.innerHTML = `
            <i class="fas fa-${type === 'success' ? 'check' : type === 'warning' ? 'exclamation' : 'info'}"></i>
            <span>${message}</span>
        `;

        // Add styles
        notification.style.cssText = `
            position: fixed;
            top: 100px;
            right: 20px;
            background: ${type === 'success' ? '#10b981' : type === 'warning' ? '#f59e0b' : '#6366f1'};
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 50px;
            display: flex;
            align-items: center;
            gap: 0.5rem;
            font-weight: 600;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
            z-index: 10000;
            transform: translateX(100%);
            transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        `;

        document.body.appendChild(notification);

        // Animate in
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 100);

        // Remove after delay
        setTimeout(() => {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                notification.remove();
            }, 300);
        }, 3000);
    }

    // Checkout process
    checkout() {
        if (this.items.length === 0) {
            this.showNotification('Your cart is empty!', 'warning');
            return;
        }

        // Close cart and open purchase modal
        this.closeCart();
        
        // Trigger purchase modal with cart items
        const purchaseModal = document.querySelector('[data-purchase-modal]');
        if (purchaseModal) {
            purchaseModal.click();
        }
    }

    // Save cart to localStorage
    saveCart() {
        localStorage.setItem('kiwitweaks_cart', JSON.stringify(this.items));
    }

    // Load cart from localStorage
    loadCart() {
        try {
            const saved = localStorage.getItem('kiwitweaks_cart');
            return saved ? JSON.parse(saved) : [];
        } catch (error) {
            console.warn('Failed to load cart from localStorage:', error);
            return [];
        }
    }

    // Get cart summary for checkout
    getCartSummary() {
        return {
            items: this.items,
            total: this.items.reduce((sum, item) => sum + item.price, 0),
            count: this.items.length
        };
    }
}

// Initialize cart when DOM is ready
let cart;

function initializeCart() {
    cart = new ShoppingCart();
    
    // Make cart globally available
    window.cart = cart;
    
    // Don't auto-add cart functionality to modal buttons
    // Cart is only triggered when user explicitly clicks "Add to Cart"
    // Purchase modal buttons should just open the modal
}

// Auto-initialize
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeCart);
} else {
    initializeCart();
}
