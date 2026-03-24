document.addEventListener('DOMContentLoaded', () => {
    let productsList = [];
    let cart = JSON.parse(localStorage.getItem('aura_cart')) || [];
    let currentCategory = 'all';
    let currentSort = 'default';

    const productsGrid = document.getElementById('products-grid');
    const categoryBtns = document.querySelectorAll('.filter-btn');
    const sortSelect = document.getElementById('sort-select');
    
    const cartBtn = document.getElementById('cart-btn');
    const closeCartBtn = document.getElementById('close-cart');
    const cartOverlay = document.getElementById('cart-overlay');
    const cartItemsContainer = document.getElementById('cart-items');
    const cartBadge = document.getElementById('cart-badge');
    const cartTotalPrice = document.getElementById('cart-total-price');

    const fetchProducts = async () => {
        try {
            const response = await fetch('json/products.json');
            if (!response.ok) throw new Error('Mrežni odgovor nije bio ok');
            const data = await response.json();
            productsList = data;
            renderProducts(productsList);
        } catch (error) {
            console.error('Došlo je do greške pri dobavljanju proizvoda:', error);
            productsGrid.innerHTML = '<div class="loading">Greška pri učitavanju proizvoda. Uverite se da se stranici pristupa preko lokalnog servera (Live Server), a ne kao običan fajl na disku.</div>';
        }
    };

    const renderProducts = (productsToRender) => {
        productsGrid.innerHTML = '';
        if (productsToRender.length === 0) {
            productsGrid.innerHTML = '<div class="loading">Nema proizvoda u ovoj kategoriji.</div>';
            return;
        }
        productsToRender.forEach(product => {
            const card = document.createElement('div');
            card.className = 'product-card';
            card.innerHTML = `
                <a href="proizvod.html?id=${product.id}"><img src="${product.image}" alt="${product.name}" class="product-image"></a>
                <div class="product-info">
                    <span class="product-category">${product.category}</span>
                    <a href="proizvod.html?id=${product.id}" style="text-decoration:none; color:inherit;"><h3 class="product-name">${product.name}</h3></a>
                    <p class="product-desc">${product.description}</p>
                    <div class="product-bottom">
                        <span class="product-price">${(product.price * 117).toFixed(2).replace('.', ',')} RSD</span>
                        <a href="proizvod.html?id=${product.id}" class="add-to-cart" style="text-decoration:none;">Završi kupovinu</a>
                    </div>
                </div>
            `;
            productsGrid.appendChild(card);
        });
    };

    const applyFilterAndSort = () => {
        let filtered = productsList;
        if (currentCategory !== 'all') {
            filtered = productsList.filter(p => p.category === currentCategory);
        }
        let result = [...filtered];
        if (currentSort === 'low-high') {
            result.sort((a, b) => a.price - b.price);
        } else if (currentSort === 'high-low') {
            result.sort((a, b) => b.price - a.price);
        }
        renderProducts(result);
    };

    categoryBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            categoryBtns.forEach(b => b.classList.remove('active'));
            e.currentTarget.classList.add('active');
            currentCategory = e.currentTarget.dataset.category;
            applyFilterAndSort();
        });
    });

    sortSelect.addEventListener('change', (e) => {
        currentSort = e.target.value;
        applyFilterAndSort();
    });

    const addToCart = (productId) => {
        if (!productId) return;
        const product = productsList.find(p => p.id === productId);
        if (!product) return;
        const existingItem = cart.find(item => item.id === productId);
        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            cart.push({ ...product, quantity: 1 });
        }
        saveCart();
        updateCartUI();
        cartBadge.classList.add('pulse');
        setTimeout(() => cartBadge.classList.remove('pulse'), 300);
    };

    const saveCart = () => {
        localStorage.setItem('aura_cart', JSON.stringify(cart));
    };

    const removeFromCart = (productId) => {
        cart = cart.filter(item => item.id !== productId);
        saveCart();
        updateCartUI();
    };

    const updateQuantity = (productId, delta) => {
        const item = cart.find(i => i.id === productId);
        if (item) {
            item.quantity += delta;
            if (item.quantity <= 0) {
                removeFromCart(productId);
            } else {
                saveCart();
                updateCartUI();
            }
        }
    };

    const updateCartUI = () => {
        cart = cart.filter(item => item && item.id && item.name);
        saveCart();
        cartItemsContainer.innerHTML = '';
        if (cart.length === 0) {
            cartItemsContainer.innerHTML = '<div class="cart-empty">Tvoja korpa je prazna.</div>';
            cartBadge.textContent = '0';
            cartTotalPrice.textContent = '0.00 RSD';
            return;
        }
        let totalQty = 0;
        let totalPrice = 0;
        cart.forEach(item => {
            totalQty += item.quantity;
            const itemPriceRsd = item.price * 117;
            totalPrice += itemPriceRsd * item.quantity;
            const cartEl = document.createElement('div');
            cartEl.className = 'cart-item';
            cartEl.innerHTML = `
                <img src="${item.image}" alt="${item.name}" class="cart-item-img">
                <div class="cart-item-info">
                    <h4 class="cart-item-name">${item.name}</h4>
                    <span class="cart-item-price">${(item.price * 117).toFixed(2).replace('.', ',')} RSD</span>
                </div>
                <div class="cart-item-actions">
                    <button class="qty-btn minus" data-id="${item.id}">-</button>
                    <span class="cart-item-qty">${item.quantity}</span>
                    <button class="qty-btn plus" data-id="${item.id}">+</button>
                    <button class="remove-item" data-id="${item.id}"><i class="fa-solid fa-trash"></i></button>
                </div>
            `;
            cartItemsContainer.appendChild(cartEl);
        });
        cartBadge.textContent = totalQty;
        cartTotalPrice.textContent = `${totalPrice.toFixed(2).replace('.', ',')} RSD`;
        cartItemsContainer.querySelectorAll('.minus').forEach(btn => {
            btn.addEventListener('click', (e) => updateQuantity(parseInt(e.currentTarget.dataset.id), -1));
        });
        cartItemsContainer.querySelectorAll('.plus').forEach(btn => {
            btn.addEventListener('click', (e) => updateQuantity(parseInt(e.currentTarget.dataset.id), 1));
        });
        cartItemsContainer.querySelectorAll('.remove-item').forEach(btn => {
            btn.addEventListener('click', (e) => removeFromCart(parseInt(e.currentTarget.dataset.id)));
        });
    };

    const toggleCart = () => {
        cartOverlay.classList.toggle('active');
    };

    cartBtn.addEventListener('click', toggleCart);
    closeCartBtn.addEventListener('click', toggleCart);
    cartOverlay.addEventListener('click', (e) => {
        if (e.target === cartOverlay) {
            toggleCart();
        }
    });

    fetchProducts();
    updateCartUI();
});
