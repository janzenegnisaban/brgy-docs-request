// Utility Functions

// Set favicon (tab icon) site-wide
(function ensureFavicon() {
    try {
        var iconHref = encodeURI('Logo in tab.png');
        var existing = document.querySelector('link[rel~=\"icon\"]');
        if (existing) return;

        var link = document.createElement('link');
        link.rel = 'icon';
        link.type = 'image/png';
        link.href = iconHref;
        document.head.appendChild(link);
    } catch (e) {
        // no-op
    }
})();

// Image helpers (compress/resize before saving to localStorage)
function resizeImageFileToDataUrl(file, options) {
    options = options || {};
    var maxW = options.maxWidth || 1200;
    var maxH = options.maxHeight || 1200;
    var mime = options.mimeType || 'image/jpeg';
    var quality = typeof options.quality === 'number' ? options.quality : 0.75;

    return new Promise(function(resolve, reject) {
        if (!file) return reject(new Error('No file'));
        if (!file.type || file.type.indexOf('image/') !== 0) {
            return reject(new Error('File is not an image'));
        }

        var reader = new FileReader();
        reader.onerror = function() { reject(new Error('Failed to read file')); };
        reader.onload = function() {
            var img = new Image();
            img.onerror = function() { reject(new Error('Invalid image')); };
            img.onload = function() {
                var w = img.width;
                var h = img.height;

                var scale = Math.min(maxW / w, maxH / h, 1);
                var nw = Math.round(w * scale);
                var nh = Math.round(h * scale);

                var canvas = document.createElement('canvas');
                canvas.width = nw;
                canvas.height = nh;
                var ctx = canvas.getContext('2d');
                ctx.fillStyle = '#ffffff';
                ctx.fillRect(0, 0, nw, nh);
                ctx.drawImage(img, 0, 0, nw, nh);

                try {
                    var dataUrl = canvas.toDataURL(mime, quality);
                    resolve(dataUrl);
                } catch (e) {
                    reject(e);
                }
            };
            img.src = reader.result;
        };
        reader.readAsDataURL(file);
    });
}

function isUserVerificationComplete(userRecord) {
    var v = (userRecord && userRecord.verification) ? userRecord.verification : {};
    return !!(v.idFront && v.idBack && v.proofResidency);
}

function doesDocRequire2x2(documentType) {
    // Adjust as you want per barangay policy
    var requires = [
        'Barangay Clearance',
        'Business Permit Clearance'
    ];
    return requires.indexOf(documentType) >= 0;
}

// Generate tracking number
function generateTrackingNumber() {
    const year = new Date().getFullYear();
    const random = Math.floor(Math.random() * 999999).toString().padStart(6, '0');
    return `BRG-${year}-${random}`;
}

// Format date
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    });
}

