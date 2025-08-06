/*
 * autogiant-motors-product-details.js
 * This file handles the dynamic loading and display of a single car's
 * detailed information on the autogiant-motors-product-details.html page.
 */

document.addEventListener('DOMContentLoaded', function() {
    const carDetailsContainer = document.getElementById('car-details-container');
    const loadingMessage = carDetailsContainer ? carDetailsContainer.querySelector('.loading-message') : null;
    const carNotFoundMessage = document.getElementById('car-not-found');

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

    // Calculator elements (Currency Converter only for cars)
    const currencyConverterCard = document.getElementById('currency-converter');
    const amountToConvertInput = document.getElementById('amount-to-convert');
    const targetCurrencySelect = document.getElementById('target-currency');
    const convertCurrencyBtn = document.getElementById('convert-currency-btn');
    const convertedAmountSpan = document.getElementById('converted-amount');

    let currentCarPrice = 0; // Store the price of the currently displayed car

    // Hardcoded exchange rates (for demonstration, in a real app these would come from an API)
    const KES_TO_USD_RATE = 1 / 135.0; // 1 KES is approx 1/135 USD
    const USD_TO_EUR_RATE = 0.92;     // 1 USD is approx 0.92 EUR
    const USD_TO_GBP_RATE = 0.79;     // 1 USD is approx 0.79 GBP

    // Function to get query parameters from URL
    function getQueryParam(param) {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get(param);
    }

    // Function to update meta tags for SEO and social sharing
    function updateMetaTags(car) {
        const defaultTitle = "AutoGiant Motors - Car Details";
        const defaultDescription = "Detailed information about a car listed on AutoGiant Motors. View photos, features, pricing, and contact agent details.";
        const defaultImage = "images/shop-autogiant-motors.webp";
        const defaultKeywords = "car details Kenya, used car for sale, new car listing, AutoGiant Motors";

        const title = car ? `${car.make} ${car.model} ${car.year} - AutoGiant Motors` : defaultTitle;
        const description = car ? `Check out this ${car.year} ${car.make} ${car.model} for sale in Kenya. Engine: ${car.engine_type}, Color: ${car.color}.` : defaultDescription;
        const imageUrl = car && car.car_display_image ? car.car_display_image : defaultImage;
        const keywords = car ? `${car.make}, ${car.model}, ${car.year}, ${car.engine_type}, ${car.color}, ${car.features.join(', ')}, ${defaultKeywords}` : defaultKeywords;
        
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

    // Function to render car details
    function renderCarDetails(car) {
        if (!carDetailsContainer) return;

        console.log("Car object received for rendering:", car); // Diagnostic log

        carDetailsContainer.innerHTML = ''; // Clear loading message

        // Update meta tags for SEO
        updateMetaTags(car);

        // Store current car price for calculators
        currentCarPrice = car.price;

        // Combine all image arrays
        const allImages = [...(car.images || []), ...(car.interior_images || [])];

        // Main Image Gallery
        const mainImageHtml = `
            <div class="car-image-gallery">
                <div class="main-image-display">
                    <img id="main-car-image" src="${allImages[0] || `https://placehold.co/800x600/FF5722/FFFFFF?text=No+Image`}" alt="${car.make} ${car.model}" onerror="this.onerror=null;this.src='https://placehold.co/800x600/FF5722/FFFFFF?text=Image+Error';">
                </div>
                <div class="thumbnail-images-container">
                    ${allImages.map((img, index) => `
                        <img class="thumbnail-image ${index === 0 ? 'active' : ''}" src="${img}" alt="${car.make} ${car.model} thumbnail ${index + 1}" data-src="${img}" onerror="this.onerror=null;this.src='https://placehold.co/100x75/FF5722/FFFFFF?text=No+Image';" loading="lazy">
                    `).join('')}
                </div>
            </div>
        `;

        // Key Details
        let keyDetailsHtml = `
            <div class="car-key-details">
                <h1 class="car-title">${car.make} ${car.model} (${car.year})</h1>
                <p class="car-price">KSh ${car.price.toLocaleString()}</p>
                <div class="car-meta-info">
        `;
        if (car.color) keyDetailsHtml += `<span class="meta-item"><i class="fas fa-palette"></i> ${car.color}</span>`;
        if (car.engine_type) keyDetailsHtml += `<span class="meta-item"><i class="fas fa-engine"></i> ${car.engine_type}</span>`;
        if (car.number_of_doors) keyDetailsHtml += `<span class="meta-item"><i class="fas fa-door-closed"></i> ${car.number_of_doors} Doors</span>`;
        if (car.seating_capacity) keyDetailsHtml += `<span class="meta-item"><i class="fas fa-users"></i> ${car.seating_capacity} Seats</span>`;
        if (car.imported !== undefined) keyDetailsHtml += `<span class="meta-item"><i class="fas fa-globe"></i> ${car.imported ? 'Imported' : 'Local'}</span>`;
        if (car.vat_included) keyDetailsHtml += `<span class="meta-item"><i class="fas fa-percent"></i> VAT Included</span>`;
        keyDetailsHtml += `
                </div>
                ${car.shipping_fee > 0 ? `<p class="car-shipping-fee"><i class="fas fa-truck"></i> Shipping Fee: KSh ${car.shipping_fee.toLocaleString()}</p>` : ''}
                ${car.waiting_period_days > 0 ? `<p class="car-waiting-period"><i class="fas fa-hourglass-half"></i> Waiting Period: ${car.waiting_period_days} days</p>` : ''}
            </div>
        `;

        // Fuel Efficiency
        const fuelEfficiencyHtml = `
            <div class="car-fuel-efficiency">
                <h2>Fuel Efficiency</h2>
                <ul>
                    <li><i class="fas fa-city"></i> City: ${car.fuel_efficiency.city_km_per_liter} km/L</li>
                    <li><i class="fas fa-road"></i> Highway: ${car.fuel_efficiency.highway_km_per_liter} km/L</li>
                </ul>
            </div>
        `;

        // Features
        const featuresHtml = `
            <div class="car-features-list">
                <h2>Key Features</h2>
                <ul>
                    ${car.features.map(feature => `<li><i class="fas fa-check-circle"></i> ${feature}</li>`).join('')}
                </ul>
            </div>
        `;

        // Agent Info
        const agentInfoHtml = `
            <div class="car-agent-info">
                <h2>Contact Agent</h2>
                <p><strong>${car.contact_agent.name}</strong></p>
                <p><i class="fas fa-map-marker-alt"></i> ${car.contact_agent.location}</p>
                <p><i class="fas fa-phone"></i> <a href="tel:${car.contact_agent.tel}">${car.contact_agent.tel}</a></p>
                <button class="btn btn-primary contact-agent-btn" 
                        data-car-make="${encodeURIComponent(car.make)}"
                        data-car-model="${encodeURIComponent(car.model)}"
                        data-car-year="${car.year}"
                        data-agent-name="${encodeURIComponent(car.contact_agent.name)}"
                        data-agent-phone="${encodeURIComponent(car.contact_agent.tel)}">
                    Inquire Now
                </button>
            </div>
        `;

        // Assemble the content
        carDetailsContainer.innerHTML = `
            ${mainImageHtml}
            <div class="car-info-column">
                ${keyDetailsHtml}
                ${fuelEfficiencyHtml}
                ${featuresHtml}
                ${agentInfoHtml}
            </div>
        `;

        // Add event listeners for image gallery
        setupImageGallery();

        // Setup currency converter
        setupCurrencyConverter();

        // Add event listener for "Inquire Now" button
        const inquireBtn = carDetailsContainer.querySelector('.contact-agent-btn');
        if (inquireBtn) {
            inquireBtn.addEventListener('click', function() {
                const carMake = this.dataset.carMake;
                const carModel = this.dataset.carModel;
                const carYear = this.dataset.carYear;
                const agentName = this.dataset.agentName;
                const agentPhone = this.dataset.agentPhone;

                // Construct URL for the contact agent form
                const contactUrl = `autogiant-motors-contact-agent.html?` +
                                   `carMake=${carMake}&` +
                                   `carModel=${carModel}&` +
                                   `carYear=${carYear}&` +
                                   `agentName=${agentName}&` +
                                   `agentPhone=${agentPhone}`;
                
                window.location.href = contactUrl; // Redirect to the contact form page
            });
        }
    }

    // Image Gallery Functionality
    function setupImageGallery() {
        const mainImage = document.getElementById('main-car-image');
        const thumbnails = document.querySelectorAll('.thumbnail-image');

        if (mainImage && thumbnails.length > 0) {
            thumbnails.forEach(thumbnail => {
                thumbnail.addEventListener('click', function() {
                    // Remove active class from all thumbnails
                    thumbnails.forEach(t => t.classList.remove('active'));
                    // Set clicked thumbnail as active
                    this.classList.add('active');
                    // Update main image source
                    mainImage.src = this.dataset.src;
                });
            });
        }
    }

    // --- Currency Converter Function ---
    function setupCurrencyConverter() {
        if (amountToConvertInput && convertedAmountSpan) {
            amountToConvertInput.value = currentCarPrice; // Pre-fill with car price
            convertCurrency(); // Initial conversion
            convertCurrencyBtn.addEventListener('click', convertCurrency);
            amountToConvertInput.addEventListener('input', convertCurrency);
            targetCurrencySelect.addEventListener('change', convertCurrency);
        }
    }

    function convertCurrency() {
        const amountKES = parseFloat(amountToConvertInput.value);
        const targetCurrency = targetCurrencySelect.value;
        let convertedAmount = 0;
        let currencySymbol = '';

        if (isNaN(amountKES) || amountKES < 0) {
            convertedAmountSpan.textContent = 'Invalid Amount';
            return;
        }

        switch (targetCurrency) {
            case 'USD':
                convertedAmount = amountKES * KES_TO_USD_RATE;
                currencySymbol = '$';
                break;
            case 'EUR':
                convertedAmount = amountKES * KES_TO_USD_RATE * USD_TO_EUR_RATE;
                currencySymbol = '€';
                break;
            case 'GBP':
                convertedAmount = amountKES * KES_TO_USD_RATE * USD_TO_GBP_RATE;
                currencySymbol = '£';
                break;
            default:
                convertedAmount = amountKES;
                currencySymbol = 'KSh';
                break;
        }

        convertedAmountSpan.textContent = `${currencySymbol} ${convertedAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }
    // --- End Currency Converter Function ---

    // Fetch car data
    async function fetchCarDetails() {
        const carMake = getQueryParam('make');
        const carModel = getQueryParam('model');
        const carYear = parseInt(getQueryParam('year')); // Ensure year is a number

        if (!carMake || !carModel || isNaN(carYear)) {
            if (loadingMessage) loadingMessage.style.display = 'none';
            if (carNotFoundMessage) carNotFoundMessage.style.display = 'block';
            updateMetaTags(null); // Update with default values
            return;
        }

        if (loadingMessage) {
            loadingMessage.style.display = 'block';
        }

        try {
            const response = await fetch('data/cars.json');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const cars = await response.json();
            // Find the car using make, model, and year for uniqueness
            const car = cars.find(c => 
                c.make === carMake && 
                c.model === carModel && 
                c.year === carYear
            );

            if (car) {
                renderCarDetails(car);
            } else {
                if (loadingMessage) loadingMessage.style.display = 'none';
                if (carNotFoundMessage) carNotFoundMessage.style.display = 'block';
                updateMetaTags(null); // Update with default values
            }
        } catch (error) {
            console.error('Error fetching car details:', error);
            if (loadingMessage) loadingMessage.style.display = 'none';
            if (carNotFoundMessage) carNotFoundMessage.style.display = 'block';
            carNotFoundMessage.innerHTML = `<h2>Error Loading Car</h2><p>There was an issue loading the car details. Please try again later.</p><a href="autogiant-motors-index.html" class="btn btn-primary">Browse All Vehicles</a>`;
            updateMetaTags(null); // Update with default values
        } finally {
            if (loadingMessage) {
                loadingMessage.style.display = 'none';
            }
        }
    }

    // Initial fetch and render when the DOM is fully loaded
    fetchCarDetails();
});