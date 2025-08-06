/*
 * soko-properties-categories.js
 * This file handles the dynamic loading, filtering by category, and display of properties
 * for the Soko Properties categories page (soko-properties-categories.html).
 */

document.addEventListener('DOMContentLoaded', function() {
    const propertiesContainer = document.getElementById('properties-container');
    const loadingMessage = propertiesContainer ? propertiesContainer.querySelector('.loading-message') : null;
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

    let allProperties = []; // Stores the original, unfiltered list of properties
    let filteredProperties = []; // Stores properties after category filter is applied
    let propertiesPerPage = 15;
    let currentPage = 0;
    let currentCategory = ''; // Stores the category from the URL

    // Function to get query parameter from URL
    function getQueryParam(param) {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get(param);
    }

    // Function to update meta tags for SEO and social sharing based on category
    function updateMetaTags(category, count = 0) {
        const defaultTitle = "Soko Properties - Categories";
        const defaultDescription = "Browse properties by category on Soko Properties. Find houses, apartments, land, and commercial properties for sale or rent in Kenya.";
        const defaultImage = "images/shop-soko-properties.webp"; // This is the image for the shop itself
        const defaultKeywords = "Soko Properties categories, houses for sale, apartments for rent, land for sale, commercial properties Kenya";

        let title = defaultTitle;
        let description = defaultDescription;
        let keywords = defaultKeywords;

        if (category) {
            title = `${category} for Sale/Rent - Soko Properties`;
            description = `Explore ${count > 0 ? count : 'various'} ${category.toLowerCase()} properties available for sale or rent in Kenya. Find your ideal ${category.toLowerCase()} today!`;
            keywords = `${category} for sale Kenya, ${category} for rent Kenya, real estate ${category.toLowerCase()}, Soko Properties ${category.toLowerCase()}, ${defaultKeywords}`;
        }
        
        if (pageTitle) pageTitle.textContent = title;
        if (metaDescription) metaDescription.setAttribute('content', description);
        if (metaKeywords) metaKeywords.setAttribute('content', keywords);
        if (canonicalLink) canonicalLink.setAttribute('href', window.location.href);

        // Open Graph / Twitter - Use defaultImage here
        if (ogTitle) ogTitle.setAttribute('content', title);
        if (ogDescription) ogDescription.setAttribute('content', description);
        if (ogImage) ogImage.setAttribute('content', defaultImage); // Corrected: use defaultImage
        if (twitterTitle) twitterTitle.setAttribute('content', title);
        if (twitterDescription) twitterDescription.setAttribute('content', description);
        if (twitterImage) twitterImage.setAttribute('content', defaultImage); // Corrected: use defaultImage
    }

    // Function to render property cards (reused from soko-properties-main.js logic)
    function renderPropertyCards(propertiesToRender) {
        if (!propertiesContainer) return;

        propertiesToRender.forEach(property => {
            const propertyCard = document.createElement('a'); // Make the whole card clickable
            propertyCard.href = `soko-properties-product-details.html?id=${encodeURIComponent(property.propertyId)}`;
            propertyCard.classList.add('product-card', 'property-card');

            const imageUrl = property.images && property.images.length > 0 
                             ? property.images[0] 
                             : `https://placehold.co/300x200/4CAF50/FFFFFF?text=Property`; // Green placeholder

            const formattedPrice = `KSh ${property.price.amount.toLocaleString()}`;

            let featuresDisplay = [];
            if (property.bedrooms !== undefined) featuresDisplay.push(`${property.bedrooms} Bed${property.bedrooms !== 1 ? 's' : ''}`);
            if (property.bathrooms !== undefined) featuresDisplay.push(`${property.bathrooms} Bath${property.bathrooms !== 1 ? 's' : ''}`);
            if (property.area && property.area.size) featuresDisplay.push(`${property.area.size} ${property.area.unit}`);
            else if (property.plotSize && property.plotSize.size) featuresDisplay.push(`${property.plotSize.size} ${property.plotSize.unit} Plot`);
            
            propertyCard.innerHTML = `
                <img src="${imageUrl}" alt="${property.title}" onerror="this.onerror=null;this.src='https://placehold.co/300x200/4CAF50/FFFFFF?text=Image+Error';" loading="lazy">
                <div class="product-info">
                    <h3>${property.title}</h3>
                    <p class="property-location"><i class="fas fa-map-marker-alt"></i> ${property.location.city}, ${property.location.county}</p>
                    <p class="property-features">${featuresDisplay.join(' | ')}</p>
                    <p class="product-price">${formattedPrice}</p>
                    <div class="property-views">
                        <i class="fas fa-eye"></i> ${property.views ? property.views.toLocaleString() : '0'} views
                    </div>
                </div>
            `;
            propertiesContainer.appendChild(propertyCard);
        });
    }

    // Function to display properties for the current page
    function displayProperties() {
        if (!propertiesContainer) return;

        const startIndex = currentPage * propertiesPerPage;
        const endIndex = startIndex + propertiesPerPage;
        const propertiesToShow = filteredProperties.slice(startIndex, endIndex);

        if (currentPage === 0) { // Clear only for the first page load/filter application
            propertiesContainer.innerHTML = '';
        }
        
        renderPropertyCards(propertiesToShow);

        // Manage Load More button visibility
        if (loadMoreBtn) {
            if (endIndex < filteredProperties.length) {
                loadMoreBtn.style.display = 'block';
            } else {
                loadMoreBtn.style.display = 'none'; // No more properties to load
            }
        }

        // Show/hide no results message
        if (noResultsMessage) {
            if (filteredProperties.length === 0) {
                noResultsMessage.style.display = 'block';
            } else {
                noResultsMessage.style.display = 'none';
            }
        }
    }

    // Function to load more properties
    function loadMoreProperties() {
        currentPage++;
        displayProperties();
    }

    // Function to filter properties by category
    function filterPropertiesByCategory(category) {
        if (category) {
            const lowerCaseCategory = category.toLowerCase();
            filteredProperties = allProperties.filter(property => {
                // Check if the singular propertyType is contained within the (potentially plural) category
                // E.g., "houses".includes("house") -> true
                // E.g., "apartments".includes("apartment") -> true
                // E.g., "land".includes("land") -> true
                return lowerCaseCategory.includes(property.propertyType.toLowerCase());
            });
            
            // Update hero and listing titles
            if (categoryHeroTitle) categoryHeroTitle.textContent = `${category} for Sale/Rent`;
            if (categoryHeroDescription) categoryHeroDescription.textContent = `Explore our selection of ${category.toLowerCase()} properties.`;
            if (categoryListingTitle) categoryListingTitle.textContent = `${category} Properties`;
        } else {
            // If no category is specified, show all properties
            filteredProperties = [...allProperties];
            if (categoryHeroTitle) categoryHeroTitle.textContent = `All Property Categories`;
            if (categoryHeroDescription) categoryHeroDescription.textContent = `Browse properties across all types.`;
            if (categoryListingTitle) categoryListingTitle.textContent = `All Properties`;
        }
        currentPage = 0; // Reset to first page when category changes
        displayProperties(); // Re-render from the beginning
        updateMetaTags(category, filteredProperties.length); // Update SEO meta tags
    }

    // Fetch properties data
    async function fetchProperties() {
        if (loadingMessage) {
            loadingMessage.style.display = 'block';
        }
        try {
            const response = await fetch('data/properties.json');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            allProperties = await response.json(); // Store original data
            console.log('Properties loaded:', allProperties.length);

            currentCategory = getQueryParam('category');
            filterPropertiesByCategory(currentCategory); // Apply initial category filter
        } catch (error) {
            console.error('Error fetching properties data:', error);
            if (propertiesContainer) {
                propertiesContainer.innerHTML = '<p class="error-message">Failed to load properties. Please try again later.</p>';
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
        loadMoreBtn.addEventListener('click', loadMoreProperties);
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
    fetchProperties();
});