// Format date with time
function formatDateTime(dateString) {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// Check if email is valid
function isValidEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

// Check if phone is valid (Philippines format)
function isValidPhone(phone) {
    const re = /^(09|\+639)\d{9}$/;
    return re.test(phone.replace(/\s|-/g, ''));
}

// Normalize phone number
function normalizePhone(phone) {
    return phone.replace(/\s|-/g, '').replace(/^\+639/, '09');
}

// In-app notifications (stored by tracking number for resident lookup)
function addNotification(trackingNumber, message, type) {
    const key = 'brgyNotifications';
    const list = JSON.parse(localStorage.getItem(key) || '[]');
    list.push({ trackingNumber, message, type: type || 'info', createdAt: new Date().toISOString() });
    if (list.length > 100) list.splice(0, list.length - 80);
    localStorage.setItem(key, JSON.stringify(list));
}

function getNotificationsForTracking(trackingNumbers) {
    const list = JSON.parse(localStorage.getItem('brgyNotifications') || '[]');
    return list.filter(n => trackingNumbers.includes(n.trackingNumber));
}

function showToast(message, type) {
    let container = document.getElementById('toast-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toast-container';
        container.className = 'toast-container';
        document.body.appendChild(container);
    }
    const toast = document.createElement('div');
    toast.className = 'toast ' + (type || 'info');
    toast.textContent = message;
    container.appendChild(toast);
    setTimeout(function() {
        toast.remove();
    }, 5000);
}

// Show alert message
function showAlert(message, type = 'info', container = null) {
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type}`;
    alertDiv.textContent = message;
    
    const targetContainer = container || document.querySelector('.form-container') || document.body;
    
    // Insert at the top of container
    if (targetContainer === document.body) {
        targetContainer.insertBefore(alertDiv, targetContainer.firstChild);
    } else {
        targetContainer.insertBefore(alertDiv, targetContainer.firstChild);
    }
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        alertDiv.remove();
    }, 5000);
    
    return alertDiv;
}

// Get query parameter
function getQueryParam(name) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(name);
}

// Redirect with delay
function redirect(url, delay = 0) {
    if (delay > 0) {
        setTimeout(() => {
            window.location.href = url;
        }, delay);
    } else {
        window.location.href = url;
    }
}

// Debounce function
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Check if user is logged in
function isLoggedIn() {
    const user = localStorage.getItem('currentUser');
    return user !== null;
}

// Get current user
function getCurrentUser() {
    const userStr = localStorage.getItem('currentUser');
    return userStr ? JSON.parse(userStr) : null;
}

// Logout user
function logout() {
    localStorage.removeItem('currentUser');
    redirect('index.html');
}

// Check duplicate requests
function checkDuplicateRequest(email, phone, fullName, birthdate, documentType) {
    const guestRequests = JSON.parse(localStorage.getItem('guestRequests') || '[]');
    const userRequests = JSON.parse(localStorage.getItem('userRequests') || '[]');
    const currentUser = getCurrentUser();
    
    const allRequests = [...guestRequests, ...userRequests];
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    
    // Check for duplicates
    const duplicates = allRequests.filter(request => {
        // Same document type
        if (request.documentType !== documentType) return false;
        
        // Check if within 30 days
        const requestDate = new Date(request.submittedAt);
        if (requestDate < thirtyDaysAgo) return false;
        
        // Check if not completed or rejected
        if (request.status === 'completed' || request.status === 'rejected') return false;
        
        // Match by email or phone
        const emailMatch = request.email && email && request.email.toLowerCase() === email.toLowerCase();
        const phoneMatch = request.phone && phone && normalizePhone(request.phone) === normalizePhone(phone);
        
        // Match by name and birthdate
        const nameMatch = request.fullName && fullName && 
            request.fullName.toLowerCase().trim() === fullName.toLowerCase().trim();
        const birthdateMatch = request.birthdate && birthdate && 
            request.birthdate === birthdate;
        
        return (emailMatch || phoneMatch) && nameMatch && birthdateMatch;
    });
    
    return duplicates.length > 0 ? duplicates : null;
}

// Calculate days since request
function daysSince(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
}

// Rate limiting check
function checkRateLimit(email, ip = null) {
    const guestRequests = JSON.parse(localStorage.getItem('guestRequests') || '[]');
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    // Check email limit (max 3 per day)
    const emailRequests = guestRequests.filter(req => {
        if (!req.email || req.email.toLowerCase() !== email.toLowerCase()) return false;
        const reqDate = new Date(req.submittedAt);
        return reqDate >= today;
    });
    
    if (emailRequests.length >= 3) {
        return { allowed: false, reason: 'Maximum 3 requests per email per day' };
    }
    
    // Check IP limit (max 5 per day) - simplified for localStorage
    const ipRequests = guestRequests.filter(req => {
        const reqDate = new Date(req.submittedAt);
        return reqDate >= today;
    });
    
    if (ipRequests.length >= 5) {
        return { allowed: false, reason: 'Maximum 5 requests per day from this location' };
    }
    
    return { allowed: true };
}
