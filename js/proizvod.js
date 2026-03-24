document.addEventListener('DOMContentLoaded', async () => {
    const productContainer = document.getElementById('product-container');
    const cartBtn = document.getElementById('cart-btn');
    const closeCartBtn = document.getElementById('close-cart');
    const cartOverlay = document.getElementById('cart-overlay');
    const cartItemsContainer = document.getElementById('cart-items');
    const cartBadge = document.getElementById('cart-badge');
    const cartTotalPrice = document.getElementById('cart-total-price');

    const urlParams = new URLSearchParams(window.location.search);
    const productId = parseInt(urlParams.get('id')) || 1; 

    let productsList = [];
    let cart = JSON.parse(localStorage.getItem('aura_cart')) || []; 

    try {
        const response = await fetch('json/products.json');
        if (!response.ok) throw new Error('Network Error');
        productsList = await response.json();
    } catch (e) {
        productContainer.innerHTML = '<h2 style="text-align:center;">Greška pri učitavanju proizvoda. Otvorite preko Live Servera!</h2>';
        return;
    }

    const product = productsList.find(p => p.id === productId || p.id == productId);
    if (!product) {
        productContainer.innerHTML = '<h2 style="text-align:center;">Proizvod nije pronađen (ID: ' + productId + '). Proverite products.json.</h2>';
        return;
    }

    cart = cart.filter(item => item && item.id && item.name);
    localStorage.setItem('aura_cart', JSON.stringify(cart));

    productContainer.innerHTML = `
        <div class="breadcrumbs">
            <a href="index.html">Home</a> | 
            <a href="index.html">KATEGORIJA</a> | 
            <a href="index.html">${product.category}</a> | 
            <span>${product.name}</span>
        </div>
        <div class="product-split">
            <div class="product-gallery">
                <img src="${product.image}" class="main-image" id="main-image">
                <div class="thumbnails">
                    <img src="${product.image}" class="thumb active">
                    <img src="${product.image}" class="thumb">
                    <img src="${product.image}" class="thumb">
                </div>
            </div>
            <div class="product-details">
                <h1>${product.name}</h1>
                <div class="sku">Šifra proizvoda: ${1000 + product.id * 17}</div>
                <div class="price">${(product.price * 117).toFixed(2).replace('.', ',')} RSD</div>
                <div class="description-block">
                    <h4>Opis proizvoda</h4>
                    <p>${product.description}</p>
                    <br><br>
                    <p>Održavanje:<br>Prati na temperaturi do 40°, sa garderobom sličnih boja.<br>Ne iskuvavati i ne koristiti izbeljivače.<br>Peglati sa unutrašnje strane, a nikako preko štampe.<br>Skupljanje nakon prvog pranja u proseku 2-3% po širini i dužini.</p>
                </div>
                <div class="options-row">
                    <select class="select-box" id="size-select">
                        <option value="">Veličina</option>
                        <option value="S">S</option>
                        <option value="M">M</option>
                        <option value="L">L</option>
                        <option value="XL">XL</option>
                        <option value="XXL">XXL</option>
                    </select>
                    <select class="select-box" id="color-select">
                        <option value="">Boja</option>
                        <option value="Standardna">Standardna</option>
                    </select>
                </div>
                <div id="size-error" class="error-msg">Niste selektovali veličinu!</div>
                <div class="action-row">
                    <div class="qty-input">
                        <input type="text" value="1" id="qty-val" readonly>
                        <div class="qty-controls">
                            <button id="qty-up"><i class="fa-solid fa-plus"></i></button>
                            <button id="qty-down"><i class="fa-solid fa-minus"></i></button>
                        </div>
                    </div>
                    <button class="add-btn-large" id="add-to-cart-large">
                        <i class="fa-solid fa-basket-shopping"></i> DODAJ U KORPU
                    </button>
                </div>
                <div class="social-share">
                    <span>Podeli:</span>
                    <button class="social-btn"><i class="fa-brands fa-facebook-f"></i></button>
                    <button class="social-btn"><i class="fa-brands fa-twitter"></i></button>
                    <button class="social-btn"><i class="fa-brands fa-pinterest-p"></i></button>
                    <button class="social-btn"><i class="fa-regular fa-envelope"></i></button>
                </div>
            </div>
        </div>
    `;

    let currentQty = 1;
    document.getElementById('qty-up').addEventListener('click', () => {
        currentQty++;
        document.getElementById('qty-val').value = currentQty;
    });
    document.getElementById('qty-down').addEventListener('click', () => {
        if (currentQty > 1) currentQty--;
        document.getElementById('qty-val').value = currentQty;
    });

    document.getElementById('add-to-cart-large').addEventListener('click', () => {
        const sizeSelect = document.getElementById('size-select');
        const errorDiv = document.getElementById('size-error');
        const size = sizeSelect.value;
        if (!size) {
            errorDiv.style.display = 'block';
            return;
        } else {
            errorDiv.style.display = 'none';
        }
        const existingItem = cart.find(item => item.id === product.id && item.selectedSize === size);
        if (existingItem) {
            existingItem.quantity += currentQty;
        } else {
            cart.push({ ...product, quantity: currentQty, selectedSize: size });
        }
        saveCart();
        updateCartUI();
        cartBadge.classList.add('pulse');
        setTimeout(() => cartBadge.classList.remove('pulse'), 300);
        cartOverlay.classList.add('active');
    });

    const saveCart = () => localStorage.setItem('aura_cart', JSON.stringify(cart));

    const updateCartUI = () => {
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
            totalPrice += (item.price * 117) * item.quantity;
            const cartEl = document.createElement('div');
            cartEl.className = 'cart-item';
            cartEl.innerHTML = `
                <img src="${item.image}" alt="${item.name}" class="cart-item-img">
                <div class="cart-item-info">
                    <h4 class="cart-item-name">${item.name}</h4>
                    <span class="cart-item-price" style="font-size: 0.8rem;">Vel: ${item.selectedSize || 'Uni'}</span><br>
                    <span class="cart-item-price">${(item.price * 117).toFixed(2).replace('.', ',')} RSD</span>
                </div>
                <div class="cart-item-actions">
                    <button class="qty-btn minus" data-id="${item.id}" data-size="${item.selectedSize}">-</button>
                    <span class="cart-item-qty">${item.quantity}</span>
                    <button class="qty-btn plus" data-id="${item.id}" data-size="${item.selectedSize}">+</button>
                    <button class="remove-item" data-id="${item.id}" data-size="${item.selectedSize}"><i class="fa-solid fa-trash"></i></button>
                </div>
            `;
            cartItemsContainer.appendChild(cartEl);
        });
        cartBadge.textContent = totalQty;
        cartTotalPrice.textContent = `${totalPrice.toFixed(2).replace('.', ',')} RSD`;

        cartItemsContainer.querySelectorAll('.minus').forEach(btn => {
            btn.addEventListener('click', (e) => updateQuantity(parseInt(e.currentTarget.dataset.id), e.currentTarget.dataset.size, -1));
        });
        cartItemsContainer.querySelectorAll('.plus').forEach(btn => {
            btn.addEventListener('click', (e) => updateQuantity(parseInt(e.currentTarget.dataset.id), e.currentTarget.dataset.size, 1));
        });
        cartItemsContainer.querySelectorAll('.remove-item').forEach(btn => {
            btn.addEventListener('click', (e) => {
                cart = cart.filter(i => !(i.id === parseInt(e.currentTarget.dataset.id) && i.selectedSize === e.currentTarget.dataset.size));
                saveCart();
                updateCartUI();
            });
        });
    };

    const updateQuantity = (id, size, delta) => {
        const item = cart.find(i => i.id === id && i.selectedSize === size);
        if (item) {
            item.quantity += delta;
            if (item.quantity <= 0) {
                cart = cart.filter(i => !(i.id === id && i.selectedSize === size));
            }
            saveCart();
            updateCartUI();
        }
    };

    const toggleCart = () => cartOverlay.classList.toggle('active');
    cartBtn.addEventListener('click', toggleCart);
    closeCartBtn.addEventListener('click', toggleCart);
    cartOverlay.addEventListener('click', (e) => {
        if (e.target === cartOverlay) toggleCart();
    });

    document.getElementById('size-select').addEventListener('change', (e) => {
        if (e.target.value) {
            document.getElementById('size-error').style.display = 'none';
        }
    });

    updateCartUI();
});
