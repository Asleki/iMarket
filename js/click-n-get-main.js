/*
 * js/click-n-get-main.js
 * This file manages the dynamic content and interactive features for the Click 'n Get shop homepage.
 * It includes:
 * - Fetching and rendering product data from products.json.
 * - Filtering and sorting products.
 * - Search functionality with suggestions.
 * - A full shopping cart system (add, remove, update quantity, persistence).
 * - Modals for cart, checkout, and order confirmation.
 * - Toast notifications for user feedback.
 * - Dynamic star ratings.
 * - Handling various UI interactions.
 * - Prices are displayed in USD ($).
 */

document.addEventListener('DOMContentLoaded', function() {
    // --- UI Elements ---
    const featuredProductsContainer = document.getElementById('featured-products-container');
    const todaysDealsContainer = document.getElementById('todays-deals-container');
    const hotPicksContainer = document.getElementById('hot-picks-container');
    const newArrivalsContainer = document.getElementById('new-arrivals-container');

    const productSearchInput = document.getElementById('product-search-input');
    const productSearchBtn = document.getElementById('product-search-btn');
    const productSearchSuggestions = document.getElementById('product-search-suggestions');

    const categoryFilter = document.getElementById('category-filter');
    const subCategoryFilter = document.getElementById('sub-category-filter');
    const brandFilter = document.getElementById('brand-filter');
    const priceRangeFilter = document.getElementById('price-range-filter');
    const sortBy = document.getElementById('sort-by');
    const applyFiltersBtn = document.getElementById('apply-filters-btn');
    const clearFiltersBtn = document.getElementById('clear-filters-btn');

    const cartBtn = document.getElementById('cart-btn');
    const cartItemCountBadge = document.getElementById('cart-item-count');
    const notificationsBtn = document.getElementById('notifications-btn');
    const notificationCountBadge = document.getElementById('notification-count');

    // Modals
    const cartModal = document.getElementById('cart-modal');
    const cartItemsContainer = document.getElementById('cart-items-container');
    const emptyCartMessage = cartModal ? cartModal.querySelector('.empty-cart-message') : null;
    const cartSummary = document.getElementById('cart-summary');
    const cartSubtotalSpan = document.getElementById('cart-subtotal');
    const checkoutBtn = document.getElementById('checkout-btn');

    const checkoutModal = document.getElementById('checkout-modal');
    const checkoutForm = document.getElementById('checkout-form');
    const checkoutSubtotalSpan = document.getElementById('checkout-subtotal');
    const checkoutShippingSpan = document.getElementById('checkout-shipping');
    const checkoutTotalSpan = document.getElementById('checkout-total');
    const checkoutResponseMessage = document.getElementById('checkout-response-message');

    const orderConfirmationModal = document.getElementById('order-confirmation-modal');
    const orderNumberDisplay = document.getElementById('order-number-display');
    const orderEtaDisplay = document.getElementById('order-eta-display');

    const notificationToast = document.getElementById('notification-toast');
    const notificationText = document.getElementById('notification-text');
    const closeToastBtn = notificationToast ? notificationToast.querySelector('.close-toast-btn') : null;

    const scrollToTopBtn = document.getElementById('scroll-to-top-btn');

    // Meta tags for SEO
    const pageTitle = document.getElementById('page-title');
    const canonicalLink = document.querySelector('link[rel="canonical"]');
    const ogTitle = document.querySelector('meta[property="og:title"]');
    const ogDescription = document.querySelector('meta[property="og:description"]');
    const ogImage = document.querySelector('meta[property="og:image"]');
    const twitterTitle = document.querySelector('meta[name="twitter:title"]');
    const twitterDescription = document.querySelector('meta[name="twitter:description"]');
    const twitterImage = document.querySelector('meta[name="twitter:image"]');
    const metaDescription = document.querySelector('meta[name="description"]');
    const metaKeywords = document.querySelector('meta[name="keywords"]');

    // --- Global Data ---
    let allProducts = []; // Stores all products fetched from JSON
    let cart = []; // Stores items in the shopping cart { productId, quantity, price, name, image }
    let notifications = []; // Simulated notifications
    const PRODUCTS_PER_SECTION = 8; // Number of products to show per section initially

    // --- Utility Functions ---

    /**
     * Updates meta tags for SEO and social sharing.
     * @param {string} title - The page title.
     * @param {string} description - The page description.
     * @param {string} imageUrl - The URL of the image for social sharing.
     * @param {string} keywords - Keywords for the page.
     */
    function updateMetaTags(title, description, imageUrl, keywords) {
        if (pageTitle) pageTitle.textContent = title;
        if (metaDescription) metaDescription.setAttribute('content', description);
        if (metaKeywords) metaKeywords.setAttribute('content', keywords);
        if (canonicalLink) canonicalLink.setAttribute('href', window.location.href);

        // Open Graph / Twitter
        if (ogTitle) ogTitle.setAttribute('content', title);
        if (ogDescription) ogDescription.setAttribute('content', description);
        if (ogImage) ogImage.setAttribute('content', imageUrl);
        if (twitterTitle) twitterTitle.setAttribute('content', title);
        if (twitterDescription) twitterDescription.setAttribute('content', description);
        if (twitterImage) twitterImage.setAttribute('content', imageUrl);
    }

    /**
     * Generates HTML for star ratings.
     * @param {number} rating - The rating value (e.g., 4.7).
     * @returns {string} HTML string for star icons.
     */
    function getStarRatingHtml(rating) {
        const fullStars = Math.floor(rating);
        const halfStar = rating % 1 >= 0.5;
        const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);
        let starsHtml = '';
        for (let i = 0; i < fullStars; i++) {
            starsHtml += '<i class="fas fa-star"></i>';
        }
        if (halfStar) {
            starsHtml += '<i class="fas fa-star-half-alt"></i>';
        }
        for (let i = 0; i < emptyStars; i++) {
            starsHtml += '<i class="far fa-star"></i>'; // far for empty star
        }
        return starsHtml;
    }

    /**
     * Displays a temporary toast notification.
     * @param {string} message - The message to display.
     * @param {string} type - 'success', 'error', or 'info' for styling.
     */
    function showNotification(message, type = 'info') {
        if (notificationToast && notificationText) {
            notificationText.textContent = message;
            notificationToast.className = `notification-toast ${type} show`; // Add 'show' class
            notificationToast.style.display = 'flex'; // Ensure it's visible

            // Auto-hide after 3 seconds
            setTimeout(() => {
                notificationToast.classList.remove('show');
                // Give time for fade-out before hiding display
                setTimeout(() => {
                    notificationToast.style.display = 'none';
                }, 300);
            }, 3000);
        }
    }

    // --- Product Rendering ---

    /**
     * Creates an HTML product card element.
     * @param {object} product - The product data.
     * @returns {HTMLElement} The product card element.
     */
    function createProductCard(product) {
        const productCard = document.createElement('div');
        productCard.classList.add('product-card');
        productCard.dataset.productId = product.id; // Store product ID for easy access

        const displayPrice = product.isDiscounted ? product.price : product.originalPrice;
        const originalPriceHtml = product.isDiscounted ? `<span class="original-price">$${product.originalPrice.toFixed(2)}</span>` : '';
        const discountBadge = product.isDiscounted ? `<span class="discount-badge">-${(((product.originalPrice - product.price) / product.originalPrice) * 100).toFixed(0)}%</span>` : '';
        const freeShippingBadge = product.isFreeShipping ? `<span class="free-shipping-badge"><i class="fas fa-truck"></i> Free Shipping</span>` : '';

        const imageUrl = product.images && product.images.length > 0
            ? product.images[0]
            : `https://placehold.co/300x200/4CAF50/FFFFFF?text=Product`; // Placeholder

        productCard.innerHTML = `
            <div class="product-image-wrapper">
                <img src="${imageUrl}" alt="${product.name}" onerror="this.onerror=null;this.src='https://placehold.co/300x200/CCCCCC/333333?text=Image+Error';" loading="lazy">
                ${discountBadge}
                ${freeShippingBadge}
            </div>
            <div class="product-info">
                <h3 class="product-name">${product.name}</h3>
                <p class="product-brand">${product.brand}</p>
                <div class="product-rating">
                    ${getStarRatingHtml(product.rating)}
                    <span class="reviews-count">(${product.reviewsCount.toLocaleString()})</span>
                </div>
                <div class="product-price-info">
                    <span class="current-price">$${displayPrice.toFixed(2)}</span>
                    ${originalPriceHtml}
                </div>
                <button class="btn btn-primary add-to-cart-btn" data-product-id="${product.id}"
                    ${product.inStock === 0 ? 'disabled' : ''}>
                    ${product.inStock === 0 ? 'Out of Stock' : '<i class="fas fa-cart-plus"></i> Add to Cart'}
                </button>
            </div>
        `;

        // Add to cart button event listener
        const addToCartBtn = productCard.querySelector('.add-to-cart-btn');
        if (addToCartBtn) {
            addToCartBtn.addEventListener('click', function(event) {
                event.stopPropagation(); // Prevent card click from triggering
                event.preventDefault(); // Prevent default link behavior if card is an <a>
                const productId = this.dataset.productId;
                const productToAdd = allProducts.find(p => p.id === productId);
                if (productToAdd) {
                    addToCart(productToAdd, 1); // Add 1 quantity by default
                }
            });
        }

        // Make the entire card clickable to product details (simulated)
        productCard.addEventListener('click', function() {
            window.location.href = `click-n-get-product-details.html?id=${product.id}`;
        });

        return productCard;
    }

    /**
     * Renders a list of products into a specified container.
     * @param {Array<object>} products - Array of product objects.
     * @param {HTMLElement} container - The HTML element to render products into.
     */
    function renderProductSection(products, container) {
        if (!container) return; // Exit if container is null

        container.innerHTML = ''; // Clear loading message or previous content
        if (products.length === 0) {
            container.innerHTML = '<p class="no-results-message">No products found in this section.</p>';
            return;
        }
        products.forEach(product => {
            container.appendChild(createProductCard(product));
        });
    }

    // --- Data Fetching & Initial Render ---

    /**
     * Fetches product data from products.json and initializes the page sections.
     */
    async function fetchProducts() {
        try {
            // Show loading messages for all sections
            [featuredProductsContainer, todaysDealsContainer, hotPicksContainer, newArrivalsContainer].forEach(container => {
                if (container) container.innerHTML = '<p class="loading-message">Loading products...</p>';
            });

            const response = await fetch('data/clicknget-products.json');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            allProducts = await response.json();
            console.log('Products loaded:', allProducts.length);

            // Render initial sections
            renderProductSection(allProducts.filter(p => p.isFeatured).slice(0, PRODUCTS_PER_SECTION), featuredProductsContainer);
            renderProductSection(allProducts.filter(p => p.isDeals).slice(0, PRODUCTS_PER_SECTION), todaysDealsContainer);
            renderProductSection(allProducts.filter(p => p.isHotPick).slice(0, PRODUCTS_PER_SECTION), hotPicksContainer);
            renderProductSection(allProducts.sort((a, b) => new Date(b.dateAdded) - new Date(a.dateAdded)).slice(0, PRODUCTS_PER_SECTION), newArrivalsContainer);

            // Populate filter dropdowns
            populateFilters();

            // Initialize cart
            loadCart();
            updateCartCountBadge();

            // Update SEO meta tags for the homepage
            updateMetaTags(
                "Click 'n Get - Your Online Shopping Destination in Kenya",
                "Shop electronics, fashion, home goods, and more at Click 'n Get. Discover amazing deals, new arrivals, and hot picks with fast delivery across Kenya.",
                "images/shop-click-n-get.webp",
                "Click n Get, online shopping Kenya, electronics Kenya, fashion Kenya, home goods, deals, new arrivals, best prices, buy online Nairobi"
            );

        } catch (error) {
            console.error('Error fetching products data:', error);
            // Display error messages in all sections
            [featuredProductsContainer, todaysDealsContainer, hotPicksContainer, newArrivalsContainer].forEach(container => {
                if (container) container.innerHTML = '<p class="error-message">Failed to load products. Please try again later.</p>';
            });
            showNotification('Failed to load products. Please try again later.', 'error');
        }
    }

    // --- Filtering & Sorting ---

    /**
     * Populates category, sub-category, and brand filter dropdowns.
     */
    function populateFilters() {
        const categories = new Set();
        const subCategories = new Set();
        const brands = new Set();

        allProducts.forEach(product => {
            categories.add(product.category);
            subCategories.add(product.subCategory);
            brands.add(product.brand);
        });

        // Populate Category Filter
        categoryFilter.innerHTML = '<option value="">All Categories</option>';
        Array.from(categories).sort().forEach(cat => {
            const option = document.createElement('option');
            option.value = cat;
            option.textContent = cat;
            categoryFilter.appendChild(option);
        });

        // Populate Brand Filter
        brandFilter.innerHTML = '<option value="">All Brands</option>';
        Array.from(brands).sort().forEach(brand => {
            const option = document.createElement('option');
            option.value = brand;
            option.textContent = brand;
            brandFilter.appendChild(option);
        });

        // Initial population of sub-categories based on current category selection
        updateSubCategoryFilter();
    }

    /**
     * Updates the sub-category filter options based on the selected main category.
     */
    function updateSubCategoryFilter() {
        const selectedCategory = categoryFilter.value;
        const subCategoriesForSelectedCategory = new Set();

        if (selectedCategory) {
            allProducts.filter(p => p.category === selectedCategory).forEach(p => {
                subCategoriesForSelectedCategory.add(p.subCategory);
            });
        } else {
            // If no category selected, show all sub-categories
            allProducts.forEach(p => subCategoriesForSelectedCategory.add(p.subCategory));
        }

        subCategoryFilter.innerHTML = '<option value="">All Sub-Categories</option>';
        Array.from(subCategoriesForSelectedCategory).sort().forEach(subCat => {
            const option = document.createElement('option');
            option.value = subCat;
            option.textContent = subCat;
            subCategoryFilter.appendChild(option);
        });
    }

    /**
     * Applies filters and sorting to the products and re-renders the main product grid.
     */
    function applyFiltersAndSort() {
        let filtered = [...allProducts];

        const selectedCategory = categoryFilter.value;
        const selectedSubCategory = subCategoryFilter.value;
        const selectedBrand = brandFilter.value;
        const selectedPriceRange = priceRangeFilter.value;
        const selectedSortBy = sortBy.value;
        const searchQuery = productSearchInput.value.toLowerCase().trim();

        // Apply Search Filter first
        if (searchQuery) {
            filtered = filtered.filter(product =>
                product.name.toLowerCase().includes(searchQuery) ||
                product.description.toLowerCase().includes(searchQuery) ||
                product.brand.toLowerCase().includes(searchQuery) ||
                product.category.toLowerCase().includes(searchQuery) ||
                product.subCategory.toLowerCase().includes(searchQuery)
            );
        }

        // Apply Category Filter
        if (selectedCategory) {
            filtered = filtered.filter(product => product.category === selectedCategory);
        }

        // Apply Sub-Category Filter
        if (selectedSubCategory) {
            filtered = filtered.filter(product => product.subCategory === selectedSubCategory);
        }

        // Apply Brand Filter
        if (selectedBrand) {
            filtered = filtered.filter(product => product.brand === selectedBrand);
        }

        // Apply Price Range Filter
        if (selectedPriceRange) {
            const [minStr, maxStr] = selectedPriceRange.split('-');
            const minPrice = parseFloat(minStr);
            const maxPrice = maxStr === 'max' ? Infinity : parseFloat(maxStr);
            filtered = filtered.filter(product => {
                const price = product.isDiscounted ? product.price : product.originalPrice;
                return price >= minPrice && price <= maxPrice;
            });
        }

        // Apply Sorting
        filtered.sort((a, b) => {
            switch (selectedSortBy) {
                case 'dateAdded-desc':
                    return new Date(b.dateAdded) - new Date(a.dateAdded);
                case 'price-asc':
                    return (a.isDiscounted ? a.price : a.originalPrice) - (b.isDiscounted ? b.price : b.originalPrice);
                case 'price-desc':
                    return (b.isDiscounted ? b.price : b.originalPrice) - (a.isDiscounted ? a.price : a.originalPrice);
                case 'rating-desc':
                    return b.rating - a.rating;
                case 'name-asc':
                    return a.name.localeCompare(b.name);
                default:
                    return 0;
            }
        });

        // Render the filtered and sorted results in the "Featured Products" section
        // As this is a homepage, we'll use the featured section as the primary display for filtered results.
        // For a dedicated "All Products" page, you might have a separate container.
        const targetContainer = featuredProductsContainer; // Or a new #all-products-container
        if (targetContainer) {
            targetContainer.innerHTML = ''; // Clear existing content
            if (filtered.length === 0) {
                targetContainer.innerHTML = '<p class="no-results-message">No products match your current filters and search criteria.</p>';
            } else {
                renderProductSection(filtered, targetContainer);
            }
        }
        // Hide other sections if filters are applied, or show them if filters are cleared
        toggleProductSectionsVisibility(searchQuery || selectedCategory || selectedSubCategory || selectedBrand || selectedPriceRange);
    }

    /**
     * Toggles visibility of product sections based on whether filters are active.
     * @param {boolean} filtersActive - True if any filter/search is active.
     */
    function toggleProductSectionsVisibility(filtersActive) {
        const sectionsToHide = [todaysDealsContainer.closest('section'), hotPicksContainer.closest('section'), newArrivalsContainer.closest('section')];
        const featuredSection = featuredProductsContainer.closest('section');

        if (filtersActive) {
            sectionsToHide.forEach(section => {
                if (section) section.style.display = 'none';
            });
            // Ensure featured section is visible and titled appropriately for filtered results
            if (featuredSection) {
                featuredSection.style.display = 'block';
                featuredSection.querySelector('h2').textContent = 'Filtered Products';
                featuredSection.querySelector('h2').prepend(document.createElement('i')).className = 'fas fa-filter';
            }
        } else {
            sectionsToHide.forEach(section => {
                if (section) section.style.display = 'block';
            });
            // Reset featured section title
            if (featuredSection) {
                featuredSection.querySelector('h2').textContent = 'Featured Products';
                featuredSection.querySelector('h2').prepend(document.createElement('i')).className = 'fas fa-star';
            }
            // Re-render initial sections if filters are cleared
            renderProductSection(allProducts.filter(p => p.isFeatured).slice(0, PRODUCTS_PER_SECTION), featuredProductsContainer);
            renderProductSection(allProducts.filter(p => p.isDeals).slice(0, PRODUCTS_PER_SECTION), todaysDealsContainer);
            renderProductSection(allProducts.filter(p => p.isHotPick).slice(0, PRODUCTS_PER_SECTION), hotPicksContainer);
            renderProductSection(allProducts.sort((a, b) => new Date(b.dateAdded) - new Date(a.dateAdded)).slice(0, PRODUCTS_PER_SECTION), newArrivalsContainer);
        }
    }

    /**
     * Clears all filter selections and re-renders initial product sections.
     */
    function clearFilters() {
        productSearchInput.value = '';
        categoryFilter.value = '';
        updateSubCategoryFilter(); // Reset sub-category options
        subCategoryFilter.value = '';
        brandFilter.value = '';
        priceRangeFilter.value = '';
        sortBy.value = 'dateAdded-desc'; // Default sort
        productSearchSuggestions.innerHTML = ''; // Clear suggestions
        productSearchSuggestions.style.display = 'none';

        applyFiltersAndSort(); // Re-apply to show all products
        toggleProductSectionsVisibility(false); // Show all sections
    }

    // --- Search Functionality ---

    /**
     * Handles search input, showing suggestions.
     */
    function handleSearchInput() {
        const query = productSearchInput.value.toLowerCase().trim();
        productSearchSuggestions.innerHTML = ''; // Clear previous suggestions

        if (query.length < 2) { // Require at least 2 characters for suggestions
            productSearchSuggestions.style.display = 'none';
            return;
        }

        const matchingProducts = allProducts.filter(product =>
            product.name.toLowerCase().includes(query) ||
            product.brand.toLowerCase().includes(query) ||
            product.category.toLowerCase().includes(query)
        ).slice(0, 5); // Limit to 5 suggestions

        if (matchingProducts.length > 0) {
            matchingProducts.forEach(product => {
                const suggestionItem = document.createElement('div');
                suggestionItem.classList.add('suggestion-item');
                suggestionItem.textContent = `${product.name} (${product.brand})`;
                suggestionItem.addEventListener('click', () => {
                    productSearchInput.value = product.name; // Pre-fill search input
                    productSearchSuggestions.style.display = 'none';
                    applyFiltersAndSort(); // Perform search immediately
                });
                productSearchSuggestions.appendChild(suggestionItem);
            });
            productSearchSuggestions.style.display = 'block';
        } else {
            productSearchSuggestions.style.display = 'none';
        }
    }

    // --- Shopping Cart Logic ---

    /**
     * Loads cart data from localStorage.
     */
    function loadCart() {
        const storedCart = localStorage.getItem('clickNGetCart');
        if (storedCart) {
            try {
                cart = JSON.parse(storedCart);
            } catch (e) {
                console.error("Error parsing cart from localStorage:", e);
                cart = []; // Reset corrupted cart
            }
        }
    }

    /**
     * Saves cart data to localStorage.
     */
    function saveCart() {
        localStorage.setItem('clickNGetCart', JSON.stringify(cart));
    }

    /**
     * Adds a product to the cart or updates its quantity.
     * @param {object} product - The product object to add.
     * @param {number} quantity - The quantity to add.
     */
    function addToCart(product, quantity) {
        const existingItemIndex = cart.findIndex(item => item.id === product.id);

        if (existingItemIndex > -1) {
            // Item already in cart, update quantity
            const currentQuantity = cart[existingItemIndex].quantity;
            const newQuantity = currentQuantity + quantity;

            // Check against maxOrderQuantity if defined
            if (product.maxOrderQuantity && newQuantity > product.maxOrderQuantity) {
                showNotification(`You can only order a maximum of ${product.maxOrderQuantity} of this item.`, 'error');
                return;
            }
            // Check against stock
            if (newQuantity > product.inStock) {
                showNotification(`Only ${product.inStock} of "${product.name}" are available in stock.`, 'error');
                return;
            }

            cart[existingItemIndex].quantity = newQuantity;
            showNotification(`"${product.name}" quantity updated in cart.`, 'info');
        } else {
            // New item, add to cart
            // Check against minOrderQuantity if defined
            if (product.minOrderQuantity && quantity < product.minOrderQuantity) {
                showNotification(`Minimum order quantity for "${product.name}" is ${product.minOrderQuantity}.`, 'error');
                return;
            }
            // Check against stock
            if (quantity > product.inStock) {
                showNotification(`Only ${product.inStock} of "${product.name}" are available in stock.`, 'error');
                return;
            }

            cart.push({
                id: product.id,
                name: product.name,
                price: product.isDiscounted ? product.price : product.originalPrice,
                image: product.images[0],
                quantity: quantity
            });
            showNotification(`"${product.name}" added to cart!`, 'success');
        }
        saveCart();
        updateCartCountBadge();
        renderCart(); // Re-render cart modal content if open
    }

    /**
     * Removes a product from the cart.
     * @param {string} productId - The ID of the product to remove.
     */
    function removeFromCart(productId) {
        cart = cart.filter(item => item.id !== productId);
        saveCart();
        updateCartCountBadge();
        renderCart();
        showNotification('Item removed from cart.', 'info');
    }

    /**
     * Updates the quantity of a product in the cart.
     * @param {string} productId - The ID of the product.
     * @param {number} newQuantity - The new quantity for the product.
     */
    function updateCartQuantity(productId, newQuantity) {
        const itemIndex = cart.findIndex(item => item.id === productId);
        if (itemIndex > -1) {
            const product = allProducts.find(p => p.id === productId);
            if (!product) {
                console.error("Product not found for ID:", productId);
                return;
            }

            // Validate new quantity
            if (newQuantity <= 0) {
                removeFromCart(productId);
                return;
            }
            if (product.maxOrderQuantity && newQuantity > product.maxOrderQuantity) {
                showNotification(`You can only order a maximum of ${product.maxOrderQuantity} of this item.`, 'error');
                cart[itemIndex].quantity = product.maxOrderQuantity; // Cap at max
            }
            if (newQuantity > product.inStock) {
                showNotification(`Only ${product.inStock} of "${product.name}" are available in stock.`, 'error');
                cart[itemIndex].quantity = product.inStock; // Cap at stock
            }

            cart[itemIndex].quantity = Math.min(newQuantity, product.inStock, product.maxOrderQuantity || Infinity); // Cap quantity

            saveCart();
            updateCartCountBadge();
            renderCart();
            showNotification(`Quantity for "${product.name}" updated.`, 'info');
        }
    }

    /**
     * Updates the cart item count badge in the header.
     */
    function updateCartCountBadge() {
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        if (cartItemCountBadge) {
            cartItemCountBadge.textContent = totalItems;
            cartItemCountBadge.style.display = totalItems > 0 ? 'flex' : 'none';
        }
    }

    /**
     * Renders the current cart items into the cart modal.
     */
    function renderCart() {
        if (!cartItemsContainer || !cartSummary || !checkoutBtn) return;

        cartItemsContainer.innerHTML = ''; // Clear previous items

        if (cart.length === 0) {
            if (emptyCartMessage) emptyCartMessage.style.display = 'block';
            cartSummary.style.display = 'none';
            checkoutBtn.style.display = 'none';
            return;
        }

        if (emptyCartMessage) emptyCartMessage.style.display = 'none';
        cartSummary.style.display = 'block';
        checkoutBtn.style.display = 'block';

        let subtotal = 0;

        cart.forEach(item => {
            const cartItemDiv = document.createElement('div');
            cartItemDiv.classList.add('cart-item');
            subtotal += item.price * item.quantity;

            cartItemDiv.innerHTML = `
                <img src="${item.image}" alt="${item.name}" onerror="this.onerror=null;this.src='https://placehold.co/80x80/CCCCCC/333333?text=Item';" loading="lazy">
                <div class="item-details">
                    <h4>${item.name}</h4>
                    <p>Price: $${item.price.toFixed(2)}</p>
                    <div class="quantity-controls">
                        <button class="quantity-decrease" data-product-id="${item.id}">-</button>
                        <input type="number" value="${item.quantity}" min="1" class="item-quantity-input" data-product-id="${item.id}">
                        <button class="quantity-increase" data-product-id="${item.id}">+</button>
                    </div>
                </div>
                <button class="remove-from-cart-btn" data-product-id="${item.id}" aria-label="Remove ${item.name} from cart">
                    <i class="fas fa-trash-alt"></i>
                </button>
            `;
            cartItemsContainer.appendChild(cartItemDiv);
        });

        cartSubtotalSpan.textContent = `$${subtotal.toFixed(2)}`;

        // Add event listeners for quantity controls and remove buttons
        cartItemsContainer.querySelectorAll('.quantity-decrease').forEach(button => {
            button.addEventListener('click', function() {
                const productId = this.dataset.productId;
                const input = cartItemsContainer.querySelector(`.item-quantity-input[data-product-id="${productId}"]`);
                updateCartQuantity(productId, parseInt(input.value) - 1);
            });
        });

        cartItemsContainer.querySelectorAll('.quantity-increase').forEach(button => {
            button.addEventListener('click', function() {
                const productId = this.dataset.productId;
                const input = cartItemsContainer.querySelector(`.item-quantity-input[data-product-id="${productId}"]`);
                updateCartQuantity(productId, parseInt(input.value) + 1);
            });
        });

        cartItemsContainer.querySelectorAll('.item-quantity-input').forEach(input => {
            input.addEventListener('change', function() {
                const productId = this.dataset.productId;
                updateCartQuantity(productId, parseInt(this.value));
            });
        });

        cartItemsContainer.querySelectorAll('.remove-from-cart-btn').forEach(button => {
            button.addEventListener('click', function() {
                const productId = this.dataset.productId;
                removeFromCart(productId);
            });
        });
    }

    // --- Modal Management ---

    /**
     * Opens a specified modal.
     * @param {HTMLElement} modalElement - The modal DOM element.
     */
    function openModal(modalElement) {
        if (modalElement) {
            modalElement.classList.add('show');
            modalElement.setAttribute('aria-hidden', 'false');
            document.body.classList.add('modal-open'); // Prevent body scroll
        }
    }

    /**
     * Closes a specified modal.
     * @param {HTMLElement} modalElement - The modal DOM element.
     */
    function closeModal(modalElement) {
        if (modalElement) {
            modalElement.classList.remove('show');
            modalElement.setAttribute('aria-hidden', 'true');
            document.body.classList.remove('modal-open'); // Re-enable body scroll
            // Clear response messages on close
            if (modalElement === checkoutModal && checkoutResponseMessage) {
                checkoutResponseMessage.style.display = 'none';
            }
        }
    }

    // --- Checkout Logic ---

    /**
     * Handles opening the checkout modal and populating its summary.
     */
    function handleCheckout() {
        if (cart.length === 0) {
            showNotification('Your cart is empty. Please add items before checking out.', 'info');
            return;
        }

        let subtotal = 0;
        let totalShipping = 0;

        cart.forEach(item => {
            subtotal += item.price * item.quantity;
            const product = allProducts.find(p => p.id === item.id);
            if (product && !product.isFreeShipping) {
                // Simulate shipping cost per item (e.g., $5 per item)
                totalShipping += 5 * item.quantity;
            }
        });

        const total = subtotal + totalShipping;

        if (checkoutSubtotalSpan) checkoutSubtotalSpan.textContent = `$${subtotal.toFixed(2)}`;
        if (checkoutShippingSpan) checkoutShippingSpan.textContent = `$${totalShipping.toFixed(2)}`;
        if (checkoutTotalSpan) checkoutTotalSpan.textContent = `$${total.toFixed(2)}`;

        openModal(checkoutModal);
        closeModal(cartModal); // Close cart modal when opening checkout
    }

    /**
     * Simulates placing an order.
     * @param {Event} event - The form submission event.
     */
    function placeOrder(event) {
        event.preventDefault();

        const name = document.getElementById('checkout-name').value.trim();
        const email = document.getElementById('checkout-email').value.trim();
        const phone = document.getElementById('checkout-phone').value.trim();
        const address = document.getElementById('checkout-address').value.trim();
        const city = document.getElementById('checkout-city').value.trim();
        const county = document.getElementById('checkout-county').value.trim();
        const paymentMethod = document.querySelector('input[name="payment-method"]:checked').value;

        if (!name || !email || !address || !city || !county) {
            displayCheckoutMessage('Please fill in all required shipping information.', 'error');
            return;
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            displayCheckoutMessage('Please enter a valid email address.', 'error');
            return;
        }

        // Simulate order processing
        const orderNumber = generateOrderNumber();
        const deliveryETA = calculateDeliveryETA();

        const orderDetails = {
            orderNumber: orderNumber,
            customer: { name, email, phone, address, city, county },
            items: cart,
            subtotal: parseFloat(checkoutSubtotalSpan.textContent.replace('$', '')),
            shipping: parseFloat(checkoutShippingSpan.textContent.replace('$', '')),
            total: parseFloat(checkoutTotalSpan.textContent.replace('$', '')),
            paymentMethod: paymentMethod,
            orderDate: new Date().toISOString(),
            deliveryETA: deliveryETA
        };

        console.log('Order Placed:', orderDetails);

        // Clear cart after successful order
        cart = [];
        saveCart();
        updateCartCountBadge();

        // Display confirmation
        if (orderNumberDisplay) orderNumberDisplay.textContent = orderNumber;
        if (orderEtaDisplay) orderEtaDisplay.textContent = deliveryETA;

        closeModal(checkoutModal);
        openModal(orderConfirmationModal);
        checkoutForm.reset(); // Clear checkout form
        displayCheckoutMessage('Order placed successfully!', 'success'); // Clear any previous error message

        // In a real app, you'd send orderDetails to a backend here.
    }

    /**
     * Displays a message within the checkout modal.
     * @param {string} message - The message to display.
     * @param {string} type - 'success' or 'error'.
     */
    function displayCheckoutMessage(message, type) {
        if (checkoutResponseMessage) {
            checkoutResponseMessage.textContent = message;
            checkoutResponseMessage.className = `response-message ${type}`;
            checkoutResponseMessage.style.display = 'block';
        }
    }

    /**
     * Generates a unique-ish order number.
     * @returns {string} A formatted order number.
     */
    function generateOrderNumber() {
        const timestamp = Date.now().toString().slice(-6); // Last 6 digits of timestamp
        const random = Math.random().toString(36).substring(2, 6).toUpperCase(); // 4 random chars
        return `CNG-ORD-${timestamp}-${random}`;
    }

    /**
     * Calculates an estimated delivery time.
     * @returns {string} Estimated delivery date range.
     */
    function calculateDeliveryETA() {
        const today = new Date();
        const minDays = 3;
        const maxDays = 7;

        const minDate = new Date(today);
        minDate.setDate(today.getDate() + minDays);
        const maxDate = new Date(today);
        maxDate.setDate(today.getDate() + maxDays);

        const options = { weekday: 'short', month: 'short', day: 'numeric' };
        return `${minDate.toLocaleDateString('en-US', options)} - ${maxDate.toLocaleDateString('en-US', options)}`;
    }

    // --- Event Listeners ---

    // Search bar functionality
    if (productSearchInput) {
        productSearchInput.addEventListener('input', handleSearchInput);
        productSearchBtn.addEventListener('click', applyFiltersAndSort);
        productSearchInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                applyFiltersAndSort();
                productSearchSuggestions.style.display = 'none'; // Hide suggestions on Enter
            }
        });
        // Hide suggestions when clicking outside
        document.addEventListener('click', (event) => {
            if (productSearchSuggestions && !productSearchInput.contains(event.target) && !productSearchSuggestions.contains(event.target)) {
                productSearchSuggestions.style.display = 'none';
            }
        });
    }

    // Filter & Sort functionality
    if (categoryFilter) {
        categoryFilter.addEventListener('change', updateSubCategoryFilter);
    }
    if (applyFiltersBtn) {
        applyFiltersBtn.addEventListener('click', applyFiltersAndSort);
    }
    if (clearFiltersBtn) {
        clearFiltersBtn.addEventListener('click', clearFilters);
    }

    // Cart button
    if (cartBtn) {
        cartBtn.addEventListener('click', () => {
            renderCart(); // Ensure cart is up-to-date before opening
            openModal(cartModal);
        });
    }

    // Notifications button (simulated)
    if (notificationsBtn) {
        notificationsBtn.addEventListener('click', () => {
            showNotification('You have 0 new notifications.', 'info'); // Placeholder
            // In a real app, this would open a notifications modal or page
        });
    }

    // Modal close buttons
    document.querySelectorAll('.modal .close-button').forEach(button => {
        button.addEventListener('click', function() {
            const modal = this.closest('.modal');
            closeModal(modal);
        });
    });

    // Close toast notification
    if (closeToastBtn) {
        closeToastBtn.addEventListener('click', () => {
            if (notificationToast) notificationToast.classList.remove('show');
            setTimeout(() => { // Give time for fade-out
                if (notificationToast) notificationToast.style.display = 'none';
            }, 300);
        });
    }

    // Checkout button in cart modal
    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', handleCheckout);
    }

    // Checkout form submission
    if (checkoutForm) {
        checkoutForm.addEventListener('submit', placeOrder);
    }

    // Scroll to Top functionality
    if (scrollToTopBtn) {
        scrollToTopBtn.addEventListener('click', () => {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
        window.addEventListener('scroll', () => {
            if (window.scrollY > 300) {
                scrollToTopBtn.classList.add('show');
            } else {
                scrollToTopBtn.classList.remove('show');
            }
        });
    }

    // --- Initialization ---
    fetchProducts();
});