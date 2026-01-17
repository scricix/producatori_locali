const ProductsPage = {
    currentPage: 1,
    itemsPerPage: 12,
    allProducts: [],
    filteredProducts: [],

    init: () => {
        // Check for category in URL
        const urlParams = new URLSearchParams(window.location.search);
        const categoryParam = urlParams.get('category');

        if (categoryParam) {
            const categoryFilter = document.getElementById('category-filter');
            if (categoryFilter) {
                categoryFilter.value = categoryParam;
            }
        }

        ProductsPage.loadProducts();
        ProductsPage.setupEventListeners();
        App.updateCartCount();
        App.updateHeader();
    },

    setupEventListeners: () => {
        const priceSlider = document.getElementById('price-filter');
        const priceValue = document.getElementById('price-value');

        if (priceSlider) {
            priceSlider.addEventListener('input', (e) => {
                priceValue.textContent = e.target.value + ' Lei';
            });
        }

        const searchInput = document.getElementById('search-input');
        if (searchInput) {
            searchInput.addEventListener('keyup', (e) => {
                if (e.key === 'Enter') {
                    ProductsPage.applyFilters();
                }
            });
        }
    },

    loadProducts: async () => {
        const container = document.getElementById('products-grid');
        try {
            const response = await fetch('api/get_products.php?limit=100');
            const result = await response.json();

            if (result.success && result.data.length > 0) {
                ProductsPage.allProducts = result.data;

                // If we have a category in the URL, apply filters immediately
                const urlParams = new URLSearchParams(window.location.search);
                if (urlParams.has('category')) {
                    ProductsPage.applyFilters();
                } else {
                    ProductsPage.filteredProducts = result.data;
                    ProductsPage.renderProducts();
                }
            } else {
                container.innerHTML = '<p class="text-center text-muted" style="grid-column: 1/-1;">Nu există produse momentan.</p>';
            }
        } catch (error) {
            console.error('Error loading products:', error);
            container.innerHTML = '<p class="text-center text-error" style="grid-column: 1/-1;">Eroare la încărcarea produselor.</p>';
        }
    },

    applyFilters: () => {
        const search = document.getElementById('search-input').value.toLowerCase();
        const category = document.getElementById('category-filter').value;
        const maxPrice = parseFloat(document.getElementById('price-filter').value);
        const sort = document.getElementById('sort-filter').value;

        ProductsPage.filteredProducts = ProductsPage.allProducts.filter(product => {
            const matchesSearch = product.title.toLowerCase().includes(search);
            const matchesCategory = !category || product.category === category;
            const matchesPrice = parseFloat(product.price) <= maxPrice;
            return matchesSearch && matchesCategory && matchesPrice;
        });

        // Sort
        if (sort === 'price-asc') {
            ProductsPage.filteredProducts.sort((a, b) => parseFloat(a.price) - parseFloat(b.price));
        } else if (sort === 'price-desc') {
            ProductsPage.filteredProducts.sort((a, b) => parseFloat(b.price) - parseFloat(a.price));
        } else {
            ProductsPage.filteredProducts.sort((a, b) => b.id - a.id);
        }

        ProductsPage.currentPage = 1;
        ProductsPage.renderProducts();
    },

    renderProducts: () => {
        const container = document.getElementById('products-grid');
        const resultsCount = document.getElementById('results-count');

        const start = (ProductsPage.currentPage - 1) * ProductsPage.itemsPerPage;
        const end = start + ProductsPage.itemsPerPage;
        const productsToShow = ProductsPage.filteredProducts.slice(start, end);

        resultsCount.textContent = `${ProductsPage.filteredProducts.length} produse găsite`;

        if (productsToShow.length === 0) {
            container.innerHTML = '<p class="text-center text-muted" style="grid-column: 1/-1;">Nu s-au găsit produse.</p>';
            return;
        }

        container.innerHTML = productsToShow.map(product => App.createProductCard(product)).join('');
        ProductsPage.renderPagination();
    },

    renderPagination: () => {
        const container = document.getElementById('pagination');
        const totalPages = Math.ceil(ProductsPage.filteredProducts.length / ProductsPage.itemsPerPage);

        if (totalPages <= 1) {
            container.innerHTML = '';
            return;
        }

        let html = '';
        for (let i = 1; i <= totalPages; i++) {
            const active = i === ProductsPage.currentPage ? 'background: var(--primary); color: white;' : '';
            html += `<button class="btn" style="min-width: 40px; ${active}" onclick="ProductsPage.goToPage(${i})">${i}</button>`;
        }

        container.innerHTML = html;
    },

    goToPage: (page) => {
        ProductsPage.currentPage = page;
        ProductsPage.renderProducts();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
};

document.addEventListener('DOMContentLoaded', ProductsPage.init);
