/*
 * soko-properties-product-details.js
 * This file handles the dynamic loading and display of a single property's
 * detailed information on the soko-properties-product-details.html page,
 * including calculators and reviews.
 */

document.addEventListener('DOMContentLoaded', function() {
    const propertyDetailsContainer = document.getElementById('property-details-container');
    const loadingMessage = propertyDetailsContainer ? propertyDetailsContainer.querySelector('.loading-message') : null;
    const propertyNotFoundMessage = document.getElementById('property-not-found');

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

    // Calculator elements
    const currencyConverterCard = document.getElementById('currency-converter');
    const amountToConvertInput = document.getElementById('amount-to-convert');
    const targetCurrencySelect = document.getElementById('target-currency');
    const convertCurrencyBtn = document.getElementById('convert-currency-btn');
    const convertedAmountSpan = document.getElementById('converted-amount');

    const installmentsCalculatorCard = document.getElementById('installments-calculator');
    const loanAmountInput = document.getElementById('loan-amount');
    const downPaymentInput = document.getElementById('down-payment');
    const interestRateInput = document.getElementById('interest-rate');
    const loanTermInput = document.getElementById('loan-term');
    const calculateInstallmentsBtn = document.getElementById('calculate-installments-btn');
    const monthlyPaymentSpan = document.getElementById('monthly-payment');
    const negotiableMessage = document.getElementById('negotiable-message');

    let currentPropertyPrice = 0; // Store the price of the currently displayed property

    // Hardcoded exchange rates (for demonstration, in a real app these would come from an API)
    const KES_TO_USD_RATE = 1 / 135.0; // 1 KES is approx 1/135 USD
    const USD_TO_EUR_RATE = 0.92;     // 1 USD is approx 0.92 EUR
    const USD_TO_GBP_RATE = 0.79;     // 1 USD is approx 0.79 GBP

    // Function to get query parameter from URL
    function getQueryParam(param) {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get(param);
    }

    // Function to update meta tags for SEO and social sharing
    function updateMetaTags(property) {
        const defaultTitle = "Soko Properties - Property Details";
        const defaultDescription = "Detailed information about a property listed on Soko Properties. View photos, features, pricing, and contact agent details.";
        const defaultImage = "images/shop-soko-properties.webp";
        const defaultKeywords = "property details Kenya, house for sale, apartment for rent, land for sale, real estate listing, Soko Properties";

        const title = property ? `${property.title} - Soko Properties` : defaultTitle;
        const description = property ? property.description.substring(0, 150) + '...' : defaultDescription; // Truncate description
        const imageUrl = property && property.images && property.images.length > 0 ? property.images[0] : defaultImage;
        const keywords = property ? `${property.title}, ${property.location.city}, ${property.propertyType}, ${property.features.join(', ')}, ${defaultKeywords}` : defaultKeywords;
        
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

    // Function to render property details
    function renderPropertyDetails(property) {
        if (!propertyDetailsContainer) return;

        console.log("Property object received for rendering:", property); // Diagnostic log
        console.log("Reviews array:", property.reviews); // Diagnostic log
        console.log("Number of reviews:", property.reviews ? property.reviews.length : 0); // Diagnostic log

        propertyDetailsContainer.innerHTML = ''; // Clear loading message

        // Update meta tags for SEO
        updateMetaTags(property);

        // Store current property price for calculators
        currentPropertyPrice = property.price.amount;

        // Main Image Gallery
        const allImages = [...(property.images || []), ...(property.interiorImages || [])]; // Combine all image arrays
        const mainImageHtml = `
            <div class="property-image-gallery">
                <div class="main-image-display">
                    <img id="main-property-image" src="${allImages[0] || `https://placehold.co/800x600/4CAF50/FFFFFF?text=No+Image`}" alt="${property.title}" onerror="this.onerror=null;this.src='https://placehold.co/800x600/4CAF50/FFFFFF?text=Image+Error';">
                </div>
                <div class="thumbnail-images-container">
                    ${allImages.map((img, index) => `
                        <img class="thumbnail-image ${index === 0 ? 'active' : ''}" src="${img}" alt="${property.title} thumbnail ${index + 1}" data-src="${img}" onerror="this.onerror=null;this.src='https://placehold.co/100x75/4CAF50/FFFFFF?text=No+Image';" loading="lazy">
                    `).join('')}
                </div>
            </div>
        `;

        // Key Details
        let keyDetailsHtml = `
            <div class="property-key-details">
                <h1 class="property-title">${property.title}</h1>
                <p class="property-price">KSh ${property.price.amount.toLocaleString()}</p>
                <p class="property-location"><i class="fas fa-map-marker-alt"></i> ${property.location.address}, ${property.location.city}, ${property.location.county}</p>
                <div class="property-meta-info">
        `;
        if (property.propertyType) keyDetailsHtml += `<span class="meta-item"><i class="fas fa-tag"></i> ${property.propertyType}</span>`;
        if (property.bedrooms !== undefined) keyDetailsHtml += `<span class="meta-item"><i class="fas fa-bed"></i> ${property.bedrooms} Bed${property.bedrooms !== 1 ? 's' : ''}</span>`;
        if (property.bathrooms !== undefined) keyDetailsHtml += `<span class="meta-item"><i class="fas fa-bath"></i> ${property.bathrooms} Bath${property.bathrooms !== 1 ? 's' : ''}</span>`;
        if (property.area && property.area.size) keyDetailsHtml += `<span class="meta-item"><i class="fas fa-ruler-combined"></i> ${property.area.size} ${property.area.unit}</span>`;
        else if (property.plotSize && property.plotSize.size) keyDetailsHtml += `<span class="meta-item"><i class="fas fa-ruler-combined"></i> ${property.plotSize.size} ${property.plotSize.unit} Plot</span>`;
        if (property.yearBuilt) keyDetailsHtml += `<span class="meta-item"><i class="fas fa-calendar-alt"></i> Built: ${property.yearBuilt}</span>`;
        keyDetailsHtml += `
                    <span class="meta-item"><i class="fas fa-eye"></i> ${property.views ? property.views.toLocaleString() : '0'} views</span>
                </div>
                ${property.isDiscounted ? `<p class="discount-badge"><i class="fas fa-percentage"></i> ${property.discountPercentage || ''}% Discount!</p>` : ''}
            </div>
        `;

        // Description
        const descriptionHtml = `
            <div class="property-description">
                <h2>Description</h2>
                <p>${property.description}</p>
            </div>
        `;

        // Features
        const featuresHtml = `
            <div class="property-features-list">
                <h2>Features</h2>
                <ul>
                    ${property.features.map(feature => `<li><i class="fas fa-check-circle"></i> ${feature}</li>`).join('')}
                </ul>
            </div>
        `;

        // Agent Info
        const agentInfoHtml = `
            <div class="property-agent-info">
                <h2>Contact Agent</h2>
                <p><strong>${property.agentInfo.name}</strong></p>
                <p><i class="fas fa-user"></i> ${property.agentInfo.contactPerson}</p>
                <p><i class="fas fa-phone"></i> <a href="tel:${property.agentInfo.phone}">${property.agentInfo.phone}</a></p>
                <p><i class="fas fa-envelope"></i> <a href="mailto:${property.agentInfo.email}">${property.agentInfo.email}</a></p>
                <button class="btn btn-primary contact-agent-btn" 
                        data-property-id="${property.propertyId}"
                        data-property-title="${encodeURIComponent(property.title)}"
                        data-agent-name="${encodeURIComponent(property.agentInfo.contactPerson)}"
                        data-agent-email="${encodeURIComponent(property.agentInfo.email)}"
                        data-agent-phone="${encodeURIComponent(property.agentInfo.phone)}">
                    Inquire Now
                </button>
            </div>
        `;

        // Payment Modes
        const paymentModesHtml = `
            <div class="property-payment-modes">
                <h2>Allowed Payment Modes</h2>
                <ul>
                    ${property.allowedPaymentModes.map(mode => `<li><i class="fas fa-money-check-alt"></i> ${mode}</li>`).join('')}
                </ul>
            </div>
        `;

        // Reviews
        const reviewsHtml = `
            <div class="property-reviews">
                <h2>Reviews (${property.reviews ? property.reviews.length : 0})</h2>
                ${property.reviews && property.reviews.length > 0 ? 
                    property.reviews.map(review => `
                        <div class="review-item">
                            <p class="reviewer-name"><strong>${review.reviewerName}</strong> - 
                                <span class="review-rating">${'★'.repeat(review.rating)}${'☆'.repeat(5 - review.rating)}</span>
                            </p>
                            <p class="review-comment">${review.comment}</p>
                            <p class="review-date">${new Date(review.date).toLocaleDateString()}</p>
                        </div>
                    `).join('')
                    : '<p>No reviews yet. Be the first to leave a review!</p>'
                }
                <button class="btn btn-secondary write-review-btn">Write a Review</button>
            </div>
        `;

        // Assemble the content
        propertyDetailsContainer.innerHTML = `
            ${mainImageHtml}
            <div class="property-info-column">
                ${keyDetailsHtml}
                ${descriptionHtml}
                ${featuresHtml}
                ${agentInfoHtml}
                ${paymentModesHtml}
                ${reviewsHtml}
            </div>
        `;

        // Setup image gallery after rendering HTML
        setupImageGallery();

        // Setup calculators after rendering HTML and getting property price
        setupCalculators(property);

        // Add event listener for "Inquire Now" button
        const inquireBtn = propertyDetailsContainer.querySelector('.contact-agent-btn');
        if (inquireBtn) {
            inquireBtn.addEventListener('click', function() {
                const propId = this.dataset.propertyId;
                const propTitle = this.dataset.propertyTitle;
                const agentName = this.dataset.agentName;
                const agentEmail = this.dataset.agentEmail;
                const agentPhone = this.dataset.agentPhone;

                // Construct URL for the contact agent form
                const contactUrl = `soko-properties-contact-agent.html?` +
                                   `propertyId=${propId}&` +
                                   `propertyTitle=${propTitle}&` +
                                   `agentName=${agentName}&` +
                                   `agentEmail=${agentEmail}&` +
                                   `agentPhone=${agentPhone}`;
                
                window.location.href = contactUrl; // Redirect to the contact form page
            });
        }
        // Add event listener for "Write a Review" button
        const writeReviewBtn = propertyDetailsContainer.querySelector('.write-review-btn');
        if (writeReviewBtn) {
            writeReviewBtn.addEventListener('click', () => {
                // Replace alert with a console log or a custom modal
                console.log(`User wants to write a review for: ${property.title}`);
                // You can implement a custom modal here if you wish
                // showCustomModal('Review Feature', 'The review submission feature is coming soon!');
            });
        }
    }

    // Image Gallery Functionality
    function setupImageGallery() {
        const mainImage = document.getElementById('main-property-image');
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

    // --- Calculator Functions ---
    function setupCalculators(property) {
        // Currency Converter
        if (amountToConvertInput && convertedAmountSpan) {
            amountToConvertInput.value = currentPropertyPrice; // Pre-fill with property price
            convertCurrency(); // Initial conversion
            convertCurrencyBtn.addEventListener('click', convertCurrency);
            amountToConvertInput.addEventListener('input', convertCurrency);
            targetCurrencySelect.addEventListener('change', convertCurrency);
        }

        // Installments Calculator
        const hasInstallmentsOption = property.allowedPaymentModes.some(mode => 
            mode.includes("Installments")
        );

        if (installmentsCalculatorCard) {
            if (hasInstallmentsOption) {
                installmentsCalculatorCard.style.display = 'block';
                loanAmountInput.value = currentPropertyPrice; // Pre-fill loan amount
                calculateInstallments(); // Initial calculation
                calculateInstallmentsBtn.addEventListener('click', calculateInstallments);
                downPaymentInput.addEventListener('input', calculateInstallments);
                interestRateInput.addEventListener('input', calculateInstallments);
                loanTermInput.addEventListener('input', calculateInstallments);

                // Check if "Installments (negotiable)" specifically
                const isNegotiable = property.allowedPaymentModes.includes("Installments (negotiable)");
                if (negotiableMessage) {
                    negotiableMessage.style.display = isNegotiable ? 'block' : 'none';
                }

            } else {
                installmentsCalculatorCard.style.display = 'none'; // Hide if not allowed
            }
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

    function calculateInstallments() {
        let principal = parseFloat(loanAmountInput.value);
        let downPayment = parseFloat(downPaymentInput.value);
        let annualInterestRate = parseFloat(interestRateInput.value);
        let loanTermYears = parseFloat(loanTermInput.value);

        // Validate inputs
        if (isNaN(principal) || principal <= 0) {
            monthlyPaymentSpan.textContent = 'Invalid Property Price';
            return;
        }
        if (isNaN(downPayment) || downPayment < 0) {
            monthlyPaymentSpan.textContent = 'Invalid Down Payment';
            return;
        }
        if (downPayment > principal) {
            monthlyPaymentSpan.textContent = 'Down Payment cannot exceed Loan Amount';
            return;
        }
        if (isNaN(annualInterestRate) || annualInterestRate < 0) {
            monthlyPaymentSpan.textContent = 'Invalid Interest Rate';
            return;
        }
        if (isNaN(loanTermYears) || loanTermYears <= 0) {
            monthlyPaymentSpan.textContent = 'Invalid Loan Term';
            return;
        }

        const loanAmount = principal - downPayment;

        if (loanAmount <= 0) {
            monthlyPaymentSpan.textContent = 'KSh 0 (Paid in Full)';
            return;
        }

        const monthlyInterestRate = (annualInterestRate / 100) / 12;
        const numberOfPayments = loanTermYears * 12;

        let monthlyPayment;
        if (monthlyInterestRate === 0) {
            monthlyPayment = loanAmount / numberOfPayments; // Simple division if no interest
        } else {
            monthlyPayment = loanAmount * (monthlyInterestRate * Math.pow(1 + monthlyInterestRate, numberOfPayments)) / 
                             (Math.pow(1 + monthlyInterestRate, numberOfPayments) - 1);
        }

        monthlyPaymentSpan.textContent = `KSh ${monthlyPayment.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }
    // --- End Calculator Functions ---

    // Fetch property data
    async function fetchPropertyDetails() {
        const propertyId = getQueryParam('id');

        if (!propertyId) {
            if (loadingMessage) loadingMessage.style.display = 'none';
            if (propertyNotFoundMessage) propertyNotFoundMessage.style.display = 'block';
            updateMetaTags(null); // Update with default values
            return;
        }

        if (loadingMessage) {
            loadingMessage.style.display = 'block';
        }

        try {
            const response = await fetch('data/properties.json');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const properties = await response.json();
            const property = properties.find(p => p.propertyId === propertyId);

            if (property) {
                renderPropertyDetails(property);
            } else {
                if (loadingMessage) loadingMessage.style.display = 'none';
                if (propertyNotFoundMessage) propertyNotFoundMessage.style.display = 'block';
                updateMetaTags(null); // Update with default values
            }
        } catch (error) {
            console.error('Error fetching property details:', error);
            if (loadingMessage) loadingMessage.style.display = 'none';
            if (propertyNotFoundMessage) propertyNotFoundMessage.style.display = 'block';
            propertyNotFoundMessage.innerHTML = `<h2>Error Loading Property</h2><p>There was an issue loading the property details. Please try again later.</p><a href="soko-properties-index.html" class="btn btn-primary">Browse All Properties</a>`;
            updateMetaTags(null); // Update with default values
        } finally {
            if (loadingMessage) {
                loadingMessage.style.display = 'none';
            }
        }
    }

    // Initial fetch and render when the DOM is fully loaded
    fetchPropertyDetails();
});