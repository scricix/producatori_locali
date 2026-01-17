const App = {
    currentProductImages: [],
    currentImageIndex: 0,

    init: () => {
        App.loadFeaturedProducts();
        App.updateCartCount();
        App.setupToast();
        App.updateHeader();

        // Close modal on click outside
        window.onclick = (event) => {
            const modal = document.getElementById('product-modal');
            const lightbox = document.getElementById('lightbox');
            if (event.target == modal) App.closeProductModal();
            if (event.target == lightbox) App.closeLightbox();
        };

        // Keyboard navigation for lightbox
        window.addEventListener('keydown', (e) => {
            if (document.getElementById('lightbox') && document.getElementById('lightbox').style.display === 'flex') {
                if (e.key === 'ArrowRight') App.nextLightboxImage();
                if (e.key === 'ArrowLeft') App.prevLightboxImage();
                if (e.key === 'Escape') App.closeLightbox();
            } else if (document.getElementById('product-modal') && document.getElementById('product-modal').style.display === 'block') {
                if (e.key === 'Escape') App.closeProductModal();
            }
        });
    },

    toggleMobileMenu: () => {
        const menu = document.getElementById('mobile-menu');
        const overlay = document.getElementById('mobile-menu-overlay');
        if (!menu || !overlay) return;
        menu.classList.toggle('active');
        overlay.classList.toggle('active');
        if (menu.classList.contains('active')) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'auto';
        }
    },

    updateHeader: () => {
        const user = JSON.parse(localStorage.getItem('user') || 'null');
        const authButtons = document.querySelectorAll('.auth-buttons');
        const mobileAuthButtons = document.getElementById('mobile-auth-buttons');

        const getAuthHtml = (isMobile = false) => {
            if (user) {
                return `
                    ${!isMobile ? `<span style="margin-right: 1rem; color: var(--text-dark);">Bună, <strong>${user.name.split(' ')[0]}</strong>!</span>` : ''}
                    ${user.role === 'producer' ? '<a href="producer-dashboard.html" class="btn btn-secondary"><i class="fas fa-tachometer-alt"></i> Dashboard</a>' : ''}
                    ${user.role === 'admin' ? '<a href="admin-dashboard.html" class="btn btn-secondary"><i class="fas fa-cog"></i> Admin</a>' : ''}
                    <button class="btn btn-primary" onclick="App.logout()"><i class="fas fa-sign-out-alt"></i> Deconectare</button>
                    ${isMobile ? `<p style="margin-top: 1rem; text-align: center; color: var(--text-muted);">Autentificat ca <strong>${user.name}</strong></p>` : ''}
                `;
            } else {
                return `
                    <a href="login.html" class="btn btn-secondary">Autentificare</a>
                    <a href="register.html" class="btn btn-primary">Înregistrare</a>
                `;
            }
        };

        authButtons.forEach(btn => btn.innerHTML = getAuthHtml(false));
        if (mobileAuthButtons) mobileAuthButtons.innerHTML = getAuthHtml(true);
    },

    logout: () => {
        localStorage.removeItem('user');
        localStorage.removeItem('cart');
        App.showToast('👋 Te-ai deconectat cu succes');
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 1000);
    },

    loadFeaturedProducts: async () => {
        const container = document.getElementById('featured-products');
        if (!container) return;

        try {
            const response = await fetch('api/get_products.php?limit=4');
            const result = await response.json();

            if (result.success && result.data.length > 0) {
                container.innerHTML = result.data.map(product => App.createProductCard(product)).join('');
            } else {
                container.innerHTML = '<p class="text-center text-muted" style="grid-column: 1/-1;">Nu există produse momentan.</p>';
            }
        } catch (error) {
            console.error('Error loading products:', error);
            container.innerHTML = '<p class="text-center text-error" style="grid-column: 1/-1;">Eroare la încărcarea produselor.</p>';
        }
    },

    createProductCard: (product) => {
        const categoryDisplay = product.category ? product.category.charAt(0).toUpperCase() + product.category.slice(1) : 'Altele';
        const image = product.image || 'images/placeholder.png';
        return `
            <div class="card" onclick="App.openProductModal(${product.id})" style="cursor: pointer;">
                <span class="badge badge-category">${categoryDisplay}</span>
                <img src="${image}" alt="${product.title}" class="card-img" onerror="this.src='images/placeholder.png'">
                <div class="card-body">
                    <h3 class="card-title">${product.title}</h3>
                    <p class="card-subtitle"><i class="fas fa-map-marker-alt"></i> ${product.city || 'România'}</p>
                    <div class="card-actions" onclick="event.stopPropagation()">
                        <span class="card-price">${parseFloat(product.price).toFixed(2)} Lei</span>
                        <button class="btn btn-icon" onclick="App.addToCart(${product.id}, '${product.title}', ${product.price}, '${image}', 1, '${product.producer_email}')" title="Adaugă în coș">
                            <i class="fas fa-plus"></i>
                        </button>
                    </div>
                </div>
            </div>
        `;
    },

    openProductModal: async (productId) => {
        try {
            const response = await fetch(`api/get_product_details.php?id=${productId}`);
            const result = await response.json();

            if (result.success) {
                const p = result.data;
                App.currentProductImages = p.images && p.images.length > 0
                    ? p.images.map(img => ({ image_path: img.image_path }))
                    : [{ image_path: p.image_path }];
                App.currentImageIndex = 0;

                // Set content
                const modal = document.getElementById('product-modal');
                if (!modal) return;

                document.getElementById('modal-title').textContent = p.product_name;
                document.getElementById('modal-producer').textContent = `Vândut de: ${p.producer_name}`;
                document.getElementById('modal-price').textContent = `${parseFloat(p.price).toFixed(2)} Lei / ${p.unit}`;
                document.getElementById('modal-description').textContent = p.description || 'Nicio descriere disponibilă.';
                document.getElementById('modal-category').textContent = p.category.toUpperCase();
                document.getElementById('modal-location').textContent = `${p.city}, ${p.county}`;
                document.getElementById('modal-qty').value = 1;

                App.renderModalImages();

                document.getElementById('modal-add-btn').onclick = () => {
                    const qty = parseInt(document.getElementById('modal-qty').value);
                    App.addToCart(p.id, p.product_name, p.price, App.currentProductImages[0].image_path, qty, p.user_email);
                    App.closeProductModal();
                };

                modal.style.display = 'block';
                document.body.style.overflow = 'hidden';
            }
        } catch (e) {
            console.error(e);
            App.showToast('❌ Eroare la încărcarea detaliilor produsului.');
        }
    },

    renderModalImages: () => {
        const mainImg = document.getElementById('modal-main-image');
        const thumbs = document.getElementById('modal-thumbnails');
        if (!mainImg || !thumbs) return;

        mainImg.src = App.currentProductImages[App.currentImageIndex].image_path || 'images/placeholder.png';
        mainImg.onclick = () => App.openLightbox(App.currentImageIndex);

        thumbs.innerHTML = App.currentProductImages.map((img, idx) => `
            <img src="${img.image_path}" 
                 onclick="App.setModalImage(${idx})" 
                 style="width: 80px; min-width: 80px; height: 80px; object-fit: cover; border-radius: 8px; cursor: pointer; border: 2px solid ${idx === App.currentImageIndex ? 'var(--primary)' : 'transparent'}; opacity: ${idx === App.currentImageIndex ? '1' : '0.6'}; transition: all 0.2s;"
                 onmouseover="this.style.opacity='1'"
                 onmouseout="if(${idx} !== App.currentImageIndex) this.style.opacity='0.6'"
                 onerror="this.src='images/placeholder.png'">
        `).join('');
    },

    setModalImage: (index) => {
        App.currentImageIndex = index;
        App.renderModalImages();
    },

    updateModalQty: (change) => {
        const input = document.getElementById('modal-qty');
        if (!input) return;
        let val = parseInt(input.value) + change;
        if (val < 1) val = 1;
        input.value = val;
    },

    closeProductModal: () => {
        const modal = document.getElementById('product-modal');
        if (modal) modal.style.display = 'none';
        document.body.style.overflow = 'auto';
    },

    openLightbox: (index) => {
        App.currentImageIndex = index;
        const lbImg = document.getElementById('lightbox-image');
        const lbCnt = document.getElementById('lightbox-counter');
        const lb = document.getElementById('lightbox');
        if (!lbImg || !lbCnt || !lb) return;

        lbImg.src = App.currentProductImages[index].image_path;
        lbCnt.textContent = `${index + 1} / ${App.currentProductImages.length}`;
        lb.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    },

    closeLightbox: () => {
        const lb = document.getElementById('lightbox');
        if (!lb) return;
        lb.style.display = 'none';
        if (document.getElementById('product-modal') && document.getElementById('product-modal').style.display !== 'block') {
            document.body.style.overflow = 'auto';
        }
    },

    nextLightboxImage: () => {
        App.currentImageIndex = (App.currentImageIndex + 1) % App.currentProductImages.length;
        App.openLightbox(App.currentImageIndex);
    },

    prevLightboxImage: () => {
        App.currentImageIndex = (App.currentImageIndex - 1 + App.currentProductImages.length) % App.currentProductImages.length;
        App.openLightbox(App.currentImageIndex);
    },

    addToCart: (id, title, price, image, quantity = 1, producerEmail = '') => {
        let cart = JSON.parse(localStorage.getItem('cart')) || [];
        const existingItem = cart.find(item => item.id === id);

        if (existingItem) {
            existingItem.quantity += quantity;
        } else {
            cart.push({ id, title, price, image, quantity, producer_email: producerEmail });
        }

        localStorage.setItem('cart', JSON.stringify(cart));
        App.updateCartCount();
        App.showToast(`✅ ${title} a fost adăugat în coș!`);
    },

    updateCartCount: () => {
        const cart = JSON.parse(localStorage.getItem('cart')) || [];
        const count = cart.reduce((total, item) => total + item.quantity, 0);
        const badge = document.getElementById('cart-count');
        if (badge) badge.textContent = count;
    },

    showToast: (message) => {
        const container = document.getElementById('toast-container');
        if (!container) return;
        const toast = document.createElement('div');
        toast.className = 'toast';
        toast.innerHTML = `<span>${message}</span>`;
        container.appendChild(toast);

        setTimeout(() => {
            toast.style.animation = 'slideIn 0.3s ease-in reverse forwards';
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    },

    setupToast: () => { }
};

document.addEventListener('DOMContentLoaded', App.init);
