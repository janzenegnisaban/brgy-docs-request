// Main Application Logic

// Initialize app
document.addEventListener('DOMContentLoaded', function() {
    // Check if user is logged in and update navigation
    updateNavigation();
    
    // Initialize any page-specific functionality
    const currentPage = window.location.pathname.split('/').pop();
    
    if (currentPage === 'dashboard.html') {
        loadDashboard();
    } else if (currentPage === 'tracking.html') {
        initializeTracking();
    } else if (currentPage === 'request-detail.html') {
        const trackingNumber = getQueryParam('tracking');
        const container = document.getElementById('request-detail-container');
        if (trackingNumber && container) {
            trackRequest(trackingNumber);
        } else if (container) {
            container.innerHTML = '<div class="alert alert-error">No tracking number provided.</div>';
        }
        updateRequestDetailNav();
    }
});

// Update navigation based on login status
function updateNavigation() {
    const nav = document.querySelector('nav');
    if (!nav) return;
    
    const isLoggedIn = localStorage.getItem('currentUser') !== null;
    
    if (isLoggedIn) {
        const user = JSON.parse(localStorage.getItem('currentUser'));
        const loginLink = nav.querySelector('a[href="login.html"]');
        const registerLink = nav.querySelector('a[href="register.html"]');
        
        if (loginLink) {
            loginLink.textContent = user.fullName || 'Dashboard';
            loginLink.href = 'dashboard.html';
        }
        
        if (registerLink) {
            registerLink.textContent = 'Logout';
            registerLink.href = '#';
            registerLink.onclick = function(e) {
                e.preventDefault();
                logout();
            };
        }
    }
}

// Load dashboard data
function loadDashboard() {
    const currentUser = getCurrentUser();
    if (!currentUser) {
        redirect('login.html');
        return;
    }
    
    // Load user requests
    const userRequests = JSON.parse(localStorage.getItem('userRequests') || '[]');
    const userRequestsList = userRequests.filter(req => req.userId === currentUser.id);
    
    // Also check for guest requests that match user's email/phone
    const guestRequests = JSON.parse(localStorage.getItem('guestRequests') || '[]');
    const matchingGuestRequests = guestRequests.filter(req => 
        (req.email && req.email.toLowerCase() === currentUser.email.toLowerCase()) ||
        (req.phone && normalizePhone(req.phone) === normalizePhone(currentUser.phone))
    );
    
    const allMyRequests = [...userRequestsList, ...matchingGuestRequests];
    displayRequests(allMyRequests);
    updateStats(userRequestsList);
    var trackings = allMyRequests.map(function(r) { return r.trackingNumber; });
    var notifs = getNotificationsForTracking(trackings);
    if (notifs.length > 0) {
        notifs.slice(-3).forEach(function(n) {
            showToast(n.message, n.type);
        });
    }
}

