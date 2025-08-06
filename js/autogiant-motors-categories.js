/*
 * autogiant-motors-categories.js
 * This file handles the dynamic loading, filtering by category, and display of vehicles
 * for the AutoGiant Motors categories page (autogiant-motors-categories.html).
 */

document.addEventListener('DOMContentLoaded', function() {
    const vehiclesContainer = document.getElementById('vehicles-container');
    const loadingMessage = vehiclesContainer ? vehiclesContainer.querySelector('.loading-message') : null;
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

    let allVehicles = []; // Stores the original, unfiltered list of vehicles
    let filteredVehicles = []; // Stores vehicles after category filter is applied
    let vehiclesPerPage = 15;
    let currentPage = 0;
    let currentCategory = ''; // Stores the category from the URL

    // Function to get query parameter from URL
    function getQueryParam(param) {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get(param);
    }

    // Function to update meta tags for SEO and social sharing based on category
    function updateMetaTags(category, count = 0) {
        const defaultTitle = "AutoGiant Motors - Categories";
        const defaultDescription = "Browse vehicles by category on AutoGiant Motors. Find cars, SUVs, and electric vehicles for sale in Kenya.";
        const defaultImage = "images/shop-autogiant-motors.webp"; // This is the image for the shop itself
        const defaultKeywords = "AutoGiant Motors categories, cars for sale, electric vehicles Kenya, SUVs for sale, motorcycles Kenya, vehicle types Kenya";

        let title = defaultTitle;
        let description = defaultDescription;
        let keywords = defaultKeywords;

        if (category) {
            title = `${category} for Sale - AutoGiant Motors`;
            description = `Explore ${count > 0 ? count : 'various'} ${category.toLowerCase()} vehicles available for sale in Kenya. Find your ideal ${category.toLowerCase()} today!`;
            keywords = `${category} for sale Kenya, vehicle ${category.toLowerCase()}, AutoGiant Motors ${category.toLowerCase()}, ${defaultKeywords}`;
        }
        
        if (pageTitle) pageTitle.textContent = title;
        if (metaDescription) metaDescription.setAttribute('content', description);
        if (metaKeywords) metaKeywords.setAttribute('content', keywords);
        if (canonicalLink) canonicalLink.setAttribute('href', window.location.href);

        // Open Graph / Twitter - Use defaultImage here
        if (ogTitle) ogTitle.setAttribute('content', title);
        if (ogDescription) ogDescription.setAttribute('content', description);
        if (ogImage) ogImage.setAttribute('content', defaultImage); 
        if (twitterTitle) twitterTitle.setAttribute('content', title);
        if (twitterDescription) twitterDescription.setAttribute('content', description);
        if (twitterImage) twitterImage.setAttribute('content', defaultImage); 
    }

    // Function to render car cards (reused from autogiant-motors-main.js logic)
    function renderCarCards(vehiclesToRender) {
        if (!vehiclesContainer) return;

        vehiclesToRender.forEach(car => {
            // Unique ID for product details page based on make, model, year
            const carId = `${car.make}-${car.model}-${car.year}`;
            const carCard = document.createElement('a'); // Make the whole card clickable
            carCard.href = `autogiant-motors-product-details.html?make=${encodeURIComponent(car.make)}&model=${encodeURIComponent(car.model)}&year=${car.year}`;
            carCard.classList.add('product-card', 'car-card');

            const imageUrl = car.car_display_image || `https://placehold.co/300x200/FF5722/FFFFFF?text=Car`; // Orange placeholder

            const formattedPrice = `KSh ${car.price.toLocaleString()}`;

            let featuresDisplay = [];
            if (car.engine_type) featuresDisplay.push(car.engine_type);
            if (car.year) featuresDisplay.push(car.year);
            if (car.imported) featuresDisplay.push('Imported');
            else featuresDisplay.push('Local');
            
            carCard.innerHTML = `
                <img src="${imageUrl}" alt="${car.make} ${car.model}" onerror="this.onerror=null;this.src='https://placehold.co/300x200/FF5722/FFFFFF?text=Image+Error';" loading="lazy">
                <div class="product-info">
                    <h3>${car.make} ${car.model}</h3>
                    <p class="car-details">${featuresDisplay.join(' | ')}</p>
                    <p class="product-price">${formattedPrice}</p>
                    ${car.shipping_fee > 0 ? `<p class="car-shipping-fee">Shipping: KSh ${car.shipping_fee.toLocaleString()}</p>` : ''}
                    ${car.waiting_period_days > 0 ? `<p class="car-waiting-period">Wait: ${car.waiting_period_days} days</p>` : ''}
                </div>
            `;
            vehiclesContainer.appendChild(carCard);
        });
    }

    // Function to display vehicles for the current page
    function displayVehicles() {
        if (!vehiclesContainer) return;

        const startIndex = currentPage * vehiclesPerPage;
        const endIndex = startIndex + vehiclesPerPage;
        const vehiclesToShow = filteredVehicles.slice(startIndex, endIndex);

        if (currentPage === 0) { // Clear only for the first page load/filter application
            vehiclesContainer.innerHTML = '';
        }
        
        renderCarCards(vehiclesToShow);

        // Manage Load More button visibility
        if (loadMoreBtn) {
            if (endIndex < filteredVehicles.length) {
                loadMoreBtn.style.display = 'block';
            } else {
                loadMoreBtn.style.display = 'none'; // No more vehicles to load
            }
        }

        // Show/hide no results message
        if (noResultsMessage) {
            if (filteredVehicles.length === 0) {
                noResultsMessage.style.display = 'block';
            } else {
                noResultsMessage.style.display = 'none';
            }
        }
    }

    // Function to load more vehicles
    function loadMoreVehicles() {
        currentPage++;
        displayVehicles();
    }

    // Function to filter vehicles by category
    function filterVehiclesByCategory(category) {
        const lowerCaseCategory = category ? category.toLowerCase() : '';
        
        if (lowerCaseCategory) {
            if (lowerCaseCategory === 'cars' || lowerCaseCategory === 'suvs') {
                // For "Cars" or "SUVs", show all vehicles as current JSON only contains these types
                filteredVehicles = allVehicles.filter(car => !car.electric); // Exclude electric if "Cars" means traditional
                // Or simply: filteredVehicles = [...allVehicles]; if "Cars" means all non-motorcycle vehicles
                filteredVehicles = allVehicles.filter(car => !car.electric); // Filter out electric cars if "Cars" implies non-electric
            } else if (lowerCaseCategory === 'electric') {
                filteredVehicles = allVehicles.filter(car => car.electric === true);
            } else if (lowerCaseCategory === 'motorcycles' || lowerCaseCategory === 'spareparts') {
                // These categories are not explicitly supported by the current cars.json structure
                filteredVehicles = []; // No results for these categories with current data
            } else {
                // Assume category might be a 'make' (e.g., "Toyota", "Mazda")
                filteredVehicles = allVehicles.filter(car => 
                    car.make.toLowerCase() === lowerCaseCategory
                );
            }

            // Update hero and listing titles
            if (categoryHeroTitle) categoryHeroTitle.textContent = `${category} for Sale`;
            if (categoryHeroDescription) {
                if (filteredVehicles.length === 0 && (lowerCaseCategory === 'motorcycles' || lowerCaseCategory === 'spareparts')) {
                    categoryHeroDescription.textContent = `Currently, we do not have listings for ${category.toLowerCase()}. Please check back later!`;
                } else {
                    categoryHeroDescription.textContent = `Explore our selection of ${category.toLowerCase()} vehicles.`;
                }
            }
            if (categoryListingTitle) categoryListingTitle.textContent = `${category} Vehicles`;
        } else {
            // If no category is specified, show all vehicles
            filteredVehicles = [...allVehicles];
            if (categoryHeroTitle) categoryHeroTitle.textContent = `All Vehicle Categories`;
            if (categoryHeroDescription) categoryHeroDescription.textContent = `Browse vehicles across all types.`;
            if (categoryListingTitle) categoryListingTitle.textContent = `All Vehicles`;
        }
        currentPage = 0; // Reset to first page when category changes
        displayVehicles(); // Re-render from the beginning
        updateMetaTags(category, filteredVehicles.length); // Update SEO meta tags
    }

    // Fetch vehicles data
    async function fetchVehicles() {
        if (loadingMessage) {
            loadingMessage.style.display = 'block';
        }
        try {
            const response = await fetch('data/cars.json');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            allVehicles = await response.json(); // Store original data
            console.log('Vehicles loaded:', allVehicles.length);

            currentCategory = getQueryParam('category');
            filterVehiclesByCategory(currentCategory); // Apply initial category filter
        } catch (error) {
            console.error('Error fetching vehicles data:', error);
            if (vehiclesContainer) {
                vehiclesContainer.innerHTML = '<p class="error-message">Failed to load vehicles. Please try again later.</p>';
            }
            if (noResultsMessage) noResultsMessage.style.display = 'none'; // Hide if error
            updateMetaTags(currentCategory, 0); // Update SEO with default/error
        } finally {
            if (loadingMessage) {
                loadingMessage.style.display = 'none';
            }
        }
    }

    // Event Listener for Load More button
    if (loadMoreBtn) {
        loadMoreBtn.addEventListener('click', loadMoreVehicles);
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
    fetchVehicles();
});