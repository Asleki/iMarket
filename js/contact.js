/*
 * contact.js
 * This file handles the submission of the general contact form for iMarket.
 */

document.addEventListener('DOMContentLoaded', function() {
    const generalContactForm = document.getElementById('general-contact-form');
    const formResponseMessage = document.getElementById('form-response-message');

    // Function to update meta tags for SEO
    function updateMetaTags() {
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

        // Default values for the iMarket general contact page
        const title = "Contact iMarket Kenya - Get in Touch";
        const description = "Contact iMarket Kenya for general inquiries, customer support, partnership opportunities, or feedback. Reach us via phone, email, or our online contact form.";
        const imageUrl = "images/imarket-logo.webp"; // Use the main iMarket logo
        const keywords = "contact iMarket, iMarket phone number, iMarket email, online marketplace support, Kenya e-commerce contact";
        
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

    // Handle form submission
    if (generalContactForm) {
        generalContactForm.addEventListener('submit', function(event) {
            event.preventDefault(); // Prevent default form submission

            // Gather form data
            const formData = {
                yourName: document.getElementById('your-name').value.trim(),
                yourEmail: document.getElementById('your-email').value.trim(),
                yourPhone: document.getElementById('your-phone').value.trim(),
                subject: document.getElementById('subject').value.trim(),
                message: document.getElementById('message').value.trim()
            };

            // Basic validation
            if (!formData.yourName || !formData.yourEmail || !formData.subject || !formData.message) {
                displayMessage('Please fill in all required fields (Name, Email, Subject, Message).', 'error');
                return;
            }
            if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.yourEmail)) {
                displayMessage('Please enter a valid email address.', 'error');
                return;
            }

            console.log('iMarket General Contact Form Data Submitted:', formData);

            // Simulate API call (in a real application, you would send this to a backend)
            // fetch('/api/imarket-contact', {
            //     method: 'POST',
            //     headers: {
            //         'Content-Type': 'application/json',
            //     },
            //     body: JSON.stringify(formData),
            // })
            // .then(response => response.json())
            // .then(data => {
            //     if (data.success) {
            //         displayMessage('Your message has been sent successfully! We will get back to you shortly.', 'success');
            //         generalContactForm.reset(); // Clear the form
            //     } else {
            //         displayMessage('Failed to send message. Please try again later.', 'error');
            //     }
            // })
            // .catch(error => {
            //     console.error('Error sending message:', error);
            //     displayMessage('An error occurred while sending your message. Please try again.', 'error');
            // });

            // For demonstration: show success message directly
            displayMessage('Your message has been sent successfully! We will get back to you shortly.', 'success');
            generalContactForm.reset(); // Clear the form after simulated submission
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

    // Initialize meta tags
    updateMetaTags();
});