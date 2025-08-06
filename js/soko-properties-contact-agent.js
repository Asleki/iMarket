/*
 * soko-properties-contact-agent.js
 * This file handles the dynamic population and submission of the contact agent form.
 */

document.addEventListener('DOMContentLoaded', function() {
    const formHeading = document.getElementById('form-heading');
    const formSubheading = document.getElementById('form-subheading');
    const propertyTitleDisplay = document.getElementById('property-title-display');
    const agentNameDisplay = document.getElementById('agent-name-display');
    const agentPhoneDisplay = document.getElementById('agent-phone-display');
    const agentPhoneLink = document.getElementById('agent-phone-link');
    const agentEmailDisplay = document.getElementById('agent-email-display');
    const agentEmailLink = document.getElementById('agent-email-link');
    const contactForm = document.getElementById('contact-form');
    const formResponseMessage = document.getElementById('form-response-message');
    const backLinkContainer = document.querySelector('.back-link-container');

    // Hidden fields
    const hiddenPropertyId = document.getElementById('hidden-property-id');
    const hiddenAgentEmail = document.getElementById('hidden-agent-email');
    const hiddenPropertyTitle = document.getElementById('hidden-property-title');

    // Function to get query parameter from URL
    function getQueryParam(param) {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get(param);
    }

    // Get parameters from URL
    const propertyId = getQueryParam('propertyId');
    const propertyTitle = decodeURIComponent(getQueryParam('propertyTitle') || 'the selected property');
    const agentName = decodeURIComponent(getQueryParam('agentName') || 'the agent');
    const agentEmail = decodeURIComponent(getQueryParam('agentEmail') || '');
    const agentPhone = decodeURIComponent(getQueryParam('agentPhone') || '');

    // Populate the form and display info
    function populateForm() {
        if (propertyTitleDisplay) propertyTitleDisplay.textContent = propertyTitle;
        if (agentNameDisplay) agentNameDisplay.textContent = agentName;

        if (agentPhone && agentPhoneDisplay && agentPhoneLink) {
            agentPhoneLink.href = `tel:${agentPhone}`;
            agentPhoneLink.textContent = agentPhone;
            agentPhoneDisplay.style.display = 'inline';
        } else if (agentPhoneDisplay) {
            agentPhoneDisplay.style.display = 'none';
        }

        if (agentEmail && agentEmailDisplay && agentEmailLink) {
            agentEmailLink.href = `mailto:${agentEmail}`;
            agentEmailLink.textContent = agentEmail;
            agentEmailDisplay.style.display = 'inline';
        } else if (agentEmailDisplay) {
            agentEmailDisplay.style.display = 'none';
        }

        // Populate hidden fields for form submission (if a backend were active)
        if (hiddenPropertyId) hiddenPropertyId.value = propertyId;
        if (hiddenAgentEmail) hiddenAgentEmail.value = agentEmail;
        if (hiddenPropertyTitle) hiddenPropertyTitle.value = propertyTitle;

        // Set up the back link
        if (backLinkContainer) {
            const backLink = document.createElement('a');
            backLink.href = `soko-properties-product-details.html?id=${encodeURIComponent(propertyId)}`;
            backLink.classList.add('btn', 'btn-secondary');
            backLink.innerHTML = '<i class="fas fa-arrow-left"></i> Back to Property Details';
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
                propertyId: hiddenPropertyId.value,
                propertyTitle: hiddenPropertyTitle.value,
                agentEmail: hiddenAgentEmail.value
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
            // fetch('/api/contact-agent', {
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