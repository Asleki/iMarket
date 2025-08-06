/*
 * click-n-get-categories.js
 * This file handles the dynamic loading, filtering by category, and display of products
 * for the Click 'n Get categories page (click-n-get-categories.html).
 */

document.addEventListener('DOMContentLoaded', function() {
    const productsContainer = document.getElementById('products-container');
    const loadingMessage = productsContainer ? productsContainer.querySelector('.loading-message') : null;
    const noResultsMessage = document.getElementById('no-results-message');
    const loadMoreBtn = document.getElementById('load-more-btn');
    const scrollToTopBtn = document.getElementById('scroll-to-top-btn');

    // Hero section elements
    const categoryHeroTitle = document.getElementById('category-hero-title');
    const categoryHeroDescription = document.getElementById('category-hero-description');
    const categoryListingTitle = document.getElementById('category-listing-title');

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

    let allProducts = []; // Stores the original, unfiltered list of products
    let filteredProducts = []; // Stores products after category filter is applied
    let productsPerPage = 15;
    let currentPage = 0;
    let currentCategory = ''; // Stores the category from the URL

    // --- Category Name Mapping ---
    // This object maps URL friendly category names to their exact counterparts
    // in the products.json 'category' or 'subCategory' fields.
    const categoryMapping = {
        "electronics": "Electronics",
        "smartphones": "Smartphones & Tablets",
        "laptops": "Laptops & Computers",
        "televisions": "Televisions",
        "accessories": "Accessories", // For general electronics accessories
        "fashion": "Apparel", // 'Apparel' is the main category in JSON
        "mensfashion": "Men's Clothing",
        "womensfashion": "Women's Clothing",
        "kidsbaby": "Kids & Baby",
        "bagsshoes": "Bags, Shoes & Accessories",
        "homegoods": "Home Goods", // 'Home Goods' is the main category in JSON
        "majorappliances": "Major Appliances",
        "cookware": "Cookware & Dining",
        "homedecor": "Home Decor",
        "furniture": "Furniture",
        "audio": "Audio", // Example subCategory
        "gamingperipherals": "Gaming Peripherals", // Example subCategory
        "kitchenappliances": "Kitchen Appliances" // Example subCategory
        // Add more mappings as needed for other shops/categories
    };

    // --- Utility Functions ---

    /**
     * Gets a query parameter from the URL.
     * @param {string} param - The name of the query parameter.
     * @returns {string|null} The value of the parameter, or null if not found.
     */
    function getQueryParam(param) {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get(param);
    }

    /**
     * Updates meta tags for SEO and social sharing based on category.
     * @param {string} category - The category name.
     * @param {number} count - The number of products in the category.
     */
    function updateMetaTags(category, count = 0) {
        const defaultTitle = "Click 'n Get - Categories";
        const defaultDescription = "Browse products by category on Click 'n Get. Find electronics, fashion, home goods, and more for sale in Kenya.";
        const defaultImage = "images/shop-click-n-get.webp";
        const defaultKeywords = "Click n Get categories, electronics for sale, fashion online, home goods Kenya, product types Kenya";

        let title = defaultTitle;
        let description = defaultDescription;
        let keywords = defaultKeywords;

        if (category) {
            title = `${category} for Sale - Click 'n Get`;
            description = `Explore ${count > 0 ? count : 'various'} ${category.toLowerCase()} products available for sale in Kenya. Find your ideal ${category.toLowerCase()} today!`;
            keywords = `${category} for sale Kenya, online shopping ${category.toLowerCase()}, Click n Get ${category.toLowerCase()}, ${defaultKeywords}`;
        }
        
        if (pageTitle) pageTitle.textContent = title;
        if (metaDescription) metaDescription.setAttribute('content', description);
        if (metaKeywords) metaKeywords.setAttribute('content', keywords);
        if (canonicalLink) canonicalLink.setAttribute('href', window.location.href);

        // Open Graph / Twitter
        if (ogTitle) ogTitle.setAttribute('content', title);
        if (ogDescription) ogDescription.setAttribute('content', description);
        if (ogImage) ogImage.setAttribute('content', defaultImage); 
        if (twitterTitle) twitterTitle.setAttribute('content', title);
        if (twitterDescription) twitterDescription.setAttribute('content', description);
        if (twitterImage) twitterImage.setAttribute('content', defaultImage); 
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
        const notificationToast = document.getElementById('notification-toast');
        const notificationText = document.getElementById('notification-text');
        const closeToastBtn = notificationToast ? notificationToast.querySelector('.close-toast-btn') : null;

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

            // Ensure close button listener is set if not already
            if (closeToastBtn && !closeToastBtn.dataset.listenerAdded) {
                closeToastBtn.addEventListener('click', () => {
                    if (notificationToast) notificationToast.classList.remove('show');
                    setTimeout(() => { // Give time for fade-out
                        if (notificationToast) notificationToast.style.display = 'none';
                    }, 300);
                });
                closeToastBtn.dataset.listenerAdded = 'true'; // Mark listener as added
            }
        }
    }

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

        // Add to cart button event listener (simplified for category page)
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

        // Make the entire card clickable to product details
        productCard.addEventListener('click', function() {
            window.location.href = `click-n-get-product-details.html?id=${product.id}`;
        });

        return productCard;
    }

    /**
     * Renders a list of products into the main products container.
     * @param {Array<object>} productsToRender - Array of product objects to display.
     */
    function renderProductCards(productsToRender) {
        if (!productsContainer) return;

        productsToRender.forEach(product => {
            productsContainer.appendChild(createProductCard(product));
        });
    }

    /**
     * Displays products for the current page.
     */
    function displayProducts() {
        if (!productsContainer) return;

        const startIndex = currentPage * productsPerPage;
        const endIndex = startIndex + productsPerPage;
        const productsToShow = filteredProducts.slice(startIndex, endIndex);

        if (currentPage === 0) { // Clear only for the first page load/filter application
            productsContainer.innerHTML = '';
        }
        
        renderProductCards(productsToShow);

        // Manage Load More button visibility
        if (loadMoreBtn) {
            if (endIndex < filteredProducts.length) {
                loadMoreBtn.style.display = 'block';
            } else {
                loadMoreBtn.style.display = 'none'; // No more products to load
            }
        }

        // Show/hide no results message
        if (noResultsMessage) {
            if (filteredProducts.length === 0) {
                noResultsMessage.style.display = 'block';
            } else {
                noResultsMessage.style.display = 'none';
            }
        }
    }

    /**
     * Loads more products when the "Load More" button is clicked.
     */
    function loadMoreProducts() {
        currentPage++;
        displayProducts();
    }

    /**
     * Filters products by category or subCategory based on the URL parameter.
     * @param {string} urlCategoryParam - The category or sub-category name from the URL.
     */
    function filterProductsByCategory(urlCategoryParam) {
        const lowerCaseUrlCategoryParam = urlCategoryParam ? urlCategoryParam.toLowerCase() : '';
        
        if (lowerCaseUrlCategoryParam) {
            // Get the mapped category name from our mapping object
            // If not found, use the lowerCaseUrlCategoryParam directly as a fallback
            const mappedCategory = categoryMapping[lowerCaseUrlCategoryParam] || lowerCaseUrlCategoryParam;
            const lowerCaseMappedCategory = mappedCategory.toLowerCase();

            filteredProducts = allProducts.filter(product => {
                // Check if product's main category or sub-category matches the mapped category
                return product.category.toLowerCase() === lowerCaseMappedCategory ||
                       product.subCategory.toLowerCase() === lowerCaseMappedCategory;
            });

            // Update hero and listing titles using the original URL parameter for display
            if (categoryHeroTitle) categoryHeroTitle.textContent = `${urlCategoryParam} for Sale`;
            if (categoryHeroDescription) categoryHeroDescription.textContent = `Explore our selection of ${urlCategoryParam.toLowerCase()} products.`;
            if (categoryListingTitle) categoryListingTitle.textContent = `${urlCategoryParam} Products`;
        } else {
            // If no category is specified, show all products
            filteredProducts = [...allProducts];
            if (categoryHeroTitle) categoryHeroTitle.textContent = `All Product Categories`;
            if (categoryHeroDescription) categoryHeroDescription.textContent = `Browse products across all types.`;
            if (categoryListingTitle) categoryListingTitle.textContent = `All Products`;
        }
        currentPage = 0; // Reset to first page when category changes
        displayProducts(); // Re-render from the beginning
        updateMetaTags(urlCategoryParam, filteredProducts.length); // Update SEO meta tags
    }

    /**
     * Fetches product data from products.json and initializes the page.
     */
    async function fetchProducts() {
        if (loadingMessage) {
            loadingMessage.style.display = 'block';
        }
        try {
            const response = await fetch('data/clicknget-products.json');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            allProducts = await response.json(); // Store original data
            console.log('Products loaded:', allProducts.length);

            currentCategory = getQueryParam('category');
            filterProductsByCategory(currentCategory); // Apply initial category filter
        } catch (error) {
            console.error('Error fetching products data:', error);
            if (productsContainer) {
                productsContainer.innerHTML = '<p class="error-message">Failed to load products. Please try again later.</p>';
            }
            if (noResultsMessage) noResultsMessage.style.display = 'none'; // Hide if error
            updateMetaTags(currentCategory, 0); // Update SEO with default/error
        } finally {
            if (loadingMessage) {
                loadingMessage.style.display = 'none';
            }
        }
    }

    // --- Shopping Cart Logic  ---
    /**
     * Loads cart data from localStorage.
     * @returns {Array} The cart array.
     */
    function loadCart() {
        const storedCart = localStorage.getItem('clickNGetCart');
        if (storedCart) {
            try {
                return JSON.parse(storedCart);
            } catch (e) {
                console.error("Error parsing cart from localStorage:", e);
                return []; // Reset corrupted cart
            }
        }
        return [];
    }

    /**
     * Saves cart data to localStorage.
     * @param {Array} currentCart - The cart array to save.
     */
    function saveCart(currentCart) {
        localStorage.setItem('clickNGetCart', JSON.stringify(currentCart));
    }

    /**
     * Adds a product to the cart or updates its quantity.
     * @param {object} product - The product object to add.
     * @param {number} quantity - The quantity to add.
     */
    function addToCart(product, quantity) {
        let cart = loadCart(); // Load current cart
        const existingItemIndex = cart.findIndex(item => item.id === product.id);

        if (existingItemIndex > -1) {
            const currentQuantity = cart[existingItemIndex].quantity;
            const newQuantity = currentQuantity + quantity;

            if (product.maxOrderQuantity && newQuantity > product.maxOrderQuantity) {
                showNotification(`You can only order a maximum of ${product.maxOrderQuantity} of this item.`, 'error');
                return;
            }
            if (newQuantity > product.inStock) {
                showNotification(`Only ${product.inStock} of "${product.name}" are available in stock.`, 'error');
                return;
            }

            cart[existingItemIndex].quantity = newQuantity;
            showNotification(`"${product.name}" quantity updated in cart.`, 'info');
        } else {
            if (product.minOrderQuantity && quantity < product.minOrderQuantity) {
                showNotification(`Minimum order quantity for "${product.name}" is ${product.minOrderQuantity}.`, 'error');
                return;
            }
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
        saveCart(cart);
        // In a real app, you'd also update a cart count badge in the header here
        // For this page, we don't have the badge element directly, but main.js handles it.
    }

    // --- Event Listeners ---

    // Event Listener for Load More button
    if (loadMoreBtn) {
        loadMoreBtn.addEventListener('click', loadMoreProducts);
    }

    // Scroll to Top functionality (reused from main.js)
    function toggleScrollToTopButton() {
        if (scrollToTopBtn) {
            if (window.scrollY > 300) { // Show button after scrolling 300px down
                scrollToTopBtn.classList.add('show');
            } else {
                scrollToTopBtn.classList.remove('show');
            }
        }
    }

    function scrollToTop() {
        window.scrollTo({
            top: 0,
            behavior: 'smooth' // Smooth scroll animation
        });
    }

    // Listen for scroll events for the scroll-to-top button
    window.addEventListener('scroll', toggleScrollToTopButton);

    // Initial fetch and render when the DOM is fully loaded
    fetchProducts();
});