/*
 * js/click-n-get-product-details.js
 * This file handles the dynamic loading and display of product details for the
 * Click 'n Get product details page (click-n-get-product-details.html).
 * It fetches product data based on a URL ID, renders details, handles color selection,
 * and adds to cart functionality.
 */

document.addEventListener('DOMContentLoaded', function() {
    const productDetailsContainer = document.getElementById('product-details-container');
    const errorMessageDiv = document.getElementById('error-message');
    const notificationToast = document.getElementById('notification-toast');
    const notificationText = document.getElementById('notification-text');
    const closeToastBtn = notificationToast ? notificationToast.querySelector('.close-toast-btn') : null;

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

    let allProducts = []; // To store all products for finding the specific one

    // --- Color Mapping for non-standard names ---
    // This map provides a representative hex code for descriptive color names.
    const colorMap = {
        "Black": "#000000",
        "White": "#FFFFFF",
        "Dark Blue": "#00008B",
        "Light Blue": "#ADD8E6",
        "Grey": "#808080",
        "Silver": "#C0C0C0",
        "Stainless Steel": "#B0B0B0", // A typical stainless steel grey
        "Blue Floral": "#4682B4", // Steel Blue, representative for blue floral
        "Pink Floral": "#FF69B4", // Hot Pink, representative for pink floral
        "Yellow Floral": "#FFD700"  // Gold, representative for yellow floral
    };

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

    // --- Shopping Cart Logic (Simplified for product details page) ---

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
                image: product.images[0], // Use the first image for cart display
                quantity: quantity
            });
            showNotification(`"${product.name}" added to cart!`, 'success');
        }
        saveCart(cart); // Save updated cart
        // In a real app, you'd also update a cart count badge in the header here
        // For this page, we don't have the badge element directly, but main.js handles it.
    }

    // --- Product Details Rendering ---

    /**
     * Renders the details of a specific product.
     * @param {object} product - The product object to render.
     */
    function renderProductDetails(product) {
        if (!productDetailsContainer) return;

        productDetailsContainer.innerHTML = ''; // Clear loading message

        const displayPrice = product.isDiscounted ? product.price : product.originalPrice;
        const originalPriceHtml = product.isDiscounted ? `<span class="original-price">$${product.originalPrice.toFixed(2)}</span>` : '';
        const discountBadge = product.isDiscounted ? `<span class="discount-badge">-${(((product.originalPrice - product.price) / product.originalPrice) * 100).toFixed(0)}%</span>` : '';
        const freeShippingBadge = product.isFreeShipping ? `<span class="free-shipping-badge"><i class="fas fa-truck"></i> Free Shipping</span>` : '';

        const mainImageUrl = product.images && product.images.length > 0 
                             ? product.images[0] 
                             : `https://placehold.co/600x400/CCCCCC/333333?text=Product+Image`;

        let thumbnailImagesHtml = '';
        if (product.thumbnailImages && product.thumbnailImages.length > 0) {
            product.thumbnailImages.forEach(thumbUrl => {
                thumbnailImagesHtml += `<img src="${thumbUrl}" alt="${product.name} thumbnail" class="thumbnail-image" onerror="this.onerror=null;this.src='https://placehold.co/100x75/E0E0E0/666666?text=Thumb';" loading="lazy">`;
            });
        } else if (product.images && product.images.length > 1) {
            // If no explicit thumbnails, use other images as thumbnails
            product.images.slice(1).forEach(imgUrl => {
                 thumbnailImagesHtml += `<img src="${imgUrl}" alt="${product.name} thumbnail" class="thumbnail-image" onerror="this.onerror=null;this.src='https://placehold.co/100x75/E0E0E0/666666?text=Thumb';" loading="lazy">`;
            });
        }

        let featuresListHtml = '';
        if (product.features && product.features.length > 0) {
            featuresListHtml = product.features.map(feature => `<li><i class="fas fa-check-circle"></i> ${feature}</li>`).join('');
        }

        let specificationsTableHtml = '';
        if (product.specifications && Object.keys(product.specifications).length > 0) {
            specificationsTableHtml = `
                <h3>Specifications</h3>
                <table class="specifications-table">
                    <tbody>
            `;
            for (const key in product.specifications) {
                specificationsTableHtml += `
                    <tr>
                        <td>${key}</td>
                        <td>${product.specifications[key]}</td>
                    </tr>
                `;
            }
            specificationsTableHtml += `
                    </tbody>
                </table>
            `;
        }

        let reviewsHtml = '';
        if (product.reviews && product.reviews.length > 0) {
            reviewsHtml = `
                <h3>Customer Reviews (${product.reviews.length})</h3>
                <div class="reviews-list">
            `;
            product.reviews.forEach(review => {
                reviewsHtml += `
                    <div class="review-item">
                        <div class="review-header">
                            <span class="reviewer-name">${review.reviewerName}</span>
                            <div class="review-rating">${getStarRatingHtml(review.rating)}</div>
                            <span class="review-date">${new Date(review.date).toLocaleDateString()}</span>
                        </div>
                        <p class="review-comment">${review.comment}</p>
                    </div>
                `;
            });
            reviewsHtml += `</div>`;
        }


        productDetailsContainer.innerHTML = `
            <div class="product-images">
                <div class="main-image-wrapper">
                    <img id="main-product-image" src="${mainImageUrl}" alt="${product.name}" onerror="this.onerror=null;this.src='https://placehold.co/600x400/CCCCCC/333333?text=Image+Error';">
                    ${discountBadge}
                    ${freeShippingBadge}
                </div>
                <div class="thumbnail-gallery">
                    ${thumbnailImagesHtml}
                </div>
            </div>
            <div class="product-info-details">
                <nav class="breadcrumb">
                    <a href="click-n-get-index.html">Home</a> &gt; 
                    <a href="click-n-get-categories.html?category=${encodeURIComponent(product.category)}">${product.category}</a> &gt;
                    <span>${product.name}</span>
                </nav>
                <h1 class="product-title">${product.name}</h1>
                <p class="product-brand-details">Brand: <a href="click-n-get-categories.html?category=${encodeURIComponent(product.brand)}">${product.brand}</a></p>
                <div class="product-rating-details">
                    ${getStarRatingHtml(product.rating)}
                    <span class="reviews-count-details">(${product.reviewsCount.toLocaleString()} reviews)</span>
                </div>
                <p class="product-description">${product.description}</p>
                
                <div class="product-price-details">
                    <span class="current-price">$${displayPrice.toFixed(2)}</span>
                    ${originalPriceHtml}
                </div>

                <div class="product-options">
                    ${product.availableColors && product.availableColors.length > 0 ? `
                        <div class="color-options">
                            <label>Color: <span id="selected-color-text">${product.color || product.availableColors[0]}</span></label>
                            <div class="color-swatches-container">
                                ${product.availableColors.map(colorName => `
                                    <div class="color-swatch ${product.color === colorName ? 'selected' : ''}" 
                                         data-color="${colorName}" 
                                         style="background-color: ${colorMap[colorName] || colorName.toLowerCase()};"
                                         title="${colorName}"
                                         aria-label="Select color ${colorName}">
                                         ${colorName.toLowerCase() === 'white' ? '<div class="white-color-border"></div>' : ''}
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                    ` : ''}

                    ${product.availableSizes && product.availableSizes.length > 0 ? `
                        <div class="size-options">
                            <label for="size-select">Size: <span id="selected-size-text">${product.size || product.availableSizes[0]}</span></label>
                            <select id="size-select" aria-label="Select size">
                                ${product.availableSizes.map(size => `<option value="${size}" ${product.size === size ? 'selected' : ''}>${size}</option>`).join('')}
                            </select>
                        </div>
                    ` : ''}
                </div>

                <div class="quantity-add-to-cart">
                    <label for="quantity-input">Quantity:</label>
                    <div class="quantity-controls">
                        <button id="decrease-quantity">-</button>
                        <input type="number" id="quantity-input" value="1" min="${product.minOrderQuantity || 1}" max="${product.maxOrderQuantity || product.inStock}" aria-label="Product quantity">
                        <button id="increase-quantity">+</button>
                    </div>
                    <button id="add-to-cart-btn" class="btn btn-primary add-to-cart-lg" ${product.inStock === 0 ? 'disabled' : ''}>
                        ${product.inStock === 0 ? 'Out of Stock' : '<i class="fas fa-cart-plus"></i> Add to Cart'}
                    </button>
                </div>

                <div class="product-availability">
                    <p>Availability: <span class="${product.inStock > 0 ? 'in-stock' : 'out-of-stock'}">
                        ${product.inStock > 0 ? `${product.inStock} In Stock` : 'Out of Stock'}
                    </span></p>
                    ${product.shipping ? `<p>Shipping: ${product.shipping}</p>` : ''}
                    ${product.waitingPeriod ? `<p>Delivery: ${product.waitingPeriod}</p>` : ''}
                </div>

                <div class="product-features-list">
                    <h3>Key Features</h3>
                    <ul>
                        ${featuresListHtml}
                    </ul>
                </div>

                ${specificationsTableHtml}
                ${reviewsHtml}
            </div>
        `;

        // Update SEO meta tags for this specific product
        updateMetaTags(
            `${product.name} - Click 'n Get`,
            product.description,
            mainImageUrl,
            `${product.name}, ${product.brand}, ${product.category}, ${product.subCategory}, buy online, product details, Kenya`
        );

        // --- Add Event Listeners for Product Interactions ---
        const mainProductImage = document.getElementById('main-product-image');
        const quantityInput = document.getElementById('quantity-input');
        const decreaseQuantityBtn = document.getElementById('decrease-quantity');
        const increaseQuantityBtn = document.getElementById('increase-quantity');
        const addToCartLgBtn = document.getElementById('add-to-cart-btn');
        const colorSwatches = document.querySelectorAll('.color-swatch');
        const selectedColorText = document.getElementById('selected-color-text');
        const thumbnailImages = document.querySelectorAll('.thumbnail-image');

        // Thumbnail image click to change main image
        thumbnailImages.forEach(thumb => {
            thumb.addEventListener('click', function() {
                if (mainProductImage) {
                    mainProductImage.src = this.src;
                }
            });
        });

        // Color swatch selection
        colorSwatches.forEach(swatch => {
            swatch.addEventListener('click', function() {
                // Remove 'selected' from all swatches
                colorSwatches.forEach(s => s.classList.remove('selected'));
                // Add 'selected' to clicked swatch
                this.classList.add('selected');
                // Update displayed color text
                if (selectedColorText) {
                    selectedColorText.textContent = this.dataset.color;
                }
                // In a real application, this would also update the displayed product image
                // if different images are available for different colors.
            });
        });

        // Quantity controls
        if (decreaseQuantityBtn) {
            decreaseQuantityBtn.addEventListener('click', () => {
                let currentVal = parseInt(quantityInput.value);
                if (currentVal > (product.minOrderQuantity || 1)) {
                    quantityInput.value = currentVal - 1;
                }
            });
        }
        if (increaseQuantityBtn) {
            increaseQuantityBtn.addEventListener('click', () => {
                let currentVal = parseInt(quantityInput.value);
                if (currentVal < (product.maxOrderQuantity || product.inStock)) {
                    quantityInput.value = currentVal + 1;
                }
            });
        }
        // Ensure quantity input respects min/max
        if (quantityInput) {
            quantityInput.addEventListener('change', () => {
                let currentVal = parseInt(quantityInput.value);
                const min = product.minOrderQuantity || 1;
                const max = product.maxOrderQuantity || product.inStock;
                if (isNaN(currentVal) || currentVal < min) {
                    quantityInput.value = min;
                } else if (currentVal > max) {
                    quantityInput.value = max;
                }
            });
        }

        // Add to Cart button
        if (addToCartLgBtn) {
            addToCartLgBtn.addEventListener('click', () => {
                const quantity = parseInt(quantityInput.value);
                addToCart(product, quantity);
            });
        }
    }

    /**
     * Fetches product data and renders the specific product details.
     */
    async function fetchAndRenderProductDetails() {
        if (productDetailsContainer) {
            productDetailsContainer.innerHTML = '<p class="loading-message">Loading product details...</p>';
            errorMessageDiv.style.display = 'none';
        }

        const urlParams = new URLSearchParams(window.location.search);
        const productId = urlParams.get('id');

        if (!productId) {
            if (productDetailsContainer) productDetailsContainer.innerHTML = ''; // Clear loading
            if (errorMessageDiv) errorMessageDiv.style.display = 'block';
            console.error('Product ID not found in URL.');
            updateMetaTags(
                "Product Not Found - Click 'n Get",
                "The requested product could not be found.",
                "images/shop-click-n-get.webp",
                "product not found, error, Click n Get"
            );
            return;
        }

        try {
            const response = await fetch('data/clicknget-products.json');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            allProducts = await response.json(); // Store all products
            const product = allProducts.find(p => p.id === productId);

            if (product) {
                renderProductDetails(product);
            } else {
                if (productDetailsContainer) productDetailsContainer.innerHTML = '';
                if (errorMessageDiv) errorMessageDiv.style.display = 'block';
                console.warn(`Product with ID "${productId}" not found.`);
                updateMetaTags(
                    "Product Not Found - Click 'n Get",
                    "The requested product could not be found.",
                    "images/shop-click-n-get.webp",
                    "product not found, error, Click n Get"
                );
            }
        } catch (error) {
            console.error('Error fetching product data:', error);
            if (productDetailsContainer) productDetailsContainer.innerHTML = '';
            if (errorMessageDiv) errorMessageDiv.style.display = 'block';
            showNotification('Failed to load product details. Please try again later.', 'error');
            updateMetaTags(
                "Error Loading Product - Click 'n Get",
                "An error occurred while loading product details.",
                "images/shop-click-n-get.webp",
                "product error, loading issue, Click n Get"
            );
        }
    }

    // Close toast notification
    if (closeToastBtn) {
        closeToastBtn.addEventListener('click', () => {
            if (notificationToast) notificationToast.classList.remove('show');
            setTimeout(() => { // Give time for fade-out
                if (notificationToast) notificationToast.style.display = 'none';
            }, 300);
        });
    }

    // Initial fetch and render
    fetchAndRenderProductDetails();
});