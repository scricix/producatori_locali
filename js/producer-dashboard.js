const ProducerDashboard = {
    user: null,
    selectedFiles: [], // For adding product
    editSelectedFiles: [], // For editing product

    init: () => {
        ProducerDashboard.checkAuth();
        ProducerDashboard.loadStats();
        ProducerDashboard.loadMyProducts();
        ProducerDashboard.loadOrders();
        ProducerDashboard.setupImagePreview();
    },

    checkAuth: () => {
        const user = JSON.parse(localStorage.getItem('user') || 'null');
        if (!user || user.role !== 'producer') {
            window.location.href = 'login.html';
            return;
        }
        ProducerDashboard.user = user;
        document.getElementById('user-name').textContent = user.name;
    },

    logout: () => {
        localStorage.removeItem('user');
        window.location.href = 'index.html';
    },

    switchTab: (tabName) => {
        document.querySelectorAll('.tab-content').forEach(tab => tab.style.display = 'none');
        document.querySelectorAll('[id^="tab-"]').forEach(btn => {
            btn.style.borderBottom = 'none';
        });

        document.getElementById('tab-content-' + tabName).style.display = 'block';
        document.getElementById('tab-' + tabName).style.borderBottom = '3px solid var(--primary)';

        if (tabName === 'orders') ProducerDashboard.loadOrders();
        if (tabName === 'products') ProducerDashboard.loadMyProducts();
    },

    loadStats: async () => {
        try {
            // Products count
            const pResp = await fetch(`api/get_products.php?producer_email=${ProducerDashboard.user.email}`);
            const pResult = await pResp.json();
            if (pResult.success) {
                document.getElementById('total-products').textContent = pResult.data.length;
            }

            // Orders count
            const oResp = await fetch(`api/get_producer_orders.php?email=${ProducerDashboard.user.email}`);
            const oResult = await oResp.json();
            if (oResult.success) {
                const newOrders = oResult.data.filter(o => o.status === 'new').length;
                document.getElementById('total-orders').textContent = newOrders;

                // Calculate revenue from completed orders
                const revenue = oResult.data
                    .filter(o => o.status === 'completed')
                    .reduce((sum, o) => {
                        // Only count subtotal of items belonging to this producer
                        const producerSubtotal = o.items.reduce((s, item) => s + parseFloat(item.subtotal), 0);
                        return sum + producerSubtotal;
                    }, 0);
                document.getElementById('total-revenue').textContent = revenue.toFixed(2) + ' Lei';
            }
        } catch (e) { console.error(e); }
    },

    loadMyProducts: async () => {
        const container = document.getElementById('my-products-grid');
        try {
            const response = await fetch(`api/get_products.php?producer_email=${ProducerDashboard.user.email}`);
            const result = await response.json();

            if (result.success && result.data.length > 0) {
                container.innerHTML = result.data.map(product => `
                    <div class="card">
                        <img src="${product.image}" alt="${product.title}" class="card-img" onerror="this.src='images/placeholder.png'">
                        <div class="card-body">
                            <h3 class="card-title">${product.title}</h3>
                            <p class="card-price">${parseFloat(product.price).toFixed(2)} Lei</p>
                            <div class="flex gap-sm" style="margin-top: 1rem;">
                                <button class="btn btn-secondary" style="flex: 1;" onclick="ProducerDashboard.editProduct(${product.id})">
                                    <i class="fas fa-edit"></i> Editează
                                </button>
                                <button class="btn" style="flex: 1; background: var(--error); color: white;" onclick="ProducerDashboard.deleteProduct(${product.id})">
                                    <i class="fas fa-trash"></i>
                                </button>
                            </div>
                        </div>
                    </div>
                `).join('');
            } else {
                container.innerHTML = '<p class="text-muted" style="grid-column: 1/-1; text-align: center;">Nu ai produse încă.</p>';
            }
        } catch (error) {
            console.error('Error loading products:', error);
            container.innerHTML = '<p class="text-error">Eroare la încărcarea produselor.</p>';
        }
    },

    loadOrders: async () => {
        const container = document.getElementById('orders-list');
        if (!container) return;

        try {
            const response = await fetch(`api/get_producer_orders.php?email=${ProducerDashboard.user.email}`);
            const result = await response.json();

            if (result.success && result.data.length > 0) {
                container.innerHTML = result.data.map(order => `
                    <div class="card" style="margin-bottom: var(--spacing-md); border-left: 5px solid ${ProducerDashboard.getStatusColor(order.status)};">
                        <div style="padding: var(--spacing-md); background: #f8f9fa; border-bottom: 1px solid #eee; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem;">
                            <div>
                                <span style="font-weight: 700; font-size: 1.1rem;">Comanda #${order.id}</span>
                                <span class="badge" style="background: ${ProducerDashboard.getStatusColor(order.status)}; color: white; margin-left: 10px;">${order.status.toUpperCase()}</span>
                                <div class="text-muted" style="font-size: 0.85rem; margin-top: 4px;">Plasată pe: ${new Date(order.created_at).toLocaleString('ro-RO')}</div>
                            </div>
                            <div class="flex gap-sm">
                                <select onchange="ProducerDashboard.updateOrderStatus(${order.id}, this.value)" class="form-select" style="width: auto; padding: 0.4rem;">
                                    <option value="new" ${order.status === 'new' ? 'selected' : ''}>Nouă</option>
                                    <option value="processing" ${order.status === 'processing' ? 'selected' : ''}>În Procesare</option>
                                    <option value="completed" ${order.status === 'completed' ? 'selected' : ''}>Finalizată</option>
                                    <option value="cancelled" ${order.status === 'cancelled' ? 'selected' : ''}>Anulată</option>
                                </select>
                            </div>
                        </div>
                        <div style="padding: var(--spacing-md); display: flex; flex-wrap: wrap; gap: var(--spacing-xl);">
                             <div style="flex: 1; min-width: 250px;">
                                <h4 style="margin-bottom: var(--spacing-sm); color: var(--text-dark); border-bottom: 1px solid #eee; padding-bottom: 5px;">Detalii Client</h4>
                                <p><strong>Nume:</strong> ${order.customer_name}</p>
                                <p><strong>Tel:</strong> ${order.customer_phone}</p>
                                <p><strong>Email:</strong> ${order.customer_email}</p>
                                <p><strong>Adresă:</strong> ${order.delivery_city}, ${order.delivery_county} - ${order.delivery_address}</p>
                                ${order.notes ? `<p><strong>Note:</strong> ${order.notes}</p>` : ''}
                             </div>
                             <div style="flex: 1; min-width: 250px;">
                                <h4 style="margin-bottom: var(--spacing-sm); color: var(--text-dark); border-bottom: 1px solid #eee; padding-bottom: 5px;">Produsele Tale</h4>
                                <table style="width: 100%; border-collapse: collapse;">
                                    <thead>
                                        <tr style="text-align: left; font-size: 0.85rem; color: var(--text-muted); border-bottom: 1px solid #eee;">
                                            <th style="padding: 5px 0;">Produs</th>
                                            <th style="padding: 5px 0; text-align: center;">Buc.</th>
                                            <th style="padding: 5px 0; text-align: right;">Total</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        ${order.items.map(item => `
                                            <tr style="border-bottom: 1px solid #f9f9f9;">
                                                <td style="padding: 8px 0;">${item.product_name}</td>
                                                <td style="padding: 8px 0; text-align: center;">${item.quantity}</td>
                                                <td style="padding: 8px 0; text-align: right; font-weight: 600;">${parseFloat(item.subtotal).toFixed(2)} Lei</td>
                                            </tr>
                                        `).join('')}
                                    </tbody>
                                    <tfoot>
                                        <tr>
                                            <td colspan="2" style="padding-top: 10px; font-weight: 700;">Subtotal Producător:</td>
                                            <td style="padding-top: 10px; text-align: right; font-weight: 700; color: var(--primary-dark); font-size: 1.1rem;">
                                                ${order.items.reduce((sum, item) => sum + parseFloat(item.subtotal), 0).toFixed(2)} Lei
                                            </td>
                                        </tr>
                                    </tfoot>
                                </table>
                             </div>
                        </div>
                    </div>
                `).join('');
            } else {
                container.innerHTML = '<p class="text-muted text-center" style="padding: 3rem;">Nu s-au găsit comenzi.</p>';
            }
        } catch (error) {
            console.error('Error loading orders:', error);
            container.innerHTML = '<p class="text-error text-center">Eroare la încărcarea comenzilor.</p>';
        }
    },

    getStatusColor: (status) => {
        switch (status) {
            case 'new': return 'var(--info)';
            case 'processing': return 'var(--warning)';
            case 'completed': return 'var(--success)';
            case 'cancelled': return 'var(--error)';
            default: return 'var(--text-muted)';
        }
    },

    updateOrderStatus: async (orderId, newStatus) => {
        try {
            const formData = new FormData();
            formData.append('order_id', orderId);
            formData.append('status', newStatus);
            formData.append('producer_email', ProducerDashboard.user.email);

            const response = await fetch('api/update_order_status.php', {
                method: 'POST',
                body: formData
            });

            const result = await response.json();
            if (result.success) {
                App.showToast('✅ Status actualizat cu succes');
                ProducerDashboard.loadOrders();
                ProducerDashboard.loadStats();
            } else {
                App.showToast('❌ ' + result.message);
            }
        } catch (error) {
            App.showToast('❌ Eroare la actualizarea statusului');
        }
    },

    setupImagePreview: () => {
        const productImagesInput = document.getElementById('product-images');
        const editImagesInput = document.getElementById('edit-product-images');

        if (productImagesInput) {
            productImagesInput.addEventListener('change', (e) => {
                const newFiles = Array.from(e.target.files);
                ProducerDashboard.selectedFiles = [...ProducerDashboard.selectedFiles, ...newFiles].slice(0, 5);
                ProducerDashboard.renderPreview('image-preview', ProducerDashboard.selectedFiles);
            });
        }

        if (editImagesInput) {
            editImagesInput.addEventListener('change', (e) => {
                const newFiles = Array.from(e.target.files);
                ProducerDashboard.editSelectedFiles = [...ProducerDashboard.editSelectedFiles, ...newFiles].slice(0, 5);
                ProducerDashboard.renderPreview('edit-image-preview', ProducerDashboard.editSelectedFiles);
            });
        }
    },

    renderPreview: (containerId, files) => {
        const container = document.getElementById(containerId);
        if (!container) return;
        container.innerHTML = '';
        files.forEach((file, index) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                const div = document.createElement('div');
                div.style.position = 'relative';
                div.innerHTML = `
                    <img src="${e.target.result}" style="width: 100%; height: 100px; object-fit: cover; border-radius: 8px;">
                    <button type="button" onclick="ProducerDashboard.removeFile('${containerId}', ${index})" 
                        style="position: absolute; top: -5px; right: -5px; background: red; color: white; border: none; border-radius: 50%; width: 20px; height: 20px; cursor: pointer; font-size: 12px; display: flex; align-items: center; justify-content: center;">&times;</button>
                `;
                container.appendChild(div);
            };
            reader.readAsDataURL(file);
        });
    },

    removeFile: (containerId, index) => {
        if (containerId === 'image-preview') {
            ProducerDashboard.selectedFiles.splice(index, 1);
            ProducerDashboard.renderPreview(containerId, ProducerDashboard.selectedFiles);
        } else {
            ProducerDashboard.editSelectedFiles.splice(index, 1);
            ProducerDashboard.renderPreview(containerId, ProducerDashboard.editSelectedFiles);
        }
    },

    addProduct: async (event) => {
        event.preventDefault();
        const btn = event.target.querySelector('button[type="submit"]');
        btn.disabled = true;
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Se salvează...';

        const formData = new FormData(event.target);
        formData.append('user_email', ProducerDashboard.user.email);
        formData.append('producer_name', ProducerDashboard.user.name);

        formData.delete('images[]');
        ProducerDashboard.selectedFiles.forEach(file => {
            formData.append('images[]', file);
        });

        formData.append('product_name', document.getElementById('product-name').value);
        formData.append('category', document.getElementById('product-category').value);
        formData.append('description', document.getElementById('product-description').value);
        formData.append('price', document.getElementById('product-price').value);
        formData.append('unit', document.getElementById('product-unit').value);
        formData.append('stock_quantity', document.getElementById('product-stock').value);
        formData.append('county', document.getElementById('product-county').value);
        formData.append('city', document.getElementById('product-city').value);

        try {
            const response = await fetch('api/add_product.php', {
                method: 'POST',
                body: formData
            });
            const result = await response.json();
            if (result.success) {
                App.showToast('✅ Produs adăugat cu succes!');
                event.target.reset();
                ProducerDashboard.selectedFiles = [];
                ProducerDashboard.renderPreview('image-preview', []);
                ProducerDashboard.switchTab('products');
                ProducerDashboard.loadMyProducts();
                ProducerDashboard.loadStats();
            } else {
                App.showToast('❌ ' + result.message);
            }
        } catch (error) {
            App.showToast('❌ Eroare de rețea.');
        } finally {
            btn.disabled = false;
            btn.innerHTML = '<i class="fas fa-plus-circle"></i> Adaugă Produs';
        }
    },

    editProduct: async (id) => {
        try {
            const response = await fetch(`api/get_product_details.php?id=${id}`);
            const result = await response.json();

            if (result.success) {
                const p = result.data;
                document.getElementById('edit-product-id').value = p.id;
                document.getElementById('edit-product-name').value = p.product_name;
                document.getElementById('edit-product-category').value = p.category;
                document.getElementById('edit-product-description').value = p.description;
                document.getElementById('edit-product-price').value = p.price;
                document.getElementById('edit-product-unit').value = p.unit;
                document.getElementById('edit-product-stock').value = p.stock_quantity;
                document.getElementById('edit-product-county').value = p.county;
                document.getElementById('edit-product-city').value = p.city;

                ProducerDashboard.editSelectedFiles = [];
                ProducerDashboard.renderPreview('edit-image-preview', []);
                document.getElementById('edit-product-modal').style.display = 'block';
                document.body.style.overflow = 'hidden';
            }
        } catch (e) {
            App.showToast('❌ Nu s-au putut încărca detaliile.');
        }
    },

    closeEditModal: () => {
        document.getElementById('edit-product-modal').style.display = 'none';
        document.body.style.overflow = 'auto';
    },

    updateProduct: async (event) => {
        event.preventDefault();
        const btn = event.target.querySelector('button[type="submit"]');
        btn.disabled = true;
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Se actualizează...';

        const formData = new FormData();
        formData.append('id', document.getElementById('edit-product-id').value);
        formData.append('product_name', document.getElementById('edit-product-name').value);
        formData.append('category', document.getElementById('edit-product-category').value);
        formData.append('description', document.getElementById('edit-product-description').value);
        formData.append('price', document.getElementById('edit-product-price').value);
        formData.append('unit', document.getElementById('edit-product-unit').value);
        formData.append('stock_quantity', document.getElementById('edit-product-stock').value);
        formData.append('county', document.getElementById('edit-product-county').value);
        formData.append('city', document.getElementById('edit-product-city').value);

        ProducerDashboard.editSelectedFiles.forEach(file => {
            formData.append('images[]', file);
        });

        try {
            const response = await fetch('api/update_product.php', {
                method: 'POST',
                body: formData
            });
            const result = await response.json();
            if (result.success) {
                App.showToast('✅ Produs actualizat!');
                ProducerDashboard.closeEditModal();
                ProducerDashboard.loadMyProducts();
            } else {
                App.showToast('❌ ' + result.message);
            }
        } catch (error) {
            App.showToast('❌ Eroare de rețea.');
        } finally {
            btn.disabled = false;
            btn.innerHTML = '<i class="fas fa-save"></i> Salvează Modificările';
        }
    },

    deleteProduct: async (id) => {
        if (!confirm('Ștergi acest produs?')) return;
        try {
            const response = await fetch(`api/delete_product.php?id=${id}`, { method: 'DELETE' });
            const result = await response.json();
            if (result.success) {
                App.showToast('✅ Șters!');
                ProducerDashboard.loadMyProducts();
                ProducerDashboard.loadStats();
            }
        } catch (e) { App.showToast('❌ Eroare.'); }
    }
};

document.addEventListener('DOMContentLoaded', ProducerDashboard.init);
