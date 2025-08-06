/*
 * autogiant-motors-contact-agent.js
 * This file handles the dynamic population and submission of the contact agent form for AutoGiant Motors.
 */

document.addEventListener('DOMContentLoaded', function() {
    const formHeading = document.getElementById('form-heading');
    const formSubheading = document.getElementById('form-subheading');
    const carTitleDisplay = document.getElementById('car-title-display');
    const agentNameDisplay = document.getElementById('agent-name-display');
    const agentPhoneDisplay = document.getElementById('agent-phone-display');
    const agentPhoneLink = document.getElementById('agent-phone-link');
    const contactForm = document.getElementById('contact-form');
    const formResponseMessage = document.getElementById('form-response-message');
    const backLinkContainer = document.querySelector('.back-link-container');

    // Hidden fields
    const hiddenCarMake = document.getElementById('hidden-car-make');
    const hiddenCarModel = document.getElementById('hidden-car-model');
    const hiddenCarYear = document.getElementById('hidden-car-year');
    const hiddenAgentName = document.getElementById('hidden-agent-name');
    const hiddenAgentPhone = document.getElementById('hidden-agent-phone');

    // Function to get query parameter from URL
    function getQueryParam(param) {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get(param);
    }

    // Get parameters from URL
    const carMake = decodeURIComponent(getQueryParam('carMake') || '');
    const carModel = decodeURIComponent(getQueryParam('carModel') || '');
    const carYear = decodeURIComponent(getQueryParam('carYear') || '');
    const agentName = decodeURIComponent(getQueryParam('agentName') || 'the agent');
    const agentPhone = decodeURIComponent(getQueryParam('agentPhone') || '');

    // Construct full car title for display
    const carTitle = `${carMake} ${carModel} (${carYear})`;

    // Populate the form and display info
    function populateForm() {
        if (carTitleDisplay) carTitleDisplay.textContent = carTitle;
        if (agentNameDisplay) agentNameDisplay.textContent = agentName;

        if (agentPhone && agentPhoneDisplay && agentPhoneLink) {
            agentPhoneLink.href = `tel:${agentPhone}`;
            agentPhoneLink.textContent = agentPhone;
            agentPhoneDisplay.style.display = 'inline';
        } else if (agentPhoneDisplay) {
            agentPhoneDisplay.style.display = 'none';
        }
        
        // Populate hidden fields for form submission (if a backend were active)
        if (hiddenCarMake) hiddenCarMake.value = carMake;
        if (hiddenCarModel) hiddenCarModel.value = carModel;
        if (hiddenCarYear) hiddenCarYear.value = carYear;
        if (hiddenAgentName) hiddenAgentName.value = agentName;
        if (hiddenAgentPhone) hiddenAgentPhone.value = agentPhone;

        // Set up the back link
        if (backLinkContainer) {
            const backLink = document.createElement('a');
            backLink.href = `autogiant-motors-product-details.html?make=${encodeURIComponent(carMake)}&model=${encodeURIComponent(carModel)}&year=${carYear}`;
            backLink.classList.add('btn', 'btn-secondary');
            backLink.innerHTML = '<i class="fas fa-arrow-left"></i> Back to Vehicle Details';
            backLinkContainer.appendChild(backLink);
        }
    }

    // Handle form submission
    if (contactForm) {
        contactForm.addEventListener('submit', function(event) {
            event.preventDefault(); // Prevent default form submission

            // Gather form data
            const formData = {
                yourName: document.getElementById('your-name').value.trim(),
                yourEmail: document.getElementById('your-email').value.trim(),
                yourPhone: document.getElementById('your-phone').value.trim(),
                message: document.getElementById('message').value.trim(),
                carMake: hiddenCarMake.value,
                carModel: hiddenCarModel.value,
                carYear: hiddenCarYear.value,
                agentName: hiddenAgentName.value,
                agentPhone: hiddenAgentPhone.value
            };

            // Basic validation
            if (!formData.yourName || !formData.yourEmail || !formData.message) {
                displayMessage('Please fill in all required fields (Name, Email, Message).', 'error');
                return;
            }
            if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.yourEmail)) {
                displayMessage('Please enter a valid email address.', 'error');
                return;
            }

            console.log('Form Data Submitted:', formData);

            // Simulate API call (in a real application, you would send this to a backend)
            // fetch('/api/contact-car-agent', {
            //     method: 'POST',
            //     headers: {
            //         'Content-Type': 'application/json',
            //     },
            //     body: JSON.stringify(formData),
            // })
            // .then(response => response.json())
            // .then(data => {
            //     if (data.success) {
            //         displayMessage('Your inquiry has been sent successfully! The agent will contact you shortly.', 'success');
            //         contactForm.reset(); // Clear the form
            //     } else {
            //         displayMessage('Failed to send inquiry. Please try again later.', 'error');
            //     }
            // })
            // .catch(error => {
            //     console.error('Error sending inquiry:', error);
            //     displayMessage('An error occurred while sending your inquiry. Please try again.', 'error');
            // });

            // For demonstration: show success message directly
            displayMessage('Your inquiry has been sent successfully! The agent will contact you shortly.', 'success');
            contactForm.reset(); // Clear the form after simulated submission
        });
    }

    // Function to display response messages (success/error)
    function displayMessage(message, type) {
        if (formResponseMessage) {
            formResponseMessage.textContent = message;
            formResponseMessage.className = `response-message ${type}`; // Add type class for styling
            formResponseMessage.style.display = 'block';
            // Hide message after a few seconds
            setTimeout(() => {
                formResponseMessage.style.display = 'none';
            }, 5000);
        }
    }

    // Initialize form population
    populateForm();
});