// Display requests in dashboard
function displayRequests(requests) {
    const requestsContainer = document.querySelector('.requests-list');
    if (!requestsContainer) return;
    
    // Sort by date (newest first)
    requests.sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt));
    
    if (requests.length === 0) {
        requestsContainer.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">📭</div>
                <h3>No requests yet</h3>
                <p>Start by submitting a document request</p>
                <a href="request-form.html" class="btn btn-primary" style="margin-top: 1rem;">Request Document</a>
            </div>
        `;
        return;
    }
    
    requestsContainer.innerHTML = requests.map(request => {
        const statusClass = request.status.replace(/\s+/g, '-').toLowerCase();
        const statusLabel = request.status.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
        
        return `
            <div class="request-card ${statusClass}">
                <div class="request-header">
                    <div class="request-title">${request.documentType}</div>
                    <span class="status-badge ${statusClass}">${statusLabel}</span>
                </div>
                <div class="request-details">
                    <div class="request-detail">
                        <label>Tracking Number</label>
                        <span>${request.trackingNumber}</span>
                    </div>
                    <div class="request-detail">
                        <label>Submitted</label>
                        <span>${formatDate(request.submittedAt)}</span>
                    </div>
                    <div class="request-detail">
                        <label>Status</label>
                        <span>${statusLabel}</span>
                    </div>
                </div>
                <div class="request-actions">
                    <button onclick="viewRequest('${request.trackingNumber}')" class="btn btn-primary btn-sm">View Details</button>
                    ${request.status === 'ready' || request.status === 'completed' ? 
                        `<button onclick="downloadDocument('${request.trackingNumber}')" class="btn btn-success btn-sm">Download</button>` : 
                        ''
                    }
                </div>
            </div>
        `;
    }).join('');
}

// Update dashboard stats
function updateStats(requests) {
    const stats = {
        total: requests.length,
        pending: requests.filter(r => r.status === 'pending').length,
        processing: requests.filter(r => ['for-printing', 'for-signing'].includes(r.status)).length,
        ready: requests.filter(r => r.status === 'ready' || r.status === 'completed').length
    };
    
    const totalEl = document.querySelector('.stat-card:nth-child(1) h3');
    const pendingEl = document.querySelector('.stat-card:nth-child(2) h3');
    const processingEl = document.querySelector('.stat-card:nth-child(3) h3');
    const readyEl = document.querySelector('.stat-card:nth-child(4) h3');
    
    if (totalEl) totalEl.textContent = stats.total;
    if (pendingEl) pendingEl.textContent = stats.pending;
    if (processingEl) processingEl.textContent = stats.processing;
    if (readyEl) readyEl.textContent = stats.ready;
}

// View request details - Make globally accessible
window.viewRequest = function(trackingNumber) {
    window.location.href = `request-detail.html?tracking=${trackingNumber}`;
};

// Download document - Make globally accessible
window.downloadDocument = function(trackingNumber) {
    const guestRequests = JSON.parse(localStorage.getItem('guestRequests') || '[]');
    const userRequests = JSON.parse(localStorage.getItem('userRequests') || '[]');
    const allRequests = [...guestRequests, ...userRequests];
    
    const request = allRequests.find(r => r.trackingNumber === trackingNumber);
    if (!request) {
        showAlert('Request not found', 'error');
        return;
    }
    
    if (request.status !== 'ready' && request.status !== 'completed') {
        showAlert('Document is not ready for download yet', 'warning');
        return;
    }
    
    // Generate PDF (simulated)
    generatePDF(request);
};

// Generate PDF (simulated) - Make globally accessible
window.generatePDF = function(request) {
    // In a real implementation, this would generate an actual PDF
    // For now, we'll create a simple HTML document that can be printed
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>${request.documentType} - ${request.trackingNumber}</title>
            <style>
                body { font-family: Arial, sans-serif; padding: 40px; }
                .header { text-align: center; margin-bottom: 30px; }
                .content { margin: 30px 0; }
                .field { margin: 15px 0; }
                .label { font-weight: bold; }
                .footer { margin-top: 50px; text-align: right; }
            </style>
        </head>
        <body>
            <div class="header">
                <h1>BARANGAY NEW CABALAN</h1>
                <h2>${request.documentType.toUpperCase()}</h2>
            </div>
            <div class="content">
                <div class="field">
                    <span class="label">Name:</span> ${request.fullName}
                </div>
                <div class="field">
                    <span class="label">Birthdate:</span> ${formatDate(request.birthdate)}
                </div>
                <div class="field">
                    <span class="label">Address:</span> ${request.address}
                </div>
                <div class="field">
                    <span class="label">Tracking Number:</span> ${request.trackingNumber}
                </div>
                <div class="field">
                    <span class="label">Date Issued:</span> ${formatDate(new Date().toISOString())}
                </div>
            </div>
            <div class="footer">
                <p>_________________________</p>
                <p>Barangay Captain</p>
                <p>Barangay New Cabalan</p>
            </div>
        </body>
        </html>
    `);
    printWindow.document.close();
    printWindow.print();
};

// Update nav on request-detail page
function updateRequestDetailNav() {
    const isLoggedIn = localStorage.getItem('currentUser') !== null;
    const navDashboard = document.getElementById('nav-dashboard');
    const navLogin = document.getElementById('nav-login');
    const backDashboard = document.getElementById('back-dashboard');
    if (navDashboard && navLogin) {
        if (isLoggedIn) {
            navDashboard.style.display = 'inline-block';
            navLogin.style.display = 'none';
            if (backDashboard) backDashboard.style.display = 'inline-block';
        } else {
            navDashboard.style.display = 'none';
            navLogin.style.display = 'inline-block';
            if (backDashboard) backDashboard.style.display = 'none';
        }
    }
}

// Initialize tracking page
function initializeTracking() {
    const trackingForm = document.querySelector('#tracking-form');
    if (trackingForm) {
        trackingForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const trackingNumber = document.querySelector('#tracking-number').value.trim();
            if (trackingNumber) {
                trackRequest(trackingNumber);
            }
        });
    }
    
    // Check if tracking number is in URL
    const trackingParam = getQueryParam('tracking');
    if (trackingParam) {
        document.querySelector('#tracking-number').value = trackingParam;
        trackRequest(trackingParam);
    }
}

// Track request - Make globally accessible
window.trackRequest = function(trackingNumber) {
    const guestRequests = JSON.parse(localStorage.getItem('guestRequests') || '[]');
    const userRequests = JSON.parse(localStorage.getItem('userRequests') || '[]');
    const allRequests = [...guestRequests, ...userRequests];
    
    const request = allRequests.find(r => r.trackingNumber === trackingNumber);
    
    const resultContainer = document.querySelector('#request-detail-container') || document.querySelector('.tracking-result');
    if (!resultContainer) return;
    
    if (!request) {
        resultContainer.innerHTML = `
            <div class="alert alert-error">
                Request not found. Please check your tracking number and try again.
            </div>
        `;
        return;
    }
    
    const statusClass = request.status.replace(/\s+/g, '-').toLowerCase();
    const statusLabel = request.status.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    
    resultContainer.innerHTML = `
        <div class="request-card ${statusClass}">
            <div class="request-header">
                <div class="request-title">${request.documentType}</div>
                <span class="status-badge ${statusClass}">${statusLabel}</span>
            </div>
            <div class="request-details">
                <div class="request-detail">
                    <label>Tracking Number</label>
                    <span>${request.trackingNumber}</span>
                </div>
                <div class="request-detail">
                    <label>Full Name</label>
                    <span>${request.fullName}</span>
                </div>
                <div class="request-detail">
                    <label>Birthdate</label>
                    <span>${formatDate(request.birthdate)}</span>
                </div>
                <div class="request-detail">
                    <label>Address</label>
                    <span>${request.address}</span>
                </div>
                <div class="request-detail">
                    <label>Email</label>
                    <span>${request.email || 'N/A'}</span>
                </div>
                <div class="request-detail">
                    <label>Phone</label>
                    <span>${request.phone || 'N/A'}</span>
                </div>
                <div class="request-detail">
                    <label>Submitted</label>
                    <span>${formatDateTime(request.submittedAt)}</span>
                </div>
                <div class="request-detail">
                    <label>Status</label>
                    <span>${statusLabel}</span>
                </div>
            </div>
            <div class="request-actions">
                ${request.status === 'ready' || request.status === 'completed' ? 
                    `<button onclick="downloadDocument('${request.trackingNumber}')" class="btn btn-success">Download Document</button>` : 
                    ''
                }
                ${!isLoggedIn() ? 
                    `<a href="register.html?claim=${request.trackingNumber}" class="btn btn-primary">Create Account to Manage</a>` : 
                    ''
                }
            </div>
        </div>
    `;
}
