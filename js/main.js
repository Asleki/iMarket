/*
 * main.js
 * This file contains the core JavaScript functionalities for the iMarket website,
 * including theme toggling, search bar interactions, hero slider,
 * and dynamic content loading from JSON data.
 */

document.addEventListener('DOMContentLoaded', function() {

    // =========================================
    // 1. Footer Dynamic Dates
    // =========================================
    const copyrightYearSpan = document.getElementById('copyright-year');
    if (copyrightYearSpan) {
        copyrightYearSpan.textContent = new Date().getFullYear();
    }

    const lastModifiedSpan = document.getElementById('last-modified');
    if (lastModifiedSpan) {
        lastModifiedSpan.textContent = document.lastModified;
    }

    // =========================================
    // 2. Mode Toggle (Light/Dark)
    // =========================================
    const modeToggleBtn = document.getElementById('mode-toggle');
    const htmlElement = document.documentElement; // Target the <html> element for dark mode class

    // Function to set the theme
    function setTheme(theme) {
        if (theme === 'dark') {
            htmlElement.classList.add('dark-mode');
            modeToggleBtn.querySelector('i').classList.remove('fa-moon');
            modeToggleBtn.querySelector('i').classList.add('fa-sun');
            modeToggleBtn.setAttribute('aria-label', 'Toggle Light Mode');
        } else {
            htmlElement.classList.remove('dark-mode');
            modeToggleBtn.querySelector('i').classList.remove('fa-sun');
            modeToggleBtn.querySelector('i').classList.add('fa-moon');
            modeToggleBtn.setAttribute('aria-label', 'Toggle Dark Mode');
        }
        localStorage.setItem('imarket-theme', theme); // Save preference
    }

    // Initialize theme on load
    const savedTheme = localStorage.getItem('imarket-theme') || 'light'; // Default to light
    setTheme(savedTheme);

    // Event listener for mode toggle button
    if (modeToggleBtn) {
        modeToggleBtn.addEventListener('click', function() {
            const currentTheme = htmlElement.classList.contains('dark-mode') ? 'dark' : 'light';
            setTheme(currentTheme === 'light' ? 'dark' : 'light');
        });
    }

    // =========================================
    // 3. Hamburger Menu Toggle (for small screens)
    // =========================================
    const hamburgerMenuBtn = document.querySelector('.hamburger-menu');
    const navLinks = document.querySelector('.nav-links');
    const bodyElement = document.body; // To add 'nav-open' class for CSS control

    if (hamburgerMenuBtn && navLinks) {
        hamburgerMenuBtn.addEventListener('click', function() {
            bodyElement.classList.toggle('nav-open'); // Toggles class on body for responsive nav
            this.setAttribute('aria-expanded', bodyElement.classList.contains('nav-open'));
        });

        // Close nav when a link is clicked (optional, for single-page navigation or after selection)
        navLinks.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                // Only close if it's not a dropdown toggle
                if (!link.classList.contains('dropdown-toggle')) {
                    bodyElement.classList.remove('nav-open');
                    hamburgerMenuBtn.setAttribute('aria-expanded', 'false');
                }
            });
        });

        // Handle dropdowns for mobile (click to toggle, not hover)
        navLinks.querySelectorAll('.nav-item.has-dropdown > .dropdown-toggle').forEach(dropdownToggle => {
            dropdownToggle.addEventListener('click', function(event) {
                // Prevent default link behavior if it's just a toggle
                if (window.innerWidth <= 768) { // Apply only on small screens
                    event.preventDefault();
                    const parentItem = this.closest('.nav-item');
                    parentItem.classList.toggle('dropdown-open'); // Add a class to show/hide dropdown
                    this.setAttribute('aria-expanded', parentItem.classList.contains('dropdown-open'));
                    // Close other open dropdowns
                    navLinks.querySelectorAll('.nav-item.has-dropdown.dropdown-open').forEach(otherDropdown => {
                        if (otherDropdown !== parentItem) {
                            otherDropdown.classList.remove('dropdown-open');
                            otherDropdown.querySelector('.dropdown-toggle').setAttribute('aria-expanded', 'false');
                        }
                    });
                }
            });
        });
    }

    // =========================================
    // 4. Search Bar Functionality
    // =========================================
    const searchToggleBtn = document.getElementById('search-toggle');
    const searchInputContainer = document.getElementById('search-bar');
    const searchInput = searchInputContainer ? searchInputContainer.querySelector('input[type="search"]') : null;
    const searchSubmitBtn = searchInputContainer ? searchInputContainer.querySelector('.search-submit') : null;

    // Create suggestion box and append it
    const searchSuggestions = document.createElement('div');
    searchSuggestions.id = 'search-suggestions';
    searchSuggestions.classList.add('suggestions-box');
    if (searchInputContainer) {
        searchInputContainer.appendChild(searchSuggestions);
    }

    // Create clear and mic icons dynamically
    const clearSearchBtn = document.createElement('button');
    clearSearchBtn.classList.add('search-clear', 'utility-icon');
    clearSearchBtn.innerHTML = '<i class="fas fa-times"></i>';
    clearSearchBtn.setAttribute('aria-label', 'Clear search input');
    clearSearchBtn.style.display = 'none'; // Hidden by default

    const micSearchBtn = document.createElement('button');
    micSearchBtn.classList.add('search-mic', 'utility-icon');
    micSearchBtn.innerHTML = '<i class="fas fa-microphone"></i>';
    micSearchBtn.setAttribute('aria-label', 'Voice search');
    micSearchBtn.style.display = 'none'; // Hidden by default

    if (searchInput) {
        // Insert mic button before input, clear button before submit button
        searchInputContainer.insertBefore(micSearchBtn, searchInput); 
        searchInputContainer.insertBefore(clearSearchBtn, searchSubmitBtn); 
    }


    if (searchToggleBtn && searchInputContainer && searchInput && searchSubmitBtn) {
        searchToggleBtn.addEventListener('click', function() {
            searchInputContainer.classList.toggle('active');
            if (searchInputContainer.classList.contains('active')) {
                searchInput.focus(); // Focus on input when active
                // Show mic icon if input is empty, otherwise show clear
                if (searchInput.value.trim().length === 0) {
                    micSearchBtn.style.display = 'block';
                    clearSearchBtn.style.display = 'none';
                } else {
                    micSearchBtn.style.display = 'none';
                    clearSearchBtn.style.display = 'block';
                }
            } else {
                searchInput.value = ''; // Clear input when closing
                searchSuggestions.innerHTML = ''; // Clear suggestions
                clearSearchBtn.style.display = 'none';
                micSearchBtn.style.display = 'none';
                searchSubmitBtn.disabled = true; // Disable search button
            }
        });

        // Enable/disable search button and show/hide icons based on input
        searchInput.addEventListener('input', function() {
            const hasInput = this.value.trim().length > 0;
            searchSubmitBtn.disabled = !hasInput;
            clearSearchBtn.style.display = hasInput ? 'block' : 'none';
            micSearchBtn.style.display = hasInput ? 'none' : 'block'; // Show mic only when no input

            // Populate suggestions (simple example)
            populateSearchSuggestions(this.value.trim());
        });

        // Clear search input
        clearSearchBtn.addEventListener('click', function() {
            searchInput.value = '';
            searchInput.focus();
            searchSubmitBtn.disabled = true;
            searchSuggestions.innerHTML = '';
            clearSearchBtn.style.display = 'none';
            micSearchBtn.style.display = 'block';
        });

        // Voice search (placeholder)
        micSearchBtn.addEventListener('click', function() {
            alert('Voice search feature coming soon!');
            // In a real application, you would integrate Web Speech API here
        });

        // Perform search (on button click or Enter key)
        searchSubmitBtn.addEventListener('click', performSearch);
        searchInput.addEventListener('keypress', function(event) {
            if (event.key === 'Enter' && !searchSubmitBtn.disabled) {
                performSearch();
            }
        });

        function performSearch() {
            const query = searchInput.value.trim();
            if (query) {
                // Redirect to a search results page
                window.location.href = `search.html?q=${encodeURIComponent(query)}`;
            }
        }

        // Close suggestions when clicking outside
        document.addEventListener('click', function(event) {
            if (!searchInputContainer.contains(event.target) && !searchToggleBtn.contains(event.target)) {
                searchSuggestions.innerHTML = ''; // Clear suggestions
            }
        });
    }

    // =========================================
    // 5. Data Fetching and Search Suggestions Logic
    // =========================================
    let allProducts = []; // To store combined data from all JSONs

    const jsonFiles = [
        'data/cars.json',
        'data/clicknget-products.json',
        'data/office-products.json',
        'data/properties.json'
    ];

    async function fetchAllProducts() {
        try {
            const responses = await Promise.all(jsonFiles.map(file => fetch(file)));
            const data = await Promise.all(responses.map(res => {
                if (!res.ok) {
                    throw new Error(`HTTP error! status: ${res.status} from ${res.url}`);
                }
                return res.json();
            }));

            // Process and combine data from different JSON structures
            data.forEach((items, index) => {
                if (index === 0) { // cars.json (from AutoGiant Motors)
                    items.forEach(car => {
                        allProducts.push({
                            type: 'car',
                            id: `${car.make}-${car.model}-${car.year}`, // Unique ID for cars
                            name: `${car.make} ${car.model} ${car.year}`,
                            category: 'Vehicles',
                            shop: 'AutoGiant Motors',
                            image: car.car_display_image, // Use display image for card
                            price: car.price,
                            keywords: [car.make, car.model, car.color, ...car.features, car.engine_type, car.contact_agent.location].join(' ').toLowerCase(),
                            link: `autogiant-motors-product-details.html?make=${encodeURIComponent(car.make)}&model=${encodeURIComponent(car.model)}&year=${car.year}`
                        });
                    });
                } else if (index === 1) { // clicknget-products.json (from Click 'n Get)
                    items.forEach(product => {
                        allProducts.push({
                            type: 'clicknget-product',
                            id: product.id,
                            name: product.name,
                            category: product.category,
                            shop: 'Click \'n Get',
                            image: product.images[0], // Use first image for card
                            price: product.price,
                            keywords: [product.name, product.category, product.subCategory, product.brand, ...product.features, product.color].join(' ').toLowerCase(),
                            link: `click-n-get-product-details.html?id=${encodeURIComponent(product.id)}`
                        });
                    });
                } else if (index === 2) { // office-products.json (from OfficeTech Solutions)
                    items.forEach(officeItem => {
                        allProducts.push({
                            type: 'office-product',
                            id: officeItem.item_id,
                            name: officeItem.name,
                            category: officeItem.category,
                            shop: 'OfficeTech Solutions',
                            // Placeholder image as office-products.json doesn't have image URLs
                            image: `https://placehold.co/300x200/A0A0A0/FFFFFF?text=${encodeURIComponent(officeItem.name.substring(0,15))}`,
                            price: officeItem.price_ksh,
                            keywords: [officeItem.name, officeItem.category, ...officeItem.features].join(' ').toLowerCase(),
                            link: `officetech-solutions-product-details.html?id=${encodeURIComponent(officeItem.item_id)}`
                        });
                    });
                } else if (index === 3) { // properties.json (from Soko Properties)
                    items.forEach(property => {
                        allProducts.push({
                            type: 'property',
                            id: property.propertyId,
                            name: property.title,
                            category: 'Properties',
                            shop: 'Soko Properties',
                            image: property.images[0], // Use first image for card
                            price: property.price.amount,
                            keywords: [property.title, property.location.city, property.location.county, property.propertyType, ...property.features].join(' ').toLowerCase(),
                            link: `soko-properties-product-details.html?id=${encodeURIComponent(property.propertyId)}`
                        });
                    });
                }
            });
            console.log('All products loaded:', allProducts.length);
            // After all products are loaded, render the popular products
            renderPopularProducts();
        } catch (error) {
            console.error('Error fetching product data:', error);
        }
    }

    // Debounce function for search input
    let debounceTimer;
    function populateSearchSuggestions(query) {
        clearTimeout(debounceTimer);
        searchSuggestions.innerHTML = ''; // Clear previous suggestions
        if (query.length < 2) { // Only show suggestions for 2+ characters
            return;
        }

        debounceTimer = setTimeout(() => {
            const lowerCaseQuery = query.toLowerCase();
            const filteredSuggestions = allProducts.filter(product =>
                product.name.toLowerCase().includes(lowerCaseQuery) ||
                product.keywords.includes(lowerCaseQuery)
            ).slice(0, 7); // Limit to top 7 suggestions

            if (filteredSuggestions.length > 0) {
                filteredSuggestions.forEach(item => {
                    const suggestionItem = document.createElement('a');
                    suggestionItem.href = item.link;
                    suggestionItem.classList.add('suggestion-item');
                    // Display product name and its shop/category
                    suggestionItem.innerHTML = `<strong>${item.name}</strong> <span class="suggestion-meta">(${item.shop || item.category})</span>`;
                    searchSuggestions.appendChild(suggestionItem);
                });
            } else {
                const noResults = document.createElement('div');
                noResults.classList.add('no-suggestions');
                noResults.textContent = 'No suggestions found.';
                searchSuggestions.appendChild(noResults);
            }
        }, 300); // Debounce for 300ms
    }

    // =========================================
    // 7. Render Popular Products on Homepage
    // =========================================
    const dynamicProductsSection = document.querySelector('.dynamic-products');
    const popularProductsContainer = document.createElement('div');
    popularProductsContainer.classList.add('product-grid'); // Use product-grid for styling

    if (dynamicProductsSection) {
        dynamicProductsSection.appendChild(popularProductsContainer);
    }

    function renderPopularProducts() {
        if (!popularProductsContainer) return;

        popularProductsContainer.innerHTML = ''; // Clear existing content

        // Simple logic: Take a few random products or the first few from the combined list
        // For a real scenario, you'd have a 'popular' flag in your JSON or a more complex algorithm.
        const productsToDisplay = allProducts.slice(0, 8); // Display first 8 products as popular

        if (productsToDisplay.length > 0) {
            productsToDisplay.forEach(product => {
                const productCard = document.createElement('a'); // Make the whole card clickable
                productCard.href = product.link;
                productCard.classList.add('product-card');

                // Fallback image for products without one (e.g., office-products)
                const imageUrl = product.image || `https://placehold.co/300x200/A0A0A0/FFFFFF?text=No+Image`;

                productCard.innerHTML = `
                    <img src="${imageUrl}" alt="${product.name}" onerror="this.onerror=null;this.src='https://placehold.co/300x200/A0A0A0/FFFFFF?text=Image+Error';" loading="lazy">
                    <div class="product-info">
                        <h3>${product.name}</h3>
                        <p class="product-shop">${product.shop}</p>
                        <p class="product-price">KSh ${product.price.toLocaleString()}</p>
                    </div>
                `;
                popularProductsContainer.appendChild(productCard);
            });
        } else {
            popularProductsContainer.innerHTML = '<p>No popular products to display at the moment.</p>';
        }
    }

    // Fetch products when the page loads
    // This call is now responsible for initiating rendering of popular products as well
    fetchAllProducts();

    // =========================================
    // 8. Hero Slider
    // =========================================
    // This section assumes you will add the hero-slider HTML structure to your index.html
    // For example:
    /*
    <section class="hero-slider">
        <div class="slides-container">
            <div class="slide active">
                <img src="images/hero-slide-1.webp" alt="Slide 1">
                <div class="slide-content">
                    <h2>Discover the Latest Electronics</h2>
                    <p>Cutting-edge gadgets for your home and office.</p>
                    <a href="electronics.html" class="btn btn-primary">Shop Now</a>
                </div>
            </div>
            <div class="slide">
                <img src="images/hero-slide-2.webp" alt="Slide 2">
                <div class="slide-content">
                    <h2>Find Your Dream Property</h2>
                    <p>Homes, apartments, and plots available now.</p>
                    <a href="soko-properties-index.html" class="btn btn-primary">Explore Properties</a>
                </div>
            </div>
            <div class="slide">
                <img src="images/hero-slide-3.webp" alt="Slide 3">
                <div class="slide-content">
                    <h2>Upgrade Your Ride</h2>
                    <p>Quality vehicles from trusted dealers.</p>
                    <a href="autogiant-motors-index.html" class="btn btn-primary">View Cars</a>
                </div>
            </div>
        </div>
        <button class="slider-prev" aria-label="Previous Slide"><i class="fas fa-chevron-left"></i></button>
        <button class="slider-next" aria-label="Next Slide"><i class="fas fa-chevron-right"></i></button>
        <div class="slider-dots"></div>
    </section>
    */
    // You will need to add this HTML structure to your index.html for the slider to work.

    const slides = document.querySelectorAll('.hero-slider .slide');
    const sliderDotsContainer = document.querySelector('.slider-dots');
    const sliderPrevBtn = document.querySelector('.slider-prev');
    const sliderNextBtn = document.querySelector('.slider-next');
    let currentSlide = 0;
    let slideInterval;

    function showSlide(index) {
        slides.forEach((slide, i) => {
            slide.classList.remove('active');
            if (i === index) {
                slide.classList.add('active');
            }
        });
        if (sliderDotsContainer) { // Check if dots container exists
            updateDots(index);
        }
    }

    function nextSlide() {
        currentSlide = (currentSlide + 1) % slides.length;
        showSlide(currentSlide);
    }

    function prevSlide() {
        currentSlide = (currentSlide - 1 + slides.length) % slides.length;
        showSlide(currentSlide);
    }

    function createDots() {
        if (!sliderDotsContainer) return; // Exit if no dots container
        sliderDotsContainer.innerHTML = ''; // Clear existing dots
        slides.forEach((_, i) => {
            const dot = document.createElement('span');
            dot.classList.add('dot');
            if (i === 0) dot.classList.add('active');
            dot.addEventListener('click', () => {
                clearInterval(slideInterval);
                currentSlide = i;
                showSlide(currentSlide);
                startSlider();
            });
            sliderDotsContainer.appendChild(dot);
        });
    }

    function updateDots(index) {
        document.querySelectorAll('.slider-dots .dot').forEach((dot, i) => {
            dot.classList.toggle('active', i === index);
        });
    }

    function startSlider() {
        slideInterval = setInterval(nextSlide, 5000); // Change slide every 5 seconds
    }

    if (slides.length > 0 && sliderDotsContainer && sliderPrevBtn && sliderNextBtn) {
        createDots();
        showSlide(currentSlide);
        startSlider();

        sliderPrevBtn.addEventListener('click', () => {
            clearInterval(slideInterval);
            prevSlide();
            startSlider();
        });

        sliderNextBtn.addEventListener('click', () => {
            clearInterval(slideInterval);
            nextSlide();
            startSlider();
        });
    }
});