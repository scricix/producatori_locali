const CartPage = {
    cart: [],

    init: () => {
        CartPage.loadCart();
        CartPage.renderCart();
        App.updateCartCount();
        App.updateHeader();
    },

    loadCart: () => {
        CartPage.cart = JSON.parse(localStorage.getItem('cart')) || [];
    },

    renderCart: () => {
        const container = document.getElementById('cart-items');
        const emptyCart = document.getElementById('empty-cart');

        if (CartPage.cart.length === 0) {
            container.style.display = 'none';
            emptyCart.style.display = 'block';
            CartPage.updateSummary();
            return;
        }

        container.style.display = 'flex';
        emptyCart.style.display = 'none';

        container.innerHTML = CartPage.cart.map((item, index) => `
            <div class="card" style="display: flex; flex-wrap: wrap; padding: var(--spacing-md); gap: var(--spacing-md); align-items: center;">
                <img src="${item.image}" alt="${item.title}" style="width: 100px; height: 100px; object-fit: cover; border-radius: var(--border-radius-md);" onerror="this.src='images/placeholder.png'">
                <div style="flex: 1; min-width: 200px;">
                    <h3 style="margin-bottom: 0.25rem;">${item.title}</h3>
                    <p class="text-muted" style="font-size: 0.85rem;">Preț unitar: ${parseFloat(item.price).toFixed(2)} Lei</p>
                    <div class="flex items-center gap-sm" style="margin-top: 0.5rem;">
                        <button class="btn-icon" onclick="CartPage.updateQuantity(${index}, -1)" style="width: 28px; height: 28px;">
                            <i class="fas fa-minus"></i>
                        </button>
                        <span style="min-width: 30px; text-align: center; font-weight: 600;">${item.quantity}</span>
                        <button class="btn-icon" onclick="CartPage.updateQuantity(${index}, 1)" style="width: 28px; height: 28px;">
                            <i class="fas fa-plus"></i>
                        </button>
                    </div>
                </div>
                <div style="text-align: right; display: flex; flex-direction: column; justify-content: space-between; height: 100%;">
                    <button class="btn-icon" onclick="CartPage.removeItem(${index})" style="background: var(--error); color: white; margin-bottom: 1rem;">
                        <i class="fas fa-trash"></i>
                    </button>
                    <p style="font-size: 1.1rem; font-weight: 700; color: var(--primary-dark);">
                        ${(parseFloat(item.price) * item.quantity).toFixed(2)} Lei
                    </p>
                </div>
            </div>
        `).join('');

        CartPage.updateSummary();
    },

    updateQuantity: (index, change) => {
        CartPage.cart[index].quantity += change;

        if (CartPage.cart[index].quantity <= 0) {
            CartPage.removeItem(index);
            return;
        }

        localStorage.setItem('cart', JSON.stringify(CartPage.cart));
        CartPage.renderCart();
        App.updateCartCount();
    },

    removeItem: (index) => {
        const itemName = CartPage.cart[index].title;
        CartPage.cart.splice(index, 1);
        localStorage.setItem('cart', JSON.stringify(CartPage.cart));
        CartPage.renderCart();
        App.updateCartCount();
        App.showToast(`🗑️ ${itemName} a fost eliminat din coș`);
    },

    updateSummary: () => {
        const subtotal = CartPage.cart.reduce((sum, item) => sum + (parseFloat(item.price) * item.quantity), 0);

        document.getElementById('subtotal').textContent = subtotal.toFixed(2) + ' Lei';
        document.getElementById('total').textContent = subtotal.toFixed(2) + ' Lei';

        const checkoutBtn = document.getElementById('checkout-btn');
        if (CartPage.cart.length === 0) {
            checkoutBtn.style.opacity = '0.5';
            checkoutBtn.style.pointerEvents = 'none';
        } else {
            checkoutBtn.style.opacity = '1';
            checkoutBtn.style.pointerEvents = 'auto';
        }
    }
};

document.addEventListener('DOMContentLoaded', CartPage.init);
