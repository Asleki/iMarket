/*
 * soko-properties-main.js
 * This file handles the dynamic loading, filtering, and display of properties
 * for the Soko Properties shop page (soko-properties-index.html).
 */

document.addEventListener('DOMContentLoaded', function() {
    const propertiesContainer = document.getElementById('properties-container');
    const loadingMessage = propertiesContainer ? propertiesContainer.querySelector('.loading-message') : null;
    const noResultsMessage = document.getElementById('no-results-message');
    const loadMoreBtn = document.getElementById('load-more-btn');
    const scrollToTopBtn = document.getElementById('scroll-to-top-btn');

    // Subheader elements
    const propertySearchInput = document.getElementById('property-search-input');
    const propertySearchBtn = document.getElementById('property-search-btn');
    const propertySearchSuggestions = document.getElementById('property-search-suggestions'); // New
    const propertyTypeFilter = document.getElementById('property-type-filter');
    const bedroomsFilter = document.getElementById('bedrooms-filter');
    const bathroomsFilter = document.getElementById('bathrooms-filter');
    const priceRangeFilter = document.getElementById('price-range-filter');
    const sortByFilter = document.getElementById('sort-by-filter');
    const applyFiltersBtn = document.getElementById('apply-filters-btn');
    const clearFiltersBtn = document.getElementById('clear-filters-btn');

    let allProperties = []; // Stores the original, unfiltered list of properties
    let filteredAndSortedProperties = []; // Stores properties after filters and sort are applied
    let propertiesPerPage = 15;
    let currentPage = 0;

    // Function to render property cards
    function renderPropertyCards(propertiesToRender) {
        if (!propertiesContainer) return;

        // Append new cards rather than clearing all for "Load More"
        propertiesToRender.forEach(property => {
            const propertyCard = document.createElement('a'); // Make the whole card clickable
            propertyCard.href = `soko-properties-product-details.html?id=${encodeURIComponent(property.propertyId)}`;
            propertyCard.classList.add('product-card', 'property-card');

            const imageUrl = property.images && property.images.length > 0 
                             ? property.images[0] 
                             : `https://placehold.co/300x200/4CAF50/FFFFFF?text=Property`;

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

        // Determine which properties to display for the current page
        const startIndex = currentPage * propertiesPerPage;
        const endIndex = startIndex + propertiesPerPage;
        const propertiesToShow = filteredAndSortedProperties.slice(startIndex, endIndex);

        if (currentPage === 0) { // Clear only for the first page load/filter application
            propertiesContainer.innerHTML = '';
        }
        
        renderPropertyCards(propertiesToShow);

        // Manage Load More button visibility
        if (loadMoreBtn) {
            if (endIndex < filteredAndSortedProperties.length) {
                loadMoreBtn.style.display = 'block';
            } else {
                loadMoreBtn.style.display = 'none'; // No more properties to load
            }
        }

        // Show/hide no results message
        if (noResultsMessage) {
            if (filteredAndSortedProperties.length === 0) {
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

    // Function to apply filters and sorting
    function applyFiltersAndSort() {
        let currentFiltered = [...allProperties]; // Start with a fresh copy of all original properties

        // 1. Apply Search Filter
        const searchTerm = propertySearchInput.value.toLowerCase().trim();
        if (searchTerm) {
            currentFiltered = currentFiltered.filter(property => 
                property.title.toLowerCase().includes(searchTerm) ||
                property.description.toLowerCase().includes(searchTerm) ||
                property.location.city.toLowerCase().includes(searchTerm) ||
                property.location.county.toLowerCase().includes(searchTerm) ||
                property.propertyType.toLowerCase().includes(searchTerm) ||
                property.features.some(feature => feature.toLowerCase().includes(searchTerm))
            );
        }

        // 2. Apply Type Filter
        const selectedType = propertyTypeFilter.value;
        if (selectedType) {
            currentFiltered = currentFiltered.filter(property => property.propertyType === selectedType);
        }

        // 3. Apply Bedrooms Filter
        const selectedBedrooms = bedroomsFilter.value;
        if (selectedBedrooms) {
            if (selectedBedrooms === '5') { // "5+" option
                currentFiltered = currentFiltered.filter(property => property.bedrooms >= 5);
            } else if (selectedBedrooms === '0') { // "Studio" option (0 bedrooms)
                currentFiltered = currentFiltered.filter(property => property.bedrooms === 0);
            }
            else {
                currentFiltered = currentFiltered.filter(property => property.bedrooms === parseInt(selectedBedrooms));
            }
        }

        // 4. Apply Bathrooms Filter
        const selectedBathrooms = bathroomsFilter.value;
        if (selectedBathrooms) {
            if (selectedBathrooms === '4') { // "4+" option
                currentFiltered = currentFiltered.filter(property => property.bathrooms >= 4);
            } else {
                currentFiltered = currentFiltered.filter(property => property.bathrooms === parseFloat(selectedBathrooms));
            }
        }

        // 5. Apply Price Range Filter
        const selectedPriceRange = priceRangeFilter.value;
        if (selectedPriceRange) {
            const [minStr, maxStr] = selectedPriceRange.split('-');
            const minPrice = parseInt(minStr);
            const maxPrice = maxStr === 'max' ? Infinity : parseInt(maxStr);

            currentFiltered = currentFiltered.filter(property => {
                const price = property.price.amount;
                return price >= minPrice && price <= maxPrice;
            });
        }

        // 6. Apply Sorting
        const selectedSort = sortByFilter.value;
        switch (selectedSort) {
            case 'price-asc':
                currentFiltered.sort((a, b) => a.price.amount - b.price.amount);
                break;
            case 'price-desc':
                currentFiltered.sort((a, b) => b.price.amount - a.price.amount);
                break;
            case 'date-desc':
                currentFiltered.sort((a, b) => new Date(b.listingDate) - new Date(a.listingDate));
                break;
            case 'date-asc':
                currentFiltered.sort((a, b) => new Date(a.listingDate) - new Date(b.listingDate));
                break;
            case 'default':
            default:
                // For consistency, sort by propertyId if no specific sort is chosen
                currentFiltered.sort((a, b) => a.propertyId.localeCompare(b.propertyId));
                break;
        }

        filteredAndSortedProperties = currentFiltered; // Update the global filtered list
        currentPage = 0; // Reset to first page when filters/sort change
        displayProperties(); // Re-render from the beginning
    }

    // Function to clear all filters and reset to default view
    function clearFilters() {
        propertySearchInput.value = '';
        propertyTypeFilter.value = '';
        bedroomsFilter.value = '';
        bathroomsFilter.value = '';
        priceRangeFilter.value = '';
        sortByFilter.value = 'default';
        applyFiltersAndSort(); // Re-apply with cleared filters
        propertySearchSuggestions.innerHTML = ''; // Clear suggestions
    }

    // Debounce for search suggestions
    let searchSuggestionDebounceTimer;
    function populatePropertySearchSuggestions(query) {
        clearTimeout(searchSuggestionDebounceTimer);
        propertySearchSuggestions.innerHTML = ''; // Clear previous suggestions
        if (query.length < 2) {
            return;
        }

        searchSuggestionDebounceTimer = setTimeout(() => {
            const lowerCaseQuery = query.toLowerCase();
            const filteredSuggestions = allProperties.filter(property =>
                property.title.toLowerCase().includes(lowerCaseQuery) ||
                property.location.city.toLowerCase().includes(lowerCaseQuery) ||
                property.location.county.toLowerCase().includes(lowerCaseQuery) ||
                property.propertyType.toLowerCase().includes(lowerCaseQuery)
            ).slice(0, 10); // Limit to top 10 suggestions

            if (filteredSuggestions.length > 0) {
                filteredSuggestions.forEach(item => {
                    const suggestionItem = document.createElement('a');
                    suggestionItem.href = '#'; // Use # for now, will be handled by JS
                    suggestionItem.classList.add('suggestion-item');
                    suggestionItem.dataset.propertyId = item.propertyId; // Store ID for lookup
                    suggestionItem.dataset.propertyType = item.propertyType; // Store type for category link
                    suggestionItem.innerHTML = `<strong>${item.title}</strong> <span class="suggestion-meta">(${item.location.city}, ${item.propertyType})</span>`;
                    propertySearchSuggestions.appendChild(suggestionItem);
                });
                // Add click listener to suggestions
                propertySearchSuggestions.querySelectorAll('.suggestion-item').forEach(item => {
                    item.addEventListener('click', handlePropertySuggestionClick);
                });
            } else {
                const noResults = document.createElement('div');
                noResults.classList.add('no-suggestions');
                noResults.textContent = 'No suggestions found.';
                propertySearchSuggestions.appendChild(noResults);
            }
        }, 300); // Debounce for 300ms
    }

    function handlePropertySuggestionClick(event) {
        event.preventDefault(); // Prevent default link navigation
        const clickedElement = event.target.closest('.suggestion-item');
        if (!clickedElement) return;

        const propertyId = clickedElement.dataset.propertyId;
        const propertyType = clickedElement.dataset.propertyType;
        const propertyTitle = clickedElement.querySelector('strong').textContent;

        propertySearchInput.value = propertyTitle; // Autofill search bar
        propertySearchSuggestions.innerHTML = ''; // Clear suggestions

        // Determine where to navigate: specific property details or category page
        // If a specific property ID is available, go to its details page
        if (propertyId) {
            window.location.href = `soko-properties-product-details.html?id=${encodeURIComponent(propertyId)}`;
        } 
        // Otherwise, if a property type is available, go to the category page for that type
        else if (propertyType) {
            window.location.href = `soko-properties-categories.html?category=${encodeURIComponent(propertyType)}`;
        }
        // Fallback if neither specific property nor type is found
        else {
            applyFiltersAndSort(); // Just apply current search as a filter
        }
    }

    // Scroll to Top functionality
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
            applyFiltersAndSort(); // Initial render with no filters/default sort
        } catch (error) {
            console.error('Error fetching properties data:', error);
            if (propertiesContainer) {
                propertiesContainer.innerHTML = '<p class="error-message">Failed to load properties. Please try again later.</p>';
            }
            if (noResultsMessage) noResultsMessage.style.display = 'none'; // Hide if error
        } finally {
            if (loadingMessage) {
                loadingMessage.style.display = 'none';
            }
        }
    }

    // Event Listeners for subheader controls
    if (applyFiltersBtn) {
        applyFiltersBtn.addEventListener('click', applyFiltersAndSort);
    }
    if (clearFiltersBtn) {
        clearFiltersBtn.addEventListener('click', clearFilters);
    }
    if (loadMoreBtn) {
        loadMoreBtn.addEventListener('click', loadMoreProperties);
    }
    if (scrollToTopBtn) {
        scrollToTopBtn.addEventListener('click', scrollToTop);
    }

    // Search input for suggestions
    if (propertySearchInput) {
        propertySearchInput.addEventListener('input', function() {
            populatePropertySearchSuggestions(this.value.trim());
        });
        // Clear suggestions when clicking outside the search area
        document.addEventListener('click', function(event) {
            if (!propertySearchInput.parentElement.contains(event.target) && !propertySearchSuggestions.contains(event.target)) {
                propertySearchSuggestions.innerHTML = '';
            }
        });
    }

    // Listen for Enter key on search input (also triggers applyFiltersAndSort)
    if (propertySearchInput) {
        propertySearchInput.addEventListener('keypress', function(event) {
            if (event.key === 'Enter') {
                applyFiltersAndSort();
                propertySearchSuggestions.innerHTML = ''; // Clear suggestions on Enter
            }
        });
    }
    // Listen for click on search button (also triggers applyFiltersAndSort)
    if (propertySearchBtn) {
        propertySearchBtn.addEventListener('click', function() {
            applyFiltersAndSort();
            propertySearchSuggestions.innerHTML = ''; // Clear suggestions on search button click
        });
    }

    // Optional: Apply filters on change for dropdowns (less explicit, but faster feedback)
    // Removed for now to ensure "Apply Filters" button is the primary trigger for filters.
    // If you want instant filtering, uncomment these:
    /*
    if (propertyTypeFilter) propertyTypeFilter.addEventListener('change', applyFiltersAndSort);
    if (bedroomsFilter) bedroomsFilter.addEventListener('change', applyFiltersAndSort);
    if (bathroomsFilter) bathroomsFilter.addEventListener('change', applyFiltersAndSort);
    if (priceRangeFilter) priceRangeFilter.addEventListener('change', applyFiltersAndSort);
    if (sortByFilter) sortByFilter.addEventListener('change', applyFiltersAndSort);
    */

    // Listen for scroll events for the scroll-to-top button
    window.addEventListener('scroll', toggleScrollToTopButton);

    // Initial fetch and render when the DOM is fully loaded
    fetchProperties();
});