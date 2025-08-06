/*
 * autogiant-motors-about.js
 * This file handles dynamic content or interactions specific to the AutoGiant Motors About Us page.
 * For a static page like this, its primary role is updating meta tags for SEO.
 */

document.addEventListener('DOMContentLoaded', function() {
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

        // Default values for the About page
        const title = "About AutoGiant Motors - Our Story & Values";
        const description = "Learn about AutoGiant Motors, our mission to provide quality vehicles and exceptional service in Kenya. Discover our values and commitment to customers.";
        const imageUrl = "images/shop-autogiant-motors.webp"; // Use the shop's default image
        const keywords = "about AutoGiant Motors, AutoGiant Motors story, car dealership mission, vehicle sales values Kenya";
        
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

    // Initialize meta tags
    updateMetaTags();
});