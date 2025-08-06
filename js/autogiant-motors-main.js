/*
 * autogiant-motors-main.js
 * This file handles the dynamic loading, filtering, and display of cars
 * for the AutoGiant Motors shop page (autogiant-motors-index.html).
 */

document.addEventListener('DOMContentLoaded', function() {
    const carsContainer = document.getElementById('cars-container');
    const loadingMessage = carsContainer ? carsContainer.querySelector('.loading-message') : null;
    const noResultsMessage = document.getElementById('no-results-message');
    const loadMoreBtn = document.getElementById('load-more-btn');
    const scrollToTopBtn = document.getElementById('scroll-to-top-btn');

    // Subheader elements
    const carSearchInput = document.getElementById('car-search-input');
    const carSearchBtn = document.getElementById('car-search-btn');
    const carSearchSuggestions = document.getElementById('car-search-suggestions');
    const makeFilter = document.getElementById('make-filter');
    const modelFilter = document.getElementById('model-filter');
    const yearFilter = document.getElementById('year-filter');
    const priceRangeFilter = document.getElementById('price-range-filter');
    const engineTypeFilter = document.getElementById('engine-type-filter');
    const importedFilter = document.getElementById('imported-filter');
    const applyFiltersBtn = document.getElementById('apply-filters-btn');
    const clearFiltersBtn = document.getElementById('clear-filters-btn');

    let allCars = []; // Stores the original, unfiltered list of cars
    let filteredAndSortedCars = []; // Stores cars after filters and sort are applied
    let carsPerPage = 15;
    let currentPage = 0;

    // Function to render car cards
    function renderCarCards(carsToRender) {
        if (!carsContainer) return;

        carsToRender.forEach(car => {
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
            carsContainer.appendChild(carCard);
        });
    }

    // Function to display cars for the current page
    function displayCars() {
        if (!carsContainer) return;

        const startIndex = currentPage * carsPerPage;
        const endIndex = startIndex + carsPerPage;
        const carsToShow = filteredAndSortedCars.slice(startIndex, endIndex);

        if (currentPage === 0) { // Clear only for the first page load/filter application
            carsContainer.innerHTML = '';
        }
        
        renderCarCards(carsToShow);

        // Manage Load More button visibility
        if (loadMoreBtn) {
            if (endIndex < filteredAndSortedCars.length) {
                loadMoreBtn.style.display = 'block';
            } else {
                loadMoreBtn.style.display = 'none'; // No more cars to load
            }
        }

        // Show/hide no results message
        if (noResultsMessage) {
            if (filteredAndSortedCars.length === 0) {
                noResultsMessage.style.display = 'block';
            } else {
                noResultsMessage.style.display = 'none';
            }
        }
    }

    // Function to load more cars
    function loadMoreCars() {
        currentPage++;
        displayCars();
    }

    // Function to populate filter dropdowns (Make, Model, Year)
    function populateFilterDropdowns() {
        const makes = new Set();
        const years = new Set();
        
        allCars.forEach(car => {
            makes.add(car.make);
            years.add(car.year);
        });

        // Populate Make filter
        makeFilter.innerHTML = '<option value="">All Makes</option>';
        Array.from(makes).sort().forEach(make => {
            const option = document.createElement('option');
            option.value = make;
            option.textContent = make;
            makeFilter.appendChild(option);
        });

        // Populate Year filter
        yearFilter.innerHTML = '<option value="">Any Year</option>';
        Array.from(years).sort((a, b) => b - a).forEach(year => { // Sort years descending
            const option = document.createElement('option');
            option.value = year;
            option.textContent = year;
            yearFilter.appendChild(option);
        });

        // Add event listener to make filter to update model filter
        makeFilter.addEventListener('change', updateModelFilter);
    }

    // Function to update Model filter based on selected Make
    function updateModelFilter() {
        const selectedMake = makeFilter.value;
        modelFilter.innerHTML = '<option value="">All Models</option>';

        if (selectedMake) {
            const models = new Set();
            allCars.filter(car => car.make === selectedMake).forEach(car => {
                models.add(car.model);
            });
            Array.from(models).sort().forEach(model => {
                const option = document.createElement('option');
                option.value = model;
                option.textContent = model;
                modelFilter.appendChild(option);
            });
        }
    }

    // Function to apply filters and sorting
    function applyFiltersAndSort() {
        let currentFiltered = [...allCars]; // Start with a fresh copy of all original cars

        // 1. Apply Search Filter
        const searchTerm = carSearchInput.value.toLowerCase().trim();
        if (searchTerm) {
            currentFiltered = currentFiltered.filter(car => 
                car.make.toLowerCase().includes(searchTerm) ||
                car.model.toLowerCase().includes(searchTerm) ||
                car.engine_type.toLowerCase().includes(searchTerm) ||
                car.color.toLowerCase().includes(searchTerm) ||
                car.features.some(feature => feature.toLowerCase().includes(searchTerm)) ||
                car.contact_agent.location.toLowerCase().includes(searchTerm)
            );
        }

        // 2. Apply Make Filter
        const selectedMake = makeFilter.value;
        if (selectedMake) {
            currentFiltered = currentFiltered.filter(car => car.make === selectedMake);
        }

        // 3. Apply Model Filter
        const selectedModel = modelFilter.value;
        if (selectedModel) {
            currentFiltered = currentFiltered.filter(car => car.model === selectedModel);
        }

        // 4. Apply Year Filter
        const selectedYear = yearFilter.value;
        if (selectedYear) {
            currentFiltered = currentFiltered.filter(car => car.year === parseInt(selectedYear));
        }

        // 5. Apply Price Range Filter
        const selectedPriceRange = priceRangeFilter.value;
        if (selectedPriceRange) {
            const [minStr, maxStr] = selectedPriceRange.split('-');
            const minPrice = parseInt(minStr);
            const maxPrice = maxStr === 'max' ? Infinity : parseInt(maxStr);

            currentFiltered = currentFiltered.filter(car => {
                const price = car.price;
                return price >= minPrice && price <= maxPrice;
            });
        }

        // 6. Apply Engine Type Filter
        const selectedEngineType = engineTypeFilter.value;
        if (selectedEngineType) {
            currentFiltered = currentFiltered.filter(car => car.engine_type.toLowerCase().includes(selectedEngineType.toLowerCase()));
        }

        // 7. Apply Imported Filter
        const selectedImported = importedFilter.value;
        if (selectedImported !== '') { // Only filter if a specific option is chosen
            currentFiltered = currentFiltered.filter(car => car.imported === (selectedImported === 'true'));
        }

        // Default sort: By Year (descending)
        currentFiltered.sort((a, b) => b.year - a.year);

        filteredAndSortedCars = currentFiltered; // Update the global filtered list
        currentPage = 0; // Reset to first page when filters/sort change
        displayCars(); // Re-render from the beginning
    }

    // Function to clear all filters and reset to default view
    function clearFilters() {
        carSearchInput.value = '';
        makeFilter.value = '';
        modelFilter.value = ''; // Reset model filter too
        yearFilter.value = '';
        priceRangeFilter.value = '';
        engineTypeFilter.value = '';
        importedFilter.value = '';
        updateModelFilter(); // Clear models based on cleared make
        applyFiltersAndSort(); // Re-apply with cleared filters
        carSearchSuggestions.innerHTML = ''; // Clear suggestions
    }

    // Debounce for search suggestions
    let searchSuggestionDebounceTimer;
    function populateCarSearchSuggestions(query) {
        clearTimeout(searchSuggestionDebounceTimer);
        carSearchSuggestions.innerHTML = ''; // Clear previous suggestions
        if (query.length < 2) {
            return;
        }

        searchSuggestionDebounceTimer = setTimeout(() => {
            const lowerCaseQuery = query.toLowerCase();
            const filteredSuggestions = allCars.filter(car =>
                car.make.toLowerCase().includes(lowerCaseQuery) ||
                car.model.toLowerCase().includes(lowerCaseQuery) ||
                car.engine_type.toLowerCase().includes(lowerCaseQuery) ||
                car.features.some(feature => feature.toLowerCase().includes(lowerCaseQuery))
            ).slice(0, 10); // Limit to top 10 suggestions

            if (filteredSuggestions.length > 0) {
                filteredSuggestions.forEach(item => {
                    const suggestionItem = document.createElement('a');
                    suggestionItem.href = '#'; // Handled by JS
                    suggestionItem.classList.add('suggestion-item');
                    // Store data attributes for redirection
                    suggestionItem.dataset.make = item.make;
                    suggestionItem.dataset.model = item.model;
                    suggestionItem.dataset.year = item.year;
                    suggestionItem.dataset.category = item.engine_type; // Example for category link
                    suggestionItem.innerHTML = `<strong>${item.make} ${item.model}</strong> <span class="suggestion-meta">(${item.year}, ${item.engine_type})</span>`;
                    carSearchSuggestions.appendChild(suggestionItem);
                });
                // Add click listener to suggestions
                carSearchSuggestions.querySelectorAll('.suggestion-item').forEach(item => {
                    item.addEventListener('click', handleCarSuggestionClick);
                });
            } else {
                const noResults = document.createElement('div');
                noResults.classList.add('no-suggestions');
                noResults.textContent = 'No suggestions found.';
                carSearchSuggestions.appendChild(noResults);
            }
        }, 300); // Debounce for 300ms
    }

    function handleCarSuggestionClick(event) {
        event.preventDefault(); // Prevent default link navigation
        const clickedElement = event.target.closest('.suggestion-item');
        if (!clickedElement) return;

        const make = clickedElement.dataset.make;
        const model = clickedElement.dataset.model;
        const year = clickedElement.dataset.year;
        const category = clickedElement.dataset.category; // For potential category link

        carSearchInput.value = `${make} ${model} ${year}`; // Autofill search bar
        carSearchSuggestions.innerHTML = ''; // Clear suggestions

        // Determine where to navigate: specific product details or category page
        if (make && model && year) {
            window.location.href = `autogiant-motors-product-details.html?make=${encodeURIComponent(make)}&model=${encodeURIComponent(model)}&year=${year}`;
        } else if (category) {
            window.location.href = `autogiant-motors-categories.html?category=${encodeURIComponent(category)}`;
        } else {
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

    // Fetch cars data
    async function fetchCars() {
        if (loadingMessage) {
            loadingMessage.style.display = 'block';
        }
        try {
            const response = await fetch('data/cars.json');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            allCars = await response.json(); // Store original data
            console.log('Cars loaded:', allCars.length);
            populateFilterDropdowns(); // Populate filters after loading data
            applyFiltersAndSort(); // Initial render with no filters/default sort
        } catch (error) {
            console.error('Error fetching cars data:', error);
            if (carsContainer) {
                carsContainer.innerHTML = '<p class="error-message">Failed to load vehicles. Please try again later.</p>';
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
        loadMoreBtn.addEventListener('click', loadMoreCars);
    }
    if (scrollToTopBtn) {
        scrollToTopBtn.addEventListener('click', scrollToTop);
    }

    // Search input for suggestions
    if (carSearchInput) {
        carSearchInput.addEventListener('input', function() {
            populateCarSearchSuggestions(this.value.trim());
        });
        // Clear suggestions when clicking outside the search area
        document.addEventListener('click', function(event) {
            if (!carSearchInput.parentElement.contains(event.target) && !carSearchSuggestions.contains(event.target)) {
                carSearchSuggestions.innerHTML = '';
            }
        });
    }

    // Listen for Enter key on search input (also triggers applyFiltersAndSort)
    if (carSearchInput) {
        carSearchInput.addEventListener('keypress', function(event) {
            if (event.key === 'Enter') {
                applyFiltersAndSort();
                carSearchSuggestions.innerHTML = ''; // Clear suggestions on Enter
            }
        });
    }
    // Listen for click on search button (also triggers applyFiltersAndSort)
    if (carSearchBtn) {
        carSearchBtn.addEventListener('click', function() {
            applyFiltersAndSort();
            carSearchSuggestions.innerHTML = ''; // Clear suggestions on search button click
        });
    }

    // Listen for filter changes to re-apply filters (optional, but good for user experience)
    if (makeFilter) makeFilter.addEventListener('change', applyFiltersAndSort);
    if (modelFilter) modelFilter.addEventListener('change', applyFiltersAndSort);
    if (yearFilter) yearFilter.addEventListener('change', applyFiltersAndSort);
    if (priceRangeFilter) priceRangeFilter.addEventListener('change', applyFiltersAndSort);
    if (engineTypeFilter) engineTypeFilter.addEventListener('change', applyFiltersAndSort);
    if (importedFilter) importedFilter.addEventListener('change', applyFiltersAndSort);


    // Listen for scroll events for the scroll-to-top button
    window.addEventListener('scroll', toggleScrollToTopButton);

    // Initial fetch and render when the DOM is fully loaded
    fetchCars();
});