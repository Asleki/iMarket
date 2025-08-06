/*
 * js/click-n-get-account.js
 * This file handles the user account dashboard for Click 'n Get.
 * It manages:
 * - Persistent user profile (via localStorage).
 * - Rendering simulated order history with tracking.
 * - Simulated real-time order tracking modal.
 * - Simulated user activities logging.
 * - Tab switching between different account sections.
 * - Profile editing and saving.
 * - Product review submission (simulated media upload).
 * - Toast notifications.
 */

document.addEventListener('DOMContentLoaded', function() {
    // --- UI Elements ---
    const accountNavLinks = document.querySelectorAll('.account-nav-link');
    const accountContentSections = document.querySelectorAll('.account-content-section');

    // Profile Section Elements
    const profileNameSpan = document.getElementById('profile-name');
    const profileEmailSpan = document.getElementById('profile-email');
    const profilePhoneSpan = document.getElementById('profile-phone');
    const profileAddressSpan = document.getElementById('profile-address'); // New
    const profileMemberSinceSpan = document.getElementById('profile-member-since');
    const editProfileBtn = document.querySelector('.edit-profile-btn');
    const profileEditForm = document.getElementById('profile-edit-form');
    const editNameInput = document.getElementById('edit-name');
    const editEmailInput = document.getElementById('edit-email');
    const editPhoneInput = document.getElementById('edit-phone');
    const editAddressInput = document.getElementById('edit-address'); // New
    const saveProfileBtn = document.querySelector('.save-profile-btn');
    const cancelEditBtn = document.querySelector('.cancel-edit-btn');
    const profileResponseMessage = document.getElementById('profile-response-message');

    // Order History Elements
    const ordersListDiv = document.getElementById('orders-list');
    const noOrdersMessage = document.getElementById('no-orders-message');

    // My Activities Elements
    const activitiesListDiv = document.getElementById('activities-list');
    const noActivitiesMessage = document.getElementById('no-activities-message');

    // Notifications Elements
    const notificationsListDiv = document.getElementById('notifications-list');
    const noNotificationsMessage = document.getElementById('no-notifications-message');
    const markAllReadBtn = document.getElementById('mark-all-read-btn');

    // Notification Toast Elements
    const notificationToast = document.getElementById('notification-toast');
    const notificationText = document.getElementById('notification-text');
    const closeToastBtn = notificationToast ? notificationToast.querySelector('.close-toast-btn') : null;

    // Order Tracking Modal Elements
    const orderTrackingModal = document.getElementById('order-tracking-modal');
    const trackingOrderNumber = document.getElementById('tracking-order-number');
    const trackingCurrentStatus = document.getElementById('tracking-current-status');
    const trackingProgressBar = document.querySelector('.tracking-progress-bar');
    const trackingUpdatesList = document.getElementById('tracking-updates-list');
    const advanceTrackingBtn = document.getElementById('advance-tracking-btn');
    const markOrderFinalBtn = document.getElementById('mark-order-final-btn');

    // Review Submission Modal Elements
    const reviewModal = document.getElementById('review-modal');
    const reviewProductName = document.getElementById('review-product-name');
    const reviewStarRatingInput = document.getElementById('review-star-rating');
    const reviewRatingValue = document.getElementById('review-rating-value');
    const reviewCommentInput = document.getElementById('review-comment');
    const reviewMediaInput = document.getElementById('review-media');
    const reviewForm = document.getElementById('review-form');
    const submitReviewBtn = document.getElementById('submit-review-btn'); // Will be inside reviewForm
    const reviewResponseMessage = document.getElementById('review-response-message');

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

    // --- Global Data (Loaded from localStorage) ---
    let userProfile = loadFromLocalStorage('userProfile', {
        name: "Guest User",
        email: "guest@example.com",
        phone: "",
        address: "",
        memberSince: new Date().toISOString().split('T')[0] // YYYY-MM-DD
    });
    let userOrders = loadFromLocalStorage('userOrders', []);
    let userActivities = loadFromLocalStorage('userActivities', []);
    let userNotifications = loadFromLocalStorage('userNotifications', []);
    let newProductReviews = loadFromLocalStorage('newProductReviews', []); // For reviews to be copied

    let currentTrackingOrder = null; // Stores the order being tracked in the modal
    let allProducts = []; // To fetch product details for reviews

    // --- Local Storage Helper Functions ---
    function loadFromLocalStorage(key, defaultValue) {
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : defaultValue;
        } catch (e) {
            console.error(`Error loading ${key} from localStorage:`, e);
            return defaultValue;
        }
    }

    function saveToLocalStorage(key, data) {
        try {
            localStorage.setItem(key, JSON.stringify(data));
        } catch (e) {
            console.error(`Error saving ${key} to localStorage:`, e);
        }
    }

    // --- Utility Functions ---

    /**
     * Updates meta tags for SEO.
     */
    function updateMetaTagsForAccountPage() {
        const title = "My Account - Click 'n Get";
        const description = "Manage your Click 'n Get account. View order history, update profile information, and track your activities.";
        const imageUrl = "images/shop-click-n-get.webp";
        const keywords = "Click n Get account, my profile, order history, my activities, online shopping account Kenya";
        
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

    /**
     * Generates HTML for star ratings.
     * @param {number} rating - The rating value (e.g., 4.7).
     * @returns {string} HTML string for star icons.
     */
    function getStarRatingHtml(rating) {
        const fullStars = Math.floor(rating);
        const halfStar = rating % 1 >= 0.5;
        const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);
        let starsHtml = '';
        for (let i = 0; i < fullStars; i++) {
            starsHtml += '<i class="fas fa-star"></i>';
        }
        if (halfStar) {
            starsHtml += '<i class="fas fa-star-half-alt"></i>';
        }
        for (let i = 0; i < emptyStars; i++) {
            starsHtml += '<i class="far fa-star"></i>'; // far for empty star
        }
        return starsHtml;
    }

    /**
     * Displays a temporary toast notification.
     * @param {string} message - The message to display.
     * @param {string} type - 'success', 'error', or 'info' for styling.
     */
    function showNotification(message, type = 'info') {
        if (notificationToast && notificationText) {
            notificationText.textContent = message;
            notificationToast.className = `notification-toast ${type} show`;
            notificationToast.style.display = 'flex';
            
            setTimeout(() => {
                notificationToast.classList.remove('show');
                setTimeout(() => {
                    notificationToast.style.display = 'none';
                }, 300); 
            }, 3000);
        }
    }

    /**
     * Adds an activity to the user's activity log.
     * @param {string} type - Type of activity (e.g., "Order Placed", "Profile Update").
     * @param {string} description - Description of the activity.
     */
    function addActivity(type, description) {
        userActivities.unshift({ // Add to the beginning for newest first
            type: type,
            description: description,
            date: new Date().toLocaleString() // Current date and time
        });
        saveToLocalStorage('userActivities', userActivities);
        // If 'My Activities' section is active, re-render it
        if (document.getElementById('activities-section').classList.contains('active')) {
            renderActivities();
        }
    }

    /**
     * Adds a notification to the user's notifications.
     * @param {string} message - The notification message.
     * @param {string} type - Type of notification (e.g., "order", "delivery", "promo").
     * @param {string} [relatedId] - Optional ID related to the notification (e.g., orderId).
     */
    function addNotification(message, type = 'info', relatedId = null) {
        userNotifications.unshift({
            id: crypto.randomUUID(), // Unique ID for notification
            message: message,
            type: type,
            read: false,
            date: new Date().toLocaleString(),
            relatedId: relatedId
        });
        saveToLocalStorage('userNotifications', userNotifications);
        // Update notification count badge in main.js (if available) or here
        // For this page, we don't have the main header badge directly, but we can simulate.
        // In a real app, this would trigger an event for the main header to update.
        showNotification(message, 'info'); // Also show as toast
    }

    /**
     * Marks a specific notification as read.
     * @param {string} notificationId - The ID of the notification to mark as read.
     */
    function markNotificationAsRead(notificationId) {
        const notificationIndex = userNotifications.findIndex(n => n.id === notificationId);
        if (notificationIndex > -1) {
            userNotifications[notificationIndex].read = true;
            saveToLocalStorage('userNotifications', userNotifications);
            renderNotifications(); // Re-render to update UI
        }
    }

    /**
     * Marks all notifications as read.
     */
    function markAllNotificationsAsRead() {
        userNotifications.forEach(n => n.read = true);
        saveToLocalStorage('userNotifications', userNotifications);
        renderNotifications();
        showNotification('All notifications marked as read.', 'success');
    }

    // --- Section Rendering Functions ---

    /**
     * Renders the user's profile information.
     */
    function renderProfile() {
        if (profileNameSpan) profileNameSpan.textContent = userProfile.name;
        if (profileEmailSpan) profileEmailSpan.textContent = userProfile.email;
        if (profilePhoneSpan) profilePhoneSpan.textContent = userProfile.phone || 'N/A';
        if (profileAddressSpan) profileAddressSpan.textContent = userProfile.address || 'Not set';
        if (profileMemberSinceSpan) {
            const date = new Date(userProfile.memberSince);
            profileMemberSinceSpan.textContent = date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
        }

        // Populate edit form
        if (editNameInput) editNameInput.value = userProfile.name;
        if (editEmailInput) editEmailInput.value = userProfile.email;
        if (editPhoneInput) editPhoneInput.value = userProfile.phone;
        if (editAddressInput) editAddressInput.value = userProfile.address;
    }

    /**
     * Renders the user's order history.
     */
    function renderOrderHistory() {
        if (!ordersListDiv || !noOrdersMessage) return;

        ordersListDiv.innerHTML = ''; // Clear loading message
        if (userOrders.length === 0) {
            noOrdersMessage.style.display = 'block';
            return;
        }
        noOrdersMessage.style.display = 'none';

        userOrders.sort((a, b) => new Date(b.orderDate) - new Date(a.orderDate)); // Sort by newest first

        userOrders.forEach(order => {
            const orderDiv = document.createElement('div');
            orderDiv.classList.add('order-item');
            
            let itemsSummary = order.items.map(item => `${item.name} (x${item.quantity})`).join(', ');
            if (itemsSummary.length > 100) { // Truncate long summaries
                itemsSummary = itemsSummary.substring(0, 97) + '...';
            }

            const isFinalStatus = ['Delivered', 'Picked Up', 'Canceled'].includes(order.status);
            const reviewButtonHtml = isFinalStatus && order.reviewStatus !== 'reviewed' ?
                `<button class="btn btn-tertiary btn-sm write-review-btn" data-order-id="${order.orderId}">Write Review</button>` :
                (order.reviewStatus === 'reviewed' ? `<span class="reviewed-badge"><i class="fas fa-check"></i> Reviewed</span>` : '');

            orderDiv.innerHTML = `
                <div class="order-header">
                    <h3>Order #${order.orderId}</h3>
                    <span class="order-date">${new Date(order.orderDate).toLocaleDateString()}</span>
                </div>
                <p><strong>Total:</strong> $${order.total.toFixed(2)}</p>
                <p><strong>Status:</strong> <span class="order-status status-${order.status.toLowerCase().replace(' ', '-')}">${order.status}</span></p>
                <p class="order-items-summary"><strong>Items:</strong> ${itemsSummary}</p>
                <div class="order-actions">
                    <button class="btn btn-secondary btn-sm track-order-btn" data-order-id="${order.orderId}"><i class="fas fa-map-marker-alt"></i> Track Order</button>
                    ${reviewButtonHtml}
                </div>
            `;
            ordersListDiv.appendChild(orderDiv);
        });

        // Add event listeners for "Track Order" and "Write Review" buttons
        ordersListDiv.querySelectorAll('.track-order-btn').forEach(button => {
            button.addEventListener('click', function() {
                const orderId = this.dataset.orderId;
                openOrderTrackingModal(orderId);
            });
        });

        ordersListDiv.querySelectorAll('.write-review-btn').forEach(button => {
            button.addEventListener('click', function() {
                const orderId = this.dataset.orderId;
                openReviewModalForOrder(orderId);
            });
        });
    }

    /**
     * Renders the user's activity log.
     */
    function renderActivities() {
        if (!activitiesListDiv || !noActivitiesMessage) return;

        activitiesListDiv.innerHTML = ''; // Clear loading message
        if (userActivities.length === 0) {
            noActivitiesMessage.style.display = 'block';
            return;
        }
        noActivitiesMessage.style.display = 'none';

        userActivities.sort((a, b) => new Date(b.date) - new Date(a.date)); // Sort by newest first

        userActivities.forEach(activity => {
            const activityDiv = document.createElement('div');
            activityDiv.classList.add('activity-item');
            activityDiv.innerHTML = `
                <span class="activity-type">${activity.type}</span>
                <span class="activity-description">${activity.description}</span>
                <span class="activity-date">${activity.date}</span>
            `;
            activitiesListDiv.appendChild(activityDiv);
        });
    }

    /**
     * Renders the user's notifications.
     */
    function renderNotifications() {
        if (!notificationsListDiv || !noNotificationsMessage || !markAllReadBtn) return;

        notificationsListDiv.innerHTML = '';
        const unreadNotifications = userNotifications.filter(n => !n.read);

        if (userNotifications.length === 0) {
            noNotificationsMessage.style.display = 'block';
            markAllReadBtn.style.display = 'none';
            return;
        }
        noNotificationsMessage.style.display = 'none';

        userNotifications.forEach(notification => {
            const notificationDiv = document.createElement('div');
            notificationDiv.classList.add('notification-item');
            if (notification.read) {
                notificationDiv.classList.add('read');
            } else {
                notificationDiv.classList.add('unread');
            }

            notificationDiv.innerHTML = `
                <div class="notification-icon"><i class="fas fa-${getNotificationIcon(notification.type)}"></i></div>
                <div class="notification-content">
                    <p class="notification-message">${notification.message}</p>
                    <span class="notification-date">${notification.date}</span>
                </div>
                ${!notification.read ? `<button class="mark-read-btn" data-id="${notification.id}" title="Mark as Read"><i class="fas fa-check"></i></button>` : ''}
            `;
            notificationsListDiv.appendChild(notificationDiv);
        });

        // Show/hide "Mark All As Read" button
        if (unreadNotifications.length > 0) {
            markAllReadBtn.style.display = 'inline-block';
        } else {
            markAllReadBtn.style.display = 'none';
        }

        // Add event listeners for individual "Mark as Read" buttons
        notificationsListDiv.querySelectorAll('.mark-read-btn').forEach(button => {
            button.addEventListener('click', function() {
                markNotificationAsRead(this.dataset.id);
            });
        });
    }

    /**
     * Helper to get appropriate icon for notification type.
     * @param {string} type - Notification type.
     * @returns {string} Font Awesome icon class suffix.
     */
    function getNotificationIcon(type) {
        switch (type) {
            case 'order': return 'box-open';
            case 'delivery': return 'truck-fast';
            case 'pickup': return 'store';
            case 'review': return 'star';
            case 'promo': return 'tag';
            case 'system': return 'info-circle';
            default: return 'bell';
        }
    }

    /**
     * Handles switching between account sections.
     * @param {string} sectionId - The ID of the section to show (e.g., 'profile', 'orders').
     */
    function showSection(sectionId) {
        // Remove 'active' class from all nav links and content sections
        accountNavLinks.forEach(link => link.classList.remove('active'));
        accountContentSections.forEach(section => section.classList.remove('active'));

        // Add 'active' class to the clicked nav link and corresponding content section
        const targetNavLink = document.querySelector(`.account-nav-link[data-section="${sectionId}"]`);
        const targetContentSection = document.getElementById(`${sectionId}-section`);

        if (targetNavLink) targetNavLink.classList.add('active');
        if (targetContentSection) targetContentSection.classList.add('active');

        // Render content for the active section
        switch (sectionId) {
            case 'profile':
                renderProfile();
                break;
            case 'orders':
                renderOrderHistory();
                break;
            case 'activities':
                renderActivities();
                break;
            case 'notifications':
                renderNotifications();
                break;
            // For other sections like settings, addresses, payment, wishlist,
            // you would add their rendering logic here if they were dynamic.
            // For now, they are static HTML content or have simple mock data.
            case 'settings':
            case 'addresses':
            case 'payment':
            case 'wishlist':
                // No dynamic rendering needed for these static/mock sections on load
                break;
        }
    }

    // --- Order Tracking Modal Logic ---
    const trackingStages = [
        'Ordered', 'Warehouse', 'Packaging', 'Courier Hub', 'In Transit', 'Out for Delivery', 'Delivered'
    ];
    let trackingInterval = null; // To store the interval ID for simulated tracking

    /**
     * Opens the order tracking modal and initializes tracking.
     * @param {string} orderId - The ID of the order to track.
     */
    function openOrderTrackingModal(orderId) {
        currentTrackingOrder = userOrders.find(order => order.orderId === orderId);

        if (!currentTrackingOrder) {
            showNotification('Order not found for tracking.', 'error');
            return;
        }

        trackingOrderNumber.textContent = currentTrackingOrder.orderId;
        renderTrackingProgress();
        renderTrackingUpdatesList();

        // Show/hide advance button based on status
        if (!['Delivered', 'Picked Up', 'Canceled'].includes(currentTrackingOrder.status)) {
            advanceTrackingBtn.style.display = 'inline-block';
            markOrderFinalBtn.style.display = 'inline-block';
        } else {
            advanceTrackingBtn.style.display = 'none';
            markOrderFinalBtn.style.display = 'none';
        }

        // Clear any existing interval
        if (trackingInterval) {
            clearInterval(trackingInterval);
        }
        // Start simulated auto-advance if not final status
        if (!['Delivered', 'Picked Up', 'Canceled'].includes(currentTrackingOrder.status)) {
            trackingInterval = setInterval(advanceTrackingStatus, 5000); // Advance every 5 seconds
        }

        orderTrackingModal.classList.add('show');
        orderTrackingModal.setAttribute('aria-hidden', 'false');
        document.body.classList.add('modal-open');
        addActivity('Order Tracking', `Opened tracking for order ${orderId}`);
    }

    /**
     * Renders the visual progress bar and current status text.
     */
    function renderTrackingProgress() {
        const currentStageIndex = trackingStages.indexOf(currentTrackingOrder.status);
        trackingCurrentStatus.textContent = currentTrackingOrder.status;
        trackingCurrentStatus.className = `order-status status-${currentTrackingOrder.status.toLowerCase().replace(' ', '-')}`;

        trackingProgressBar.querySelectorAll('.progress-step').forEach((step, index) => {
            step.classList.remove('active', 'completed');
            if (index <= currentStageIndex) {
                step.classList.add('completed');
            }
            if (index === currentStageIndex) {
                step.classList.add('active');
            }
        });
    }

    /**
     * Renders the list of historical tracking updates.
     */
    function renderTrackingUpdatesList() {
        trackingUpdatesList.innerHTML = '';
        currentTrackingOrder.trackingHistory.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)); // Newest first

        currentTrackingOrder.trackingHistory.forEach(history => {
            const updateDiv = document.createElement('div');
            updateDiv.classList.add('tracking-update-item');
            updateDiv.innerHTML = `
                <span class="update-timestamp">${new Date(history.timestamp).toLocaleString()}</span>
                <span class="update-stage">${history.stage}</span>
            `;
            trackingUpdatesList.appendChild(updateDiv);
        });
    }

    /**
     * Simulates advancing the order tracking status.
     */
    function advanceTrackingStatus() {
        if (!currentTrackingOrder) return;

        const currentStageIndex = trackingStages.indexOf(currentTrackingOrder.status);
        if (currentStageIndex < trackingStages.length - 1) {
            const nextStage = trackingStages[currentStageIndex + 1];
            currentTrackingOrder.status = nextStage;
            currentTrackingOrder.trackingHistory.push({
                stage: nextStage,
                timestamp: new Date().toISOString()
            });
            saveToLocalStorage('userOrders', userOrders); // Save updated order
            
            renderTrackingProgress();
            renderTrackingUpdatesList();
            renderOrderHistory(); // Update main order list
            addActivity('Order Status Update', `Order ${currentTrackingOrder.orderId} status changed to: ${nextStage}`);

            // Add notifications for key stages
            if (nextStage === 'Out for Delivery') {
                addNotification(`Your order #${currentTrackingOrder.orderId} is out for delivery!`, 'delivery', currentTrackingOrder.orderId);
            } else if (nextStage === 'Ready for Pickup') { // If pickup option was chosen
                 addNotification(`Your order #${currentTrackingOrder.orderId} is ready for pickup!`, 'pickup', currentTrackingOrder.orderId);
            } else if (nextStage === 'Delivered') {
                addNotification(`Your order #${currentTrackingOrder.orderId} has been delivered!`, 'delivery', currentTrackingOrder.orderId);
                clearInterval(trackingInterval); // Stop auto-advance
                advanceTrackingBtn.style.display = 'none';
                markOrderFinalBtn.style.display = 'none';
                // Prompt for review if delivered
                currentTrackingOrder.reviewStatus = 'pending'; // Mark as pending review
                saveToLocalStorage('userOrders', userOrders);
                showNotification(`Order #${currentTrackingOrder.orderId} delivered. You can now write a review!`, 'success');
            }
        } else {
            clearInterval(trackingInterval); // Stop auto-advance if at final stage
            advanceTrackingBtn.style.display = 'none';
            markOrderFinalBtn.style.display = 'none';
        }
    }

    /**
     * Manually marks an order as delivered/picked up.
     */
    function markOrderAsFinal() {
        if (!currentTrackingOrder) return;

        const finalStatus = currentTrackingOrder.deliveryOption === 'pickup' ? 'Picked Up' : 'Delivered';
        currentTrackingOrder.status = finalStatus;
        currentTrackingOrder.trackingHistory.push({
            stage: finalStatus,
            timestamp: new Date().toISOString()
        });
        currentTrackingOrder.reviewStatus = 'pending'; // Mark as pending review
        saveToLocalStorage('userOrders', userOrders);

        renderTrackingProgress();
        renderTrackingUpdatesList();
        renderOrderHistory(); // Update main order list
        addActivity('Order Finalized', `Order ${currentTrackingOrder.orderId} manually marked as ${finalStatus}`);
        addNotification(`Your order #${currentTrackingOrder.orderId} has been ${finalStatus.toLowerCase()}!`, finalStatus === 'Delivered' ? 'delivery' : 'pickup', currentTrackingOrder.orderId);

        clearInterval(trackingInterval); // Stop auto-advance
        advanceTrackingBtn.style.display = 'none';
        markOrderFinalBtn.style.display = 'none';
        showNotification(`Order #${currentTrackingOrder.orderId} marked as ${finalStatus}. You can now write a review!`, 'success');
    }

    // --- Review Submission Modal Logic ---
    let productToReview = null; // Stores the product being reviewed

    /**
     * Opens the review modal for a specific order's products.
     * @param {string} orderId - The ID of the order.
     */
    async function openReviewModalForOrder(orderId) {
        const order = userOrders.find(o => o.orderId === orderId);
        if (!order || !order.items || order.items.length === 0) {
            showNotification('Could not find order or items to review.', 'error');
            return;
        }

        // For simplicity, we'll let the user review the first item in the order.
        // In a more complex app, you'd list all eligible items from the order.
        productToReview = allProducts.find(p => p.id === order.items[0].id);

        if (!productToReview) {
            showNotification('Product not found for review.', 'error');
            return;
        }

        reviewProductName.textContent = productToReview.name;
        reviewRatingValue.value = 0; // Reset rating
        reviewStarRatingInput.querySelectorAll('i').forEach(star => {
            star.classList.remove('fas');
            star.classList.add('far');
        });
        reviewCommentInput.value = ''; // Clear comment
        reviewMediaInput.value = ''; // Clear file input
        reviewResponseMessage.style.display = 'none'; // Clear previous messages

        reviewModal.classList.add('show');
        reviewModal.setAttribute('aria-hidden', 'false');
        document.body.classList.add('modal-open');
    }

    /**
     * Handles star rating selection in the review modal.
     * @param {Event} event - The click event.
     */
    function handleStarRatingClick(event) {
        const clickedStar = event.target.closest('i');
        if (clickedStar && reviewStarRatingInput.contains(clickedStar)) {
            const rating = parseInt(clickedStar.dataset.rating);
            reviewRatingValue.value = rating;

            reviewStarRatingInput.querySelectorAll('i').forEach(star => {
                const starRating = parseInt(star.dataset.rating);
                if (starRating <= rating) {
                    star.classList.remove('far');
                    star.classList.add('fas');
                } else {
                    star.classList.remove('fas');
                    star.classList.add('far');
                }
            });
        }
    }

    /**
     * Handles review form submission.
     * @param {Event} event - The form submission event.
     */
    function submitReview(event) {
        event.preventDefault();

        const rating = parseInt(reviewRatingValue.value);
        const comment = reviewCommentInput.value.trim();
        const mediaFiles = reviewMediaInput.files; // Simulated files

        if (rating === 0 || !comment) {
            reviewResponseMessage.textContent = 'Please provide a star rating and a comment.';
            reviewResponseMessage.className = 'response-message error';
            reviewResponseMessage.style.display = 'block';
            return;
        }

        // Simulate media upload by creating placeholder URLs or base64 if small
        const mediaUrls = [];
        if (mediaFiles.length > 0) {
            for (let i = 0; i < mediaFiles.length; i++) {
                const file = mediaFiles[i];
                // In a real app, you'd upload this to a server and get a real URL.
                // For simulation, we'll just use a generic placeholder.
                mediaUrls.push(`simulated_upload_url/${file.name}`);
            }
            showNotification(`Simulating upload of ${mediaFiles.length} files. No actual upload.`, 'info');
        }

        const newReview = {
            reviewerName: userProfile.name, // Use current user's name
            rating: rating,
            comment: comment,
            date: new Date().toISOString(),
            media: mediaUrls // Array of simulated media URLs
        };

        newProductReviews.push({ productId: productToReview.id, review: newReview });
        saveToLocalStorage('newProductReviews', newProductReviews);

        // Update the order's review status
        const orderIndex = userOrders.findIndex(o => o.orderId === currentTrackingOrder.orderId);
        if (orderIndex > -1) {
            userOrders[orderIndex].reviewStatus = 'reviewed';
            saveToLocalStorage('userOrders', userOrders);
        }

        reviewResponseMessage.textContent = 'Review submitted successfully! You can copy it from localStorage.';
        reviewResponseMessage.className = 'response-message success';
        reviewResponseMessage.style.display = 'block';

        addActivity('Review Submitted', `Submitted a ${rating}-star review for "${productToReview.name}"`);
        addNotification(`Thank you for reviewing "${productToReview.name}"!`, 'review', productToReview.id);

        renderOrderHistory(); // Re-render orders to update review status badge
        
        // Optionally close modal after a short delay
        setTimeout(() => {
            reviewModal.classList.remove('show');
            document.body.classList.remove('modal-open');
        }, 2000);
    }

    // --- Event Listeners ---

    // Navigation link clicks
    accountNavLinks.forEach(link => {
        link.addEventListener('click', function(event) {
            event.preventDefault(); // Prevent default link behavior
            const section = this.dataset.section;
            if (section === 'logout') {
                // Simulate logout - clear user profile and redirect
                localStorage.removeItem('userProfile');
                localStorage.removeItem('userOrders');
                localStorage.removeItem('userActivities');
                localStorage.removeItem('userNotifications');
                localStorage.removeItem('newProductReviews');
                showNotification('You have been logged out. All local data cleared. (Simulated)', 'info');
                console.log('User logged out and local data cleared.');
                window.location.href = 'click-n-get-index.html'; 
            } else {
                showSection(section);
            }
        });
    });

    // Profile edit button
    if (editProfileBtn) {
        editProfileBtn.addEventListener('click', () => {
            if (profileEditForm) profileEditForm.style.display = 'block';
            editProfileBtn.style.display = 'none';
            profileResponseMessage.style.display = 'none'; // Clear message
            // Populate form with current data
            if (editNameInput) editNameInput.value = userProfile.name;
            if (editEmailInput) editEmailInput.value = userProfile.email;
            if (editPhoneInput) editPhoneInput.value = userProfile.phone;
            if (editAddressInput) editAddressInput.value = userProfile.address;
        });
    }

    // Cancel edit button
    if (cancelEditBtn) {
        cancelEditBtn.addEventListener('click', () => {
            if (profileEditForm) profileEditForm.style.display = 'none';
            if (editProfileBtn) editProfileBtn.style.display = 'inline-block';
            profileResponseMessage.style.display = 'none'; // Clear message
        });
    }

    // Save profile changes (simulated)
    if (saveProfileBtn) {
        saveProfileBtn.addEventListener('click', (event) => {
            event.preventDefault(); // Prevent form submission

            const newName = editNameInput.value.trim();
            const newEmail = editEmailInput.value.trim();
            const newPhone = editPhoneInput.value.trim();
            const newAddress = editAddressInput.value.trim();

            if (!newName || !newEmail) {
                profileResponseMessage.textContent = 'Name and Email are required.';
                profileResponseMessage.className = 'response-message error';
                profileResponseMessage.style.display = 'block';
                return;
            }
            if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newEmail)) {
                profileResponseMessage.textContent = 'Please enter a valid email address.';
                profileResponseMessage.className = 'response-message error';
                profileResponseMessage.style.display = 'block';
                return;
            }

            userProfile.name = newName;
            userProfile.email = newEmail;
            userProfile.phone = newPhone;
            userProfile.address = newAddress;
            saveToLocalStorage('userProfile', userProfile);

            renderProfile(); // Re-render profile section with new data
            if (profileEditForm) profileEditForm.style.display = 'none';
            if (editProfileBtn) editProfileBtn.style.display = 'inline-block';
            profileResponseMessage.textContent = 'Profile updated successfully!';
            profileResponseMessage.className = 'response-message success';
            profileResponseMessage.style.display = 'block';
            addActivity('Profile Update', 'Updated profile information');
            console.log('User data updated:', userProfile);
        });
    }

    // Close toast notification
    if (closeToastBtn) {
        closeToastBtn.addEventListener('click', () => {
            if (notificationToast) notificationToast.classList.remove('show');
            setTimeout(() => {
                if (notificationToast) notificationToast.style.display = 'none';
            }, 300);
        });
    }

    // Modal close buttons (for tracking and review modals)
    document.querySelectorAll('.modal .close-button').forEach(button => {
        button.addEventListener('click', function() {
            const modal = this.closest('.modal');
            modal.classList.remove('show');
            modal.setAttribute('aria-hidden', 'true');
            document.body.classList.remove('modal-open');
            // Clear tracking interval if tracking modal is closed
            if (modal.id === 'order-tracking-modal' && trackingInterval) {
                clearInterval(trackingInterval);
            }
        });
    });

    // Order Tracking Modal Buttons
    if (advanceTrackingBtn) {
        advanceTrackingBtn.addEventListener('click', advanceTrackingStatus);
    }
    if (markOrderFinalBtn) {
        markOrderFinalBtn.addEventListener('click', markOrderAsFinal);
    }

    // Review Modal Star Rating
    if (reviewStarRatingInput) {
        reviewStarRatingInput.addEventListener('click', handleStarRatingClick);
    }
    // Review Form Submission
    if (reviewForm) {
        reviewForm.addEventListener('submit', submitReview);
    }

    // Mark All Notifications As Read Button
    if (markAllReadBtn) {
        markAllReadBtn.addEventListener('click', markAllNotificationsAsRead);
    }

    // --- Initial Fetch for allProducts (needed for review modal) ---
    async function fetchAllProductsForReviews() {
        try {
            const response = await fetch('data/clicknget-products.json');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            allProducts = await response.json();
            console.log('All products loaded for review lookup.');
        } catch (error) {
            console.error('Error fetching all products for review lookup:', error);
            showNotification('Could not load product data for reviews.', 'error');
        }
    }

    // --- Initialization ---
    updateMetaTagsForAccountPage();
    fetchAllProductsForReviews(); // Load all products for review lookup
    // Show the default section (My Profile) on page load
    showSection('profile'); 
});