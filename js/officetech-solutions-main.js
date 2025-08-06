// js/officetech-solutions-main.js

document.addEventListener('DOMContentLoaded', () => {
    // --- DOM Elements ---
    const productGrid = document.getElementById('officetech-product-grid');
    const cartCountSpan = document.getElementById('officetech-cart-count');
    const notificationCountSpan = document.getElementById('officetech-notification-count');

    // Filter elements
    const categoryFilter = document.getElementById('category-filter');
    const minPriceInput = document.getElementById('min-price');
    const maxPriceInput = document.getElementById('max-price');
    const sortBySelect = document.getElementById('sort-by');
    const applyFiltersBtn = document.getElementById('apply-filters');
    const resetFiltersBtn = document.getElementById('reset-filters');

    // Hero Slider elements
    const heroSlider = document.getElementById('hero-slider');
    const sliderItems = document.querySelectorAll('.hero-slider .slider-item');
    const sliderPrevBtn = document.querySelector('.slider-prev');
    const sliderNextBtn = document.querySelector('.slider-next');
    const sliderDotsContainer = document.querySelector('.slider-dots-container');

    // --- Global Data Storage ---
    let allOfficeProducts = []; // Stores all fetched products
    let officeCart = [];        // Stores items in the cart for OfficeTech
    let imarketNotifications = []; // Stores universal notifications
    let currentSlide = 0;
    let slideInterval;

    // --- Constants ---
    const CART_STORAGE_KEY = 'officetechCart'; // Specific key for OfficeTech cart
    const NOTIFICATIONS_STORAGE_KEY = 'imarketNotifications'; // Universal notifications


    // --- Initialization Functions ---

    /**
     * Fetches product data from the JSON file and transforms it.
     */
    async function fetchOfficeProducts() {
        try {
            const response = await fetch('data/office-products.json');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const rawProducts = await response.json();

            // --- Transform the raw product data to match script's expectations ---
            allOfficeProducts = rawProducts.map(item => {
                const price = item.price_ksh;
                const discount = item.discount_percent || 0;
                let oldPrice = undefined;

                if (discount > 0) {
                    // Calculate original price before discount
                    oldPrice = price / (1 - discount / 100);
                    // Round to 2 decimal places if necessary for old_price
                    oldPrice = parseFloat(oldPrice.toFixed(2));
                }
                
                // IMPORTANT: You need to add actual image paths to your JSON data
                // For now, using a generic placeholder or deriving from item_id if possible
                let imageUrl = item.image || `images/${item.item_id.toLowerCase()}.webp`; 
                // Fallback to a truly generic placeholder if above doesn't work or image isn't found
                // For now, assuming you'll have specific images.
                // If not, use: imageUrl = 'images/placeholder-product.webp'; 


                return {
                    id: item.item_id,
                    name: item.name,
                    category: item.category,
                    price: price,
                    old_price: oldPrice,
                    image: item.image_path, // Direct reference to the new property
                    rating: item.review_star_rate,
                    description: item.features ? item.features.join('. ') : '',
                    in_stock: item.in_stock
                };
            });

            console.log('OfficeTech Products fetched and transformed:', allOfficeProducts);

            populateCategoryFilter(allOfficeProducts); // Populate filter dropdown
            applyFiltersAndSort(); // Display initial products (all of them)

        } catch (error) {
            console.error('Could not fetch OfficeTech products:', error);
            productGrid.innerHTML = '<p class="no-results">Failed to load products. Please try again later.</p>';
        }
    }

    /**
     * Loads cart data from Local Storage.
     */
    function loadCart() {
        const storedCart = localStorage.getItem(CART_STORAGE_KEY);
        if (storedCart) {
            officeCart = JSON.parse(storedCart);
            updateCartCount();
        }
    }

    /**
     * Saves cart data to Local Storage.
     */
    function saveCart() {
        localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(officeCart));
        updateCartCount();
    }

    /**
     * Updates the cart count displayed in the header.
     */
    function updateCartCount() {
        const totalItems = officeCart.reduce((sum, item) => sum + item.quantity, 0);
        cartCountSpan.textContent = totalItems;
        if (totalItems > 0) {
            cartCountSpan.classList.add('visible');
        } else {
            cartCountSpan.classList.remove('visible');
        }
    }

    /**
     * Loads notifications from Local Storage.
     */
    function loadNotifications() {
        const storedNotifications = localStorage.getItem(NOTIFICATIONS_STORAGE_KEY);
        if (storedNotifications) {
            imarketNotifications = JSON.parse(storedNotifications);
            updateNotificationCount();
        }
    }

    /**
     * Saves notifications to Local Storage.
     */
    function saveNotifications() {
        localStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(imarketNotifications));
        updateNotificationCount();
    }

    /**
     * Updates the notification count displayed in the header.
     */
    function updateNotificationCount() {
        const unreadNotifications = imarketNotifications.filter(n => !n.read).length;
        notificationCountSpan.textContent = unreadNotifications;
        if (unreadNotifications > 0) {
            notificationCountSpan.classList.add('visible');
        } else {
            notificationCountSpan.classList.remove('visible');
        }
    }

    /**
     * Adds a new notification.
     * @param {string} message - The notification message.
     * @param {boolean} read - Whether the notification is initially read.
     */
    function addNotification(message, read = false) {
        const newNotification = {
            id: Date.now(), // Simple unique ID
            message: message,
            read: read,
            timestamp: new Date().toISOString()
        };
        imarketNotifications.unshift(newNotification); // Add to beginning
        saveNotifications();
    }


    // --- Product Rendering & Cart Interaction ---

    /**
     * Renders a list of products into the product grid.
     * @param {Array} productsToRender - The array of products to display.
     */
    function renderProducts(productsToRender) {
        productGrid.innerHTML = ''; // Clear previous products

        if (productsToRender.length === 0) {
            productGrid.innerHTML = '<p class="no-results">No products found matching your criteria.</p>';
            return;
        }

        productsToRender.forEach(product => {
            const productCard = document.createElement('div');
            productCard.classList.add('product-card');

            const priceHtml = product.old_price ? 
                              `<span class="current-price">KSh ${product.price.toLocaleString()}</span> <span class="old-price">KSh ${product.old_price.toLocaleString()}</span>` :
                              `KSh ${product.price.toLocaleString()}`;
            
            const buttonText = product.in_stock ? 'Add to Cart' : 'Out of Stock';
            const buttonDisabled = !product.in_stock;

            productCard.innerHTML = `
                <img src="${product.image}" alt="${product.name}" onerror="this.onerror=null;this.src='images/placeholder-product.webp';">
                <h3>${product.name}</h3>
                <p class="price">${priceHtml}</p>
                <div class="rating">
                    ${generateStarRating(product.rating)} (${product.rating ? product.rating.toFixed(1) : 'N/A'})
                </div>
                <button class="btn btn-secondary add-to-cart-btn" 
                        data-product-id="${product.id}" 
                        ${buttonDisabled ? 'disabled' : ''}>
                    ${buttonText}
                </button>
            `;
            productGrid.appendChild(productCard);
        });

        // Attach event listeners to new "Add to Cart" buttons
        productGrid.querySelectorAll('.add-to-cart-btn').forEach(button => {
            if (!button.disabled) { // Only attach if not disabled
                button.addEventListener('click', (event) => {
                    const productId = event.target.dataset.productId;
                    handleAddToCart(productId);
                });
            }
        });
    }

    /**
     * Generates HTML for star ratings.
     * @param {number} rating - The product's rating (e.g., 4.5).
     * @returns {string} HTML string for star icons.
     */
    function generateStarRating(rating) {
        let starsHtml = '';
        const roundedRating = Math.round(rating * 2) / 2; // Round to nearest 0.5
        for (let i = 1; i <= 5; i++) {
            if (roundedRating >= i) {
                starsHtml += '<i class="fas fa-star"></i>';
            } else if (roundedRating >= i - 0.5) {
                starsHtml += '<i class="fas fa-star-half-alt"></i>';
            } else {
                starsHtml += '<i class="far fa-star"></i>';
            }
        }
        return starsHtml;
    }

    /**
     * Handles adding a product to the cart.
     * @param {string} productId - The ID of the product to add.
     */
    function handleAddToCart(productId) {
        const productToAdd = allOfficeProducts.find(p => p.id === productId);

        if (productToAdd) {
            // Check if product is in stock before adding
            if (!productToAdd.in_stock) {
                alert(`${productToAdd.name} is currently out of stock.`);
                return;
            }

            const existingItem = officeCart.find(item => item.id === productId);

            if (existingItem) {
                existingItem.quantity++;
            } else {
                officeCart.push({
                    id: productToAdd.id,
                    name: productToAdd.name,
                    price: productToAdd.price,
                    image: productToAdd.image, 
                    quantity: 1
                });
            }
            saveCart();
            addNotification(`${productToAdd.name} added to cart!`, true); 
            alert(`${productToAdd.name} has been added to your cart.`); 
        } else {
            console.error('Product not found:', productId);
        }
    }


    // --- Filter & Sort Logic ---

    /**
     * Populates the category filter dropdown with unique categories.
     * @param {Array} products - The array of all products.
     */
    function populateCategoryFilter(products) {
        const categories = new Set();
        products.forEach(p => categories.add(p.category));

        categoryFilter.innerHTML = '<option value="all">All Categories</option>';
        Array.from(categories).sort().forEach(category => {
            const option = document.createElement('option');
            option.value = category;
            option.textContent = category;
            categoryFilter.appendChild(option);
        });
    }

    /**
     * Applies filters and sorting to the products and re-renders them.
     */
    function applyFiltersAndSort() {
        let filteredProducts = [...allOfficeProducts]; // Start with a copy of all products

        // 1. Filter by Category
        const selectedCategory = categoryFilter.value;
        if (selectedCategory !== 'all') {
            filteredProducts = filteredProducts.filter(p => p.category === selectedCategory);
        }

        // 2. Filter by Price
        const minPrice = parseFloat(minPriceInput.value);
        const maxPrice = parseFloat(maxPriceInput.value);

        if (!isNaN(minPrice)) {
            filteredProducts = filteredProducts.filter(p => p.price >= minPrice);
        }
        if (!isNaN(maxPrice)) {
            filteredProducts = filteredProducts.filter(p => p.price <= maxPrice);
        }

        // 3. Sort
        const sortBy = sortBySelect.value;
        switch (sortBy) {
            case 'price-asc':
                filteredProducts.sort((a, b) => a.price - b.price);
                break;
            case 'price-desc':
                filteredProducts.sort((a, b) => b.price - a.price);
                break;
            case 'name-asc':
                filteredProducts.sort((a, b) => a.name.localeCompare(b.name));
                break;
            case 'name-desc':
                filteredProducts.sort((a, b) => b.name.localeCompare(a.name));
                break;
            // 'default' case does nothing, maintains original order or order after filters
        }

        renderProducts(filteredProducts);
    }

    /**
     * Resets all filter inputs and reapplies filters.
     */
    function resetFilters() {
        categoryFilter.value = 'all';
        minPriceInput.value = '';
        maxPriceInput.value = '';
        sortBySelect.value = 'default';
        applyFiltersAndSort();
    }


    // --- Hero Slider Logic ---

    /**
     * Displays a specific slide and updates dot indicators.
     * @param {number} index - The index of the slide to show.
     */
    function showSlide(index) {
        sliderItems.forEach((item, i) => {
            item.classList.remove('active');
            if (i === index) {
                item.classList.add('active');
            }
        });

        document.querySelectorAll('.slider-dot').forEach((dot, i) => {
            dot.classList.remove('active');
            if (i === index) {
                dot.classList.add('active');
            }
        });
        currentSlide = index;
    }

    /**
     * Goes to the next slide.
     */
    function nextSlide() {
        currentSlide = (currentSlide + 1) % sliderItems.length;
        showSlide(currentSlide);
    }

    /**
     * Goes to the previous slide.
     */
    function prevSlide() {
        currentSlide = (currentSlide - 1 + sliderItems.length) % sliderItems.length;
        showSlide(currentSlide);
    }

    /**
     * Creates navigation dots for the slider dynamically.
     */
    function createSliderDots() {
        sliderDotsContainer.innerHTML = '';
        sliderItems.forEach((_, index) => {
            const dot = document.createElement('span');
            dot.classList.add('slider-dot');
            dot.dataset.slideIndex = index;
            dot.addEventListener('click', () => {
                showSlide(index);
                resetSliderInterval();
            });
            sliderDotsContainer.appendChild(dot);
        });
        showSlide(0); // Show the first slide and activate its dot
    }

    /**
     * Starts the automatic slide transition.
     */
    function startSlider() {
        stopSlider(); // Clear any existing interval
        slideInterval = setInterval(nextSlide, 5000); // Change slide every 5 seconds
    }

    /**
     * Stops the automatic slide transition.
     */
    function stopSlider() {
        clearInterval(slideInterval);
    }

    /**
     * Resets the slider interval (called on manual interaction).
     */
    function resetSliderInterval() {
        stopSlider();
        startSlider();
    }


    // --- Event Listeners ---

    // Filter & Sort Event Listeners
    applyFiltersBtn.addEventListener('click', applyFiltersAndSort);
    resetFiltersBtn.addEventListener('click', resetFilters);
    // Optional: Live filtering/sorting on change (can be resource intensive for many products)
    // categoryFilter.addEventListener('change', applyFiltersAndSort);
    // minPriceInput.addEventListener('input', applyFiltersAndSort);
    // maxPriceInput.addEventListener('input', applyFiltersAndSort);
    // sortBySelect.addEventListener('change', applyFiltersAndSort);


    // Hero Slider Event Listeners
    sliderPrevBtn.addEventListener('click', () => {
        prevSlide();
        resetSliderInterval();
    });
    sliderNextBtn.addEventListener('click', () => {
        nextSlide();
        resetSliderInterval();
    });
    heroSlider.addEventListener('mouseenter', stopSlider);
    heroSlider.addEventListener('mouseleave', startSlider);


    // --- Initial Load ---
    loadCart();
    loadNotifications();
    fetchOfficeProducts(); // This will also trigger rendering and filter population
    createSliderDots();
    startSlider();
});