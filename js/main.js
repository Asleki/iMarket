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
    const hamburgerIcon = hamburgerMenuBtn ? hamburgerMenuBtn.querySelector('i') : null; // Get the icon element
    const navLinks = document.querySelector('.nav-links');
    const bodyElement = document.body; // To add 'nav-open' class for CSS control

    // Create a new overlay element
    const navOverlay = document.createElement('div');
    navOverlay.classList.add('nav-overlay');
    document.body.appendChild(navOverlay); // Append to body

    // Function to close the mobile navigation
    function closeMobileNav() {
        bodyElement.classList.remove('nav-open');
        if (hamburgerMenuBtn) {
            hamburgerMenuBtn.setAttribute('aria-expanded', 'false');
        }
        if (hamburgerIcon) {
            hamburgerIcon.classList.remove('fa-times');
            hamburgerIcon.classList.add('fa-bars');
        }
        // Close any open dropdowns within the mobile nav when main nav closes
        navLinks.querySelectorAll('.nav-item.has-dropdown.dropdown-open').forEach(openDropdown => {
            openDropdown.classList.remove('dropdown-open');
            openDropdown.querySelector('.dropdown-toggle').setAttribute('aria-expanded', 'false');
        });
    }

    if (hamburgerMenuBtn && navLinks && hamburgerIcon) {
        hamburgerMenuBtn.addEventListener('click', function() {
            if (bodyElement.classList.contains('nav-open')) {
                closeMobileNav(); // If open, close it
            } else {
                bodyElement.classList.add('nav-open'); // If closed, open it
                this.setAttribute('aria-expanded', 'true');
                hamburgerIcon.classList.remove('fa-bars');
                hamburgerIcon.classList.add('fa-times');
            }
        });

        // Close nav when a main link is clicked (but not a dropdown toggle)
        navLinks.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                if (!link.classList.contains('dropdown-toggle')) {
                    closeMobileNav();
                }
            });
        });

        // Close nav when overlay is clicked
        navOverlay.addEventListener('click', closeMobileNav);

        // Mobile dropdown toggle logic (accordion behavior)
        navLinks.querySelectorAll('.nav-item.has-dropdown > .dropdown-toggle').forEach(dropdownToggle => {
            dropdownToggle.addEventListener('click', function(event) {
                if (window.innerWidth <= 768) { // Only apply on small screens
                    event.preventDefault(); // Prevent default link behavior
                    const parentItem = this.closest('.nav-item');
                    parentItem.classList.toggle('dropdown-open'); // Toggle the dropdown
                    this.setAttribute('aria-expanded', parentItem.classList.contains('dropdown-open'));
                    
                    // Close other open dropdowns in mobile view
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

    const searchSuggestions = document.createElement('div');
    searchSuggestions.id = 'search-suggestions';
    searchSuggestions.classList.add('suggestions-box');
    if (searchInputContainer) {
        searchInputContainer.appendChild(searchSuggestions);
    }

    const clearSearchBtn = document.createElement('button');
    clearSearchBtn.classList.add('search-clear', 'utility-icon');
    clearSearchBtn.innerHTML = '<i class="fas fa-times"></i>';
    clearSearchBtn.setAttribute('aria-label', 'Clear search input');
    clearSearchBtn.style.display = 'none';

    const micSearchBtn = document.createElement('button');
    micSearchBtn.classList.add('search-mic', 'utility-icon');
    micSearchBtn.innerHTML = '<i class="fas fa-microphone"></i>';
    micSearchBtn.setAttribute('aria-label', 'Voice search');
    micSearchBtn.style.display = 'none';

    if (searchInput) {
        searchInputContainer.insertBefore(micSearchBtn, searchInput); 
        searchInputContainer.insertBefore(clearSearchBtn, searchSubmitBtn); 
    }

    if (searchToggleBtn && searchInputContainer && searchInput && searchSubmitBtn) {
        searchToggleBtn.addEventListener('click', function() {
            searchInputContainer.classList.toggle('active');
            if (searchInputContainer.classList.contains('active')) {
                searchInput.focus();
                if (searchInput.value.trim().length === 0) {
                    micSearchBtn.style.display = 'block';
                    clearSearchBtn.style.display = 'none';
                } else {
                    micSearchBtn.style.display = 'none';
                    clearSearchBtn.style.display = 'block';
                }
            } else {
                searchInput.value = '';
                searchSuggestions.innerHTML = '';
                clearSearchBtn.style.display = 'none';
                micSearchBtn.style.display = 'none';
                searchSubmitBtn.disabled = true;
            }
        });

        searchInput.addEventListener('input', function() {
            const hasInput = this.value.trim().length > 0;
            searchSubmitBtn.disabled = !hasInput;
            clearSearchBtn.style.display = hasInput ? 'block' : 'none';
            micSearchBtn.style.display = hasInput ? 'none' : 'block';

            populateSearchSuggestions(this.value.trim());
        });

        clearSearchBtn.addEventListener('click', function() {
            searchInput.value = '';
            searchInput.focus();
            searchSubmitBtn.disabled = true;
            searchSuggestions.innerHTML = '';
            clearSearchBtn.style.display = 'none';
            micSearchBtn.style.display = 'block';
        });

        micSearchBtn.addEventListener('click', function() {
            alert('Voice search feature coming soon!');
        });

        searchSubmitBtn.addEventListener('click', performSearch);
        searchInput.addEventListener('keypress', function(event) {
            if (event.key === 'Enter' && !searchSubmitBtn.disabled) {
                performSearch();
            }
        });

        function performSearch() {
            const query = searchInput.value.trim();
            if (query) {
                window.location.href = `search.html?q=${encodeURIComponent(query)}`;
            }
        }

        document.addEventListener('click', function(event) {
            if (!searchInputContainer.contains(event.target) && !searchToggleBtn.contains(event.target)) {
                searchSuggestions.innerHTML = '';
            }
        });
    }

    // =========================================
    // 5. Data Fetching and Product Processing
    // =========================================
    let allProducts = [];

    // Exchange rate
    const KSH_TO_USD_RATE = 135.0; // Example: 1 USD = 135 KSh

    // Define a mapping of main categories to their primary shop and a base category page
    const CATEGORY_SHOP_MAP = {
        'Electronics': { shop: 'Click \'n Get', page: 'click-n-get-categories.html?category=Electronics' },
        'Fashion': { shop: 'Click \'n Get', page: 'click-n-get-categories.html?category=Fashion' },
        'Home Goods': { shop: 'Click \'n Get', page: 'click-n-get-categories.html?category=HomeGoods' },
        'Office': { shop: 'OfficeTech Solutions', page: 'officetech-solutions-categories.html?category=Office' },
        'Vehicles': { shop: 'AutoGiant Motors', page: 'autogiant-motors-categories.html?category=Vehicles' },
        'Properties': { shop: 'Soko Properties', page: 'soko-properties-categories.html?category=Properties' }
    };

    // All possible main categories for the preference modal
    const ALL_MAIN_CATEGORIES = Object.keys(CATEGORY_SHOP_MAP);

    // All possible sub-categories 
    const ALL_SUB_CATEGORIES = [
        'Smartphones', 'Laptops', 'Televisions', 'Accessories', 'Gaming Peripherals', 'Audio',
        'Men\'s Clothing', 'Women\'s Clothing', 'Kids & Baby', 'Bags, Shoes & Accessories',
        'Major Appliances', 'Cookware & Dining', 'Home Decor', 'Furniture', 'Kitchen Appliances',
        'Computers', 'Printers', 'Scanners', 'Office Furniture', 'Office Supplies', 'Shredders', 'Telephones',
        'Cars', 'Motorcycles', 'Spare Parts', 'Heavy Machinery', 'Electric Cars',
        'Houses', 'Apartments', 'Land', 'Townhouse', 'Commercial' 
    ];

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

            data.forEach((items, index) => {
                if (index === 0) { // cars.json (from AutoGiant Motors)
                    items.forEach(car => {
                        allProducts.push({
                            type: 'car',
                            id: `${car.make}-${car.model}-${car.year}`,
                            name: `${car.make} ${car.model} ${car.year}`,
                            mainCategory: 'Vehicles',
                            subCategory: car.electric ? 'Electric Cars' : 'Cars',
                            shop: 'AutoGiant Motors',
                            image: car.car_display_image,
                            price: car.price, // Price is in KSh
                            currency: 'KSh',
                            rating: 4.5,
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
                            mainCategory: product.category === 'Electronics' || product.category === 'Gaming Peripherals' || product.category === 'Audio' ? 'Electronics' : (product.category === 'Apparel' ? 'Fashion' : 'Home Goods'),
                            subCategory: product.subCategory,
                            shop: 'Click \'n Get',
                            image: product.images[0],
                            price: product.price, 
                            currency: '$',
                            rating: product.rating,
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
                            mainCategory: 'Office',
                            subCategory: officeItem.category,
                            shop: 'OfficeTech Solutions',
                            image: `https://placehold.co/300x200/A0A0A0/FFFFFF?text=${encodeURIComponent(officeItem.name.substring(0, Math.min(officeItem.name.length, 15)))}`,
                            price: officeItem.price_ksh, // Price is in KSh
                            currency: 'KSh',
                            rating: officeItem.review_star_rate,
                            keywords: [officeItem.name, officeItem.category, ...officeItem.features].join(' ').toLowerCase(),
                            link: `officetech-solutions-product-details.html?id=${encodeURIComponent(officeItem.item_id)}`
                        });
                    });
                } else if (index === 3) { // properties.json (from Soko Properties)
                    items.forEach(property => {
                        const avgRating = property.reviews && property.reviews.length > 0
                            ? property.reviews.reduce((sum, r) => sum + r.rating, 0) / property.reviews.length
                            : 4.0;

                        allProducts.push({
                            type: 'property',
                            id: property.propertyId,
                            name: property.title,
                            mainCategory: 'Properties',
                            subCategory: property.propertyType,
                            shop: 'Soko Properties',
                            image: property.images[0],
                            price: property.price.amount, // Price is in KSh
                            currency: 'KSh',
                            rating: avgRating,
                            keywords: [property.title, property.location.city, property.location.county, property.propertyType, ...property.features].join(' ').toLowerCase(),
                            link: `soko-properties-product-details.html?id=${encodeURIComponent(property.propertyId)}`
                        });
                    });
                }
            });
            console.log('All products loaded:', allProducts.length);
            checkNewVisitorAndShowModal();
            renderHomepageProducts();
            updateExploreMoreButton();
        } catch (error) {
            console.error('Error fetching product data:', error);
        }
    }

    // Debounce function for search input
    let debounceTimer;
    function populateSearchSuggestions(query) {
        clearTimeout(debounceTimer);
        searchSuggestions.innerHTML = '';
        if (query.length < 2) {
            return;
        }

        debounceTimer = setTimeout(() => {
            const lowerCaseQuery = query.toLowerCase();
            const filteredSuggestions = allProducts.filter(product =>
                product.name.toLowerCase().includes(lowerCaseQuery) ||
                product.keywords.includes(lowerCaseQuery)
            ).slice(0, 7);

            if (filteredSuggestions.length > 0) {
                filteredSuggestions.forEach(item => {
                    const suggestionItem = document.createElement('a');
                    suggestionItem.href = item.link;
                    suggestionItem.classList.add('suggestion-item');
                    suggestionItem.innerHTML = `<strong>${item.name}</strong> <span class="suggestion-meta">(${item.shop || item.category})</span>`;
                    searchSuggestions.appendChild(suggestionItem);
                });
            } else {
                const noResults = document.createElement('div');
                noResults.classList.add('no-suggestions');
                noResults.textContent = 'No suggestions found.';
                searchSuggestions.appendChild(noResults);
            }
        }, 300);
    }

    // =========================================
    // 6. Generic Product Rendering Function
    // =========================================
    function renderProductCards(containerElement, productsArray) {
        if (!containerElement) return;

        containerElement.innerHTML = '';

        if (productsArray.length > 0) {
            productsArray.forEach(product => {
                const productCard = document.createElement('a');
                productCard.href = product.link;
                productCard.classList.add('product-card');

                const imageUrl = product.image || `https://placehold.co/300x200/A0A0A0/FFFFFF?text=No+Image`;

                let displayedPrice;
                if (product.currency === '$') {
                    displayedPrice = `$${product.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
                } else {
                    const priceInUsd = (product.price / KSH_TO_USD_RATE).toFixed(2);
                    displayedPrice = `$${parseFloat(priceInUsd).toLocaleString()}`;
                }

                productCard.innerHTML = `
                    <img src="${imageUrl}" alt="${product.name}" onerror="this.onerror=null;this.src='https://placehold.co/300x200/A0A0A0/FFFFFF?text=Image+Error';" loading="lazy">
                    <div class="product-info">
                        <h3>${product.name}</h3>
                        <p class="product-shop">${product.shop}</p>
                        <p class="product-price">${displayedPrice}</p>
                    </div>
                `;
                containerElement.appendChild(productCard);
            });
        } else {
            containerElement.innerHTML = '<p>No products to display at the moment.</p>';
        }
    }

    // =========================================
    // 7. Dynamic Homepage Product Rendering (Conditional Logic)
    // =========================================
    const dynamicProductsSection = document.querySelector('.dynamic-products');
    const popularProductsContainer = document.getElementById('popular-products-container');
    const dynamicProductsHeading = dynamicProductsSection ? dynamicProductsSection.querySelector('h2') : null;


    function renderHomepageProducts() {
        if (!popularProductsContainer || !dynamicProductsHeading) return;

        const userPreferences = JSON.parse(localStorage.getItem('imarket_user_preferences'));
        let productsToDisplay = [];

        if (userPreferences && userPreferences.mainCategories.length >= 5 && userPreferences.subCategories.length >= 5) {
            dynamicProductsHeading.textContent = 'Recommended for You';

            const filteredByPreferences = allProducts.filter(product => {
                const matchesMainCategory = userPreferences.mainCategories.includes(product.mainCategory);
                const matchesSubCategory = userPreferences.subCategories.includes(product.subCategory);
                return matchesMainCategory || matchesSubCategory;
            });

            const highlyRatedPreferred = filteredByPreferences.filter(p => p.rating >= 4.0);
            productsToDisplay = highlyRatedPreferred.sort(() => 0.5 - Math.random()).slice(0, 12);

            if (productsToDisplay.length < 12) {
                const remainingNeeded = 12 - productsToDisplay.length;
                const otherPreferred = filteredByPreferences.filter(p => !productsToDisplay.includes(p));
                productsToDisplay = productsToDisplay.concat(otherPreferred.sort(() => 0.5 - Math.random()).slice(0, remainingNeeded));
            }
            productsToDisplay.sort(() => 0.5 - Math.random());

        } else {
            dynamicProductsHeading.textContent = 'Featured Products from Click \'n Get';
            const clickNGetProducts = allProducts.filter(product => product.shop === 'Click \'n Get');
            productsToDisplay = clickNGetProducts.sort((a, b) => b.rating - a.rating || 0.5 - Math.random()).slice(0, 12);
        }
        
        renderProductCards(popularProductsContainer, productsToDisplay);
    }

    // =========================================
    // 8. User Preference Modal Logic
    // =========================================
    const preferenceModal = document.getElementById('preference-modal');
    const mainCategoriesCheckboxesDiv = document.getElementById('main-categories-checkboxes');
    const subCategoriesCheckboxesDiv = document.getElementById('sub-categories-checkboxes');
    const savePreferencesBtn = document.getElementById('save-preferences-btn');
    const mainCategoryFeedback = document.getElementById('main-category-feedback');
    const subCategoryFeedback = document.getElementById('sub-category-feedback');
    const exploreMoreBtn = document.getElementById('explore-more-btn');

    let selectedMainCategories = new Set();
    let selectedSubCategories = new Set();

    function checkNewVisitorAndShowModal() {
        const hasPreferences = localStorage.getItem('imarket_user_preferences');
        if (!hasPreferences || (JSON.parse(hasPreferences).mainCategories.length < 5 || JSON.parse(hasPreferences).subCategories.length < 5)) {
            displayPreferenceModal();
        }
    }

    function displayPreferenceModal() {
        if (!preferenceModal) return;
        populatePreferenceCheckboxes();
        preferenceModal.style.display = 'flex';
        bodyElement.classList.add('modal-open');
        savePreferencesBtn.disabled = true;
        updatePreferenceFeedback();
    }

    function hidePreferenceModal() {
        if (!preferenceModal) return;
        preferenceModal.style.display = 'none';
        bodyElement.classList.remove('modal-open');
    }

    function populatePreferenceCheckboxes() {
        selectedMainCategories.clear();
        selectedSubCategories.clear();

        const existingPreferences = JSON.parse(localStorage.getItem('imarket_user_preferences'));
        if (existingPreferences) {
            existingPreferences.mainCategories.forEach(cat => selectedMainCategories.add(cat));
            existingPreferences.subCategories.forEach(subCat => selectedSubCategories.add(subCat));
        }

        if (mainCategoriesCheckboxesDiv) {
            mainCategoriesCheckboxesDiv.innerHTML = '';
            ALL_MAIN_CATEGORIES.forEach(cat => {
                const label = document.createElement('label');
                const checkbox = document.createElement('input');
                checkbox.type = 'checkbox';
                checkbox.dataset.type = 'main-category';
                checkbox.value = cat;
                checkbox.checked = selectedMainCategories.has(cat);
                label.appendChild(checkbox);
                label.appendChild(document.createTextNode(` ${cat}`));
                mainCategoriesCheckboxesDiv.appendChild(label);
            });
        }

        if (subCategoriesCheckboxesDiv) {
            subCategoriesCheckboxesDiv.innerHTML = '';
            ALL_SUB_CATEGORIES.forEach(subCat => {
                const label = document.createElement('label');
                const checkbox = document.createElement('input');
                checkbox.type = 'checkbox';
                checkbox.dataset.type = 'sub-category';
                checkbox.value = subCat;
                checkbox.checked = selectedSubCategories.has(subCat);
                label.appendChild(checkbox);
                label.appendChild(document.createTextNode(` ${subCat}`));
                subCategoriesCheckboxesDiv.appendChild(label);
            });
        }

        document.querySelectorAll('#preference-modal input[type="checkbox"]').forEach(checkbox => {
            checkbox.addEventListener('change', handlePreferenceChange);
        });
    }

    function handlePreferenceChange(event) {
        const checkbox = event.target;
        const type = checkbox.dataset.type;
        const value = checkbox.value;

        if (type === 'main-category') {
            if (checkbox.checked) {
                selectedMainCategories.add(value);
            } else {
                selectedMainCategories.delete(value);
            }
        } else if (type === 'sub-category') {
            if (checkbox.checked) {
                selectedSubCategories.add(value);
            } else {
                selectedSubCategories.delete(value);
            }
        }
        updatePreferenceFeedback();
    }

    function updatePreferenceFeedback() {
        const mainCount = selectedMainCategories.size;
        const subCount = selectedSubCategories.size;

        if (mainCategoryFeedback) {
            mainCategoryFeedback.textContent = `Selected: ${mainCount}/5 (min)`;
            mainCategoryFeedback.style.color = mainCount >= 5 ? 'var(--color-success)' : 'var(--color-error)';
        }
        if (subCategoryFeedback) {
            subCategoryFeedback.textContent = `Selected: ${subCount}/5 (min)`;
            subCategoryFeedback.style.color = subCount >= 5 ? 'var(--color-success)' : 'var(--color-error)';
        }

        savePreferencesBtn.disabled = !(mainCount >= 5 && subCount >= 5);
    }

    if (savePreferencesBtn) {
        savePreferencesBtn.addEventListener('click', function() {
            if (selectedMainCategories.size >= 5 && selectedSubCategories.size >= 5) {
                const preferences = {
                    mainCategories: Array.from(selectedMainCategories),
                    subCategories: Array.from(selectedSubCategories)
                };
                localStorage.setItem('imarket_user_preferences', JSON.stringify(preferences));
                hidePreferenceModal();
                renderHomepageProducts();
                updateExploreMoreButton();
            } else {
                alert('Please select at least 5 main categories and 5 sub-categories.');
            }
        });
    }

    function updateExploreMoreButton() {
        if (!exploreMoreBtn) return;

        const userPreferences = JSON.parse(localStorage.getItem('imarket_user_preferences'));
        let targetLink = 'shops.html';

        if (userPreferences && userPreferences.mainCategories.length >= 5 && userPreferences.subCategories.length >= 5) {
            const randomCategory = userPreferences.mainCategories[Math.floor(Math.random() * userPreferences.mainCategories.length)];
            if (CATEGORY_SHOP_MAP[randomCategory]) {
                targetLink = CATEGORY_SHOP_MAP[randomCategory].page;
            }
        } else {
            targetLink = 'click-n-get-categories.html';
        }
        exploreMoreBtn.href = targetLink;
    }


    // =========================================
    // 9. Hero Slider
    // =========================================
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
        if (sliderDotsContainer) {
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
        if (!sliderDotsContainer) return;
        sliderDotsContainer.innerHTML = '';
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
        slideInterval = setInterval(nextSlide, 5000);
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

    // Initial fetch of all products when the DOM is ready
    fetchAllProducts();
});