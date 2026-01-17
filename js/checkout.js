const CheckoutPage = {
    cart: [],
    user: null,

    init: () => {
        CheckoutPage.loadCart();
        CheckoutPage.loadUser();
        CheckoutPage.renderSummary();
        CheckoutPage.prefillForm();
        App.updateCartCount();
    },

    loadCart: () => {
        CheckoutPage.cart = JSON.parse(localStorage.getItem('cart')) || [];
        if (CheckoutPage.cart.length === 0) {
            window.location.href = 'cart.html';
        }
    },

    loadUser: () => {
        CheckoutPage.user = JSON.parse(localStorage.getItem('user') || 'null');
    },

    prefillForm: () => {
        if (CheckoutPage.user) {
            document.getElementById('cust-name').value = CheckoutPage.user.name || '';
            document.getElementById('cust-email').value = CheckoutPage.user.email || '';
        }
    },

    renderSummary: () => {
        const container = document.getElementById('checkout-items');
        let total = 0;

        container.innerHTML = CheckoutPage.cart.map(item => {
            const subtotal = parseFloat(item.price) * item.quantity;
            total += subtotal;
            return `
                <div class="flex justify-between items-center" style="padding: 0.5rem 0; border-bottom: 1px solid #eee;">
                    <div style="flex: 1;">
                        <span style="font-weight: 600;">${item.title}</span>
                        <div style="font-size: 0.8rem; color: var(--text-muted);">x${item.quantity}</div>
                    </div>
                    <span style="font-weight: 600;">${subtotal.toFixed(2)} Lei</span>
                </div>
            `;
        }).join('');

        document.getElementById('order-total').textContent = total.toFixed(2) + ' Lei';
    },

    placeOrder: async (event) => {
        event.preventDefault();

        const btn = document.getElementById('place-order-btn');
        btn.disabled = true;
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Se procesează...';

        const orderData = {
            user_id: CheckoutPage.user ? CheckoutPage.user.id : null,
            customer_name: document.getElementById('cust-name').value,
            customer_phone: document.getElementById('cust-phone').value,
            customer_email: document.getElementById('cust-email').value,
            delivery_county: document.getElementById('del-county').value,
            delivery_city: document.getElementById('del-city').value,
            delivery_address: document.getElementById('del-address').value,
            payment_method: document.querySelector('input[name="payment"]:checked').value,
            notes: document.getElementById('order-notes').value,
            total_amount: CheckoutPage.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0),
            items: CheckoutPage.cart
        };

        try {
            const response = await fetch('api/place_order.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(orderData)
            });

            const result = await response.json();

            if (result.success) {
                localStorage.removeItem('cart');
                App.updateCartCount();
                document.getElementById('success-modal').style.display = 'flex';
            } else {
                App.showToast('❌ ' + result.message);
                btn.disabled = false;
                btn.innerHTML = '<i class="fas fa-check-circle"></i> Plasează Comanda';
            }
        } catch (error) {
            console.error('Order Error:', error);
            App.showToast('❌ Eroare la trimiterea comenzii. Încearcă din nou.');
            btn.disabled = false;
            btn.innerHTML = '<i class="fas fa-check-circle"></i> Plasează Comanda';
        }
    }
};

document.addEventListener('DOMContentLoaded', CheckoutPage.init);
