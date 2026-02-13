// Admin Functions

// Check admin authentication
function checkAdminAuth() {
    const admin = localStorage.getItem('adminUser');
    if (!admin) {
        redirect('admin-login.html');
        return false;
    }
    return true;
}

// Initialize admin pages
document.addEventListener('DOMContentLoaded', function() {
    const currentPage = window.location.pathname.split('/').pop();
    
    // Skip auth check for login page
    if (currentPage === 'admin-login.html') {
        const loginForm = document.getElementById('admin-login-form');
        if (loginForm) {
            loginForm.addEventListener('submit', handleAdminLogin);
        }
        return;
    }
    
    // Check auth for other admin pages
    if (!checkAdminAuth()) return;
    
    // Initialize page-specific functions
    if (currentPage === 'admin-dashboard.html') {
        loadAdminDashboard();
    } else if (currentPage === 'admin-requests.html') {
        loadAdminRequests();
    } else if (currentPage === 'admin-residents.html') {
        loadResidents();
    }
});

// Handle admin login
function handleAdminLogin(e) {
    e.preventDefault();
    const alertContainer = document.getElementById('alert-container');
    
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value;
    
    // Demo credentials (in production, use proper authentication)
    if (username === 'admin' && password === 'admin123') {
        localStorage.setItem('adminUser', JSON.stringify({
            username: 'admin',
            loginTime: new Date().toISOString()
        }));
        
        showAlert('Login successful! Redirecting...', 'success', alertContainer);
        setTimeout(() => {
            redirect('admin-dashboard.html');
        }, 1000);
    } else {
        showAlert('Invalid username or password', 'error', alertContainer);
    }
}

// Admin logout
function adminLogout() {
    localStorage.removeItem('adminUser');
    redirect('admin-login.html');
}

// Load admin dashboard
function loadAdminDashboard() {
    const guestRequests = JSON.parse(localStorage.getItem('guestRequests') || '[]');
    const userRequests = JSON.parse(localStorage.getItem('userRequests') || '[]');
    const allRequests = [...guestRequests, ...userRequests];
    
    // Update stats
    document.getElementById('stat-total').textContent = allRequests.length;
    document.getElementById('stat-pending').textContent = allRequests.filter(r => r.status === 'pending').length;
    document.getElementById('stat-printing').textContent = allRequests.filter(r => r.status === 'for-printing').length;
    document.getElementById('stat-signing').textContent = allRequests.filter(r => r.status === 'for-signing').length;
    document.getElementById('stat-ready').textContent = allRequests.filter(r => r.status === 'ready').length;
    document.getElementById('stat-completed').textContent = allRequests.filter(r => r.status === 'completed').length;
    
    // Recent requests (last 10) - render as table
    const recentRequests = allRequests
        .slice()
        .sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt))
        .slice(0, 10);
    renderAdminDashboardRecentTable(recentRequests, 'recent-requests');

    // Needs attention (top 6 in workflow)
    const attention = allRequests
        .filter(r => r.status === 'pending' || r.status === 'for-printing' || r.status === 'for-signing')
        .slice()
        .sort((a, b) => new Date(a.submittedAt) - new Date(b.submittedAt))
        .slice(0, 6);
    renderAdminDashboardAttention(attention, 'pending-actions');
}

function renderAdminDashboardRecentTable(requests, containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    if (!requests || requests.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">📭</div>
                <h3>No requests yet</h3>
            </div>
        `;
        return;
    }

    container.innerHTML = `
        <div class="admin-table-wrap">
            <table class="admin-table">
                <thead>
                    <tr>
                        <th>Tracking</th>
                        <th>Resident</th>
                        <th>Document</th>
                        <th>Status</th>
                        <th>Submitted</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    ${requests.map(r => {
                        const pill = (r.status || 'pending').toLowerCase();
                        const statusLabel = (r.status || 'pending').replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
                        return `
                            <tr>
                                <td><strong>${r.trackingNumber}</strong></td>
                                <td>${r.fullName || '—'}</td>
                                <td>${r.documentType || '—'}</td>
                                <td><span class="admin-pill ${pill}">${statusLabel}</span></td>
                                <td>${formatDateTime(r.submittedAt)}</td>
                                <td>
                                    <div class="admin-actions-row">
                                        <button class="btn btn-primary btn-sm" onclick="viewRequestDetails('${r.trackingNumber}')">Details</button>
                                        <button class="btn btn-success btn-sm" onclick="generateDocument('${r.trackingNumber}')">Print</button>
                                    </div>
                                </td>
                            </tr>
                        `;
                    }).join('')}
                </tbody>
            </table>
        </div>
    `;
}

function renderAdminDashboardAttention(requests, containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    if (!requests || requests.length === 0) {
        container.innerHTML = `<div class="admin-muted">No pending items right now.</div>`;
        return;
    }

    container.innerHTML = requests.map(r => {
        const statusLabel = (r.status || 'pending').replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
        return `
            <div class="attention-item">
                <div class="attention-title">${r.documentType || 'Request'} <span class="admin-pill ${(r.status || 'pending').toLowerCase()}">${statusLabel}</span></div>
                <div class="attention-meta">
                    <span><strong>${r.fullName || '—'}</strong></span>
                    <span>${r.trackingNumber}</span>
                    <span>Submitted: ${formatDate(r.submittedAt)}</span>
                </div>
                <div class="admin-actions-row" style="margin-top: 0.75rem;">
                    <button class="btn btn-primary btn-sm" onclick="viewRequestDetails('${r.trackingNumber}')">Review</button>
                    <button class="btn btn-secondary btn-sm" onclick="updateRequestStatus('${r.trackingNumber}', 'for-printing')">Move to Printing</button>
                </div>
            </div>
        `;
    }).join('');
}

// Load admin requests page
function loadAdminRequests() {
    refreshRequests();
}

// Refresh requests
function refreshRequests() {
    const guestRequests = JSON.parse(localStorage.getItem('guestRequests') || '[]');
    const userRequests = JSON.parse(localStorage.getItem('userRequests') || '[]');
    const allRequests = [...guestRequests, ...userRequests];
    
    displayAdminRequests(allRequests, 'requests-list');
}

// Filter requests
function filterRequests() {
    const statusFilter = document.getElementById('status-filter').value;
    const documentFilter = document.getElementById('document-filter').value;
    
    const guestRequests = JSON.parse(localStorage.getItem('guestRequests') || '[]');
    const userRequests = JSON.parse(localStorage.getItem('userRequests') || '[]');
    let allRequests = [...guestRequests, ...userRequests];
    
    if (statusFilter) {
        allRequests = allRequests.filter(r => r.status === statusFilter);
    }
    
    if (documentFilter) {
        allRequests = allRequests.filter(r => r.documentType === documentFilter);
    }
    
    // Sort by date (newest first)
    allRequests.sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt));
    
    displayAdminRequests(allRequests, 'requests-list');
}

// Display admin requests
function displayAdminRequests(requests, containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    if (requests.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">📭</div>
                <h3>No requests found</h3>
            </div>
        `;
        return;
    }
    
    container.innerHTML = requests.map(request => {
        const statusClass = request.status.replace(/\s+/g, '-').toLowerCase();
        const statusLabel = request.status.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
        
        // Check for duplicates
        const duplicates = checkDuplicateRequest(
            request.email, 
            request.phone, 
            request.fullName, 
            request.birthdate, 
            request.documentType
        );
        const isDuplicate = duplicates && duplicates.length > 1;
        
        // Check if 2x2 picture is missing for documents that require it
        const requires2x2 = doesDocRequire2x2(request.documentType);
        const missing2x2 = requires2x2 && (!request.photo2x2 || !request.photo2x2.dataUrl);
        
        return `
            <div class="request-card admin-view ${isDuplicate ? 'duplicate-flag' : ''}">
                ${isDuplicate ? '<span class="duplicate-indicator">⚠️ Potential Duplicate</span>' : ''}
                ${missing2x2 ? '<span class="duplicate-indicator" style="background: var(--cta-red);">📷 Missing 2x2 Picture</span>' : ''}
                <div class="request-header">
                    <div>
                        <div class="request-title">${request.documentType}</div>
                        <div style="font-size: 0.875rem; color: var(--text-light); margin-top: 0.25rem;">
                            Tracking: ${request.trackingNumber}
                        </div>
                    </div>
                    <span class="status-badge ${statusClass}">${statusLabel}</span>
                </div>
                <div class="request-detail-grid">
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
                    ${request.purpose ? `
                    <div class="request-detail">
                        <label>Purpose</label>
                        <span>${request.purpose}</span>
                    </div>
                    ` : ''}
                </div>
                <div class="request-actions-admin">
                    <select class="status-select" onchange="updateRequestStatus('${request.trackingNumber}', this.value)">
                        <option value="pending" ${request.status === 'pending' ? 'selected' : ''}>Pending</option>
                        <option value="for-printing" ${request.status === 'for-printing' ? 'selected' : ''}>For Printing</option>
                        <option value="for-signing" ${request.status === 'for-signing' ? 'selected' : ''}>For Signing</option>
                        <option value="ready" ${request.status === 'ready' ? 'selected' : ''}>Ready for Pickup</option>
                        <option value="completed" ${request.status === 'completed' ? 'selected' : ''}>Completed</option>
                        <option value="rejected" ${request.status === 'rejected' ? 'selected' : ''}>Rejected</option>
                    </select>
                    <button onclick="viewRequestDetails('${request.trackingNumber}')" class="btn btn-primary btn-sm">View Details</button>
                    <button onclick="generateDocument('${request.trackingNumber}')" class="btn btn-success btn-sm">Generate Document</button>
                </div>
            </div>
        `;
    }).join('');
}

// Update request status
function updateRequestStatus(trackingNumber, newStatus) {
    const guestRequests = JSON.parse(localStorage.getItem('guestRequests') || '[]');
    const userRequests = JSON.parse(localStorage.getItem('userRequests') || '[]');
    
    // Find request
    let request = guestRequests.find(r => r.trackingNumber === trackingNumber);
    let isGuestRequest = true;
    if (!request) {
        request = userRequests.find(r => r.trackingNumber === trackingNumber);
        isGuestRequest = false;
    }
    
    if (!request) {
        showAlert('Request not found', 'error');
        return;
    }
    
    // Validate 2x2 picture requirement for printing status
    if (newStatus === 'for-printing' && doesDocRequire2x2(request.documentType)) {
        if (!request.photo2x2 || !request.photo2x2.dataUrl) {
            showAlert('Cannot proceed to printing: A 2x2 picture is required for Barangay Clearance documents. Please ensure the resident has uploaded their 2x2 picture before changing status to "For Printing".', 'error');
            return;
        }
    }
    
    // Update status
    request.status = newStatus;
    request.updatedAt = new Date().toISOString();
    
    if (isGuestRequest) {
        localStorage.setItem('guestRequests', JSON.stringify(guestRequests));
    } else {
        localStorage.setItem('userRequests', JSON.stringify(userRequests));
    }
    
    addNotification(request.trackingNumber, 'Status updated to: ' + newStatus.replace(/-/g, ' '), 'info');
    showAlert(`Request status updated to: ${newStatus.replace(/-/g, ' ')}`, 'success');
    refreshRequests();
    
    // Refresh dashboard if on dashboard page
    if (window.location.pathname.includes('admin-dashboard.html')) {
        loadAdminDashboard();
    }
}

// View request details
function viewRequestDetails(trackingNumber) {
    const guestRequests = JSON.parse(localStorage.getItem('guestRequests') || '[]');
    const userRequests = JSON.parse(localStorage.getItem('userRequests') || '[]');
    const allRequests = [...guestRequests, ...userRequests];
    
    const request = allRequests.find(r => r.trackingNumber === trackingNumber);
    if (!request) {
        showAlert('Request not found', 'error');
        return;
    }
    
    // Create modal
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.id = 'request-modal';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3>Request Details - ${request.trackingNumber}</h3>
                <button class="close" onclick="closeModal()">&times;</button>
            </div>
            <div class="request-detail-grid">
                <div class="request-detail">
                    <label>Document Type</label>
                    <span>${request.documentType}</span>
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
                    <label>Status</label>
                    <span>${request.status.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</span>
                </div>
                <div class="request-detail">
                    <label>Submitted</label>
                    <span>${formatDateTime(request.submittedAt)}</span>
                </div>
                ${request.purpose ? `
                <div class="request-detail">
                    <label>Purpose</label>
                    <span>${request.purpose}</span>
                </div>
                ` : ''}
                ${request.files && request.files.length > 0 ? `
                <div class="request-detail">
                    <label>Uploaded Files</label>
                    <span>${request.files.map(f => f.name).join(', ')}</span>
                </div>
                ` : ''}
                ${doesDocRequire2x2(request.documentType) ? `
                <div class="request-detail" style="grid-column: 1 / -1;">
                    <label>2x2 Picture ${request.photo2x2 ? '' : '<span style="color: var(--cta-red); font-weight: normal;">(Required for printing)</span>'}</label>
                    ${request.photo2x2 && request.photo2x2.dataUrl ? `
                        <div style="margin-top: 0.5rem;">
                            <img src="${request.photo2x2.dataUrl}" alt="2x2 Picture" style="width: 150px; height: 150px; object-fit: cover; border-radius: 0.5rem; border: 2px solid var(--border-color); box-shadow: var(--shadow);">
                            <div style="margin-top: 0.5rem; font-size: 0.875rem; color: var(--text-light);">${request.photo2x2.name} (${formatFileSize(request.photo2x2.size)})</div>
                        </div>
                    ` : `
                        <div style="padding: 1rem; background: var(--danger-light); border-radius: 0.5rem; color: #B71C1C; margin-top: 0.5rem;">
                            ⚠️ 2x2 picture not uploaded. Cannot proceed to printing status until 2x2 picture is provided.
                        </div>
                    `}
                </div>
                ` : ''}
            </div>
            <div class="notes-section">
                <label>Admin Notes</label>
                <textarea id="admin-notes" placeholder="Add notes about this request...">${request.adminNotes || ''}</textarea>
            </div>
            <div class="modal-actions">
                <button onclick="closeModal()" class="btn btn-secondary">Close</button>
                <button onclick="saveNotes('${trackingNumber}')" class="btn btn-primary">Save Notes</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    modal.style.display = 'block';
}

// Close modal
function closeModal() {
    const modal = document.getElementById('request-modal');
    if (modal) {
        modal.remove();
    }
}

// Save admin notes
function saveNotes(trackingNumber) {
    const notes = document.getElementById('admin-notes').value;
    
    const guestRequests = JSON.parse(localStorage.getItem('guestRequests') || '[]');
    const userRequests = JSON.parse(localStorage.getItem('userRequests') || '[]');
    
    let request = guestRequests.find(r => r.trackingNumber === trackingNumber);
    if (request) {
        request.adminNotes = notes;
        localStorage.setItem('guestRequests', JSON.stringify(guestRequests));
    } else {
        request = userRequests.find(r => r.trackingNumber === trackingNumber);
        if (request) {
            request.adminNotes = notes;
            localStorage.setItem('userRequests', JSON.stringify(userRequests));
        }
    }
    
    showAlert('Notes saved successfully', 'success');
    closeModal();
}

// Generate document
function generateDocument(trackingNumber) {
    const guestRequests = JSON.parse(localStorage.getItem('guestRequests') || '[]');
    const userRequests = JSON.parse(localStorage.getItem('userRequests') || '[]');
    const allRequests = [...guestRequests, ...userRequests];
    
    const request = allRequests.find(r => r.trackingNumber === trackingNumber);
    if (!request) {
        showAlert('Request not found', 'error');
        return;
    }
    
    // Generate PDF (same as in app.js)
    generatePDF(request);
}

// Load residents
function loadResidents() {
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const guestRequests = JSON.parse(localStorage.getItem('guestRequests') || '[]');
    const userRequests = JSON.parse(localStorage.getItem('userRequests') || '[]');
    
    // Combine registered users with guest request submitters
    const residents = [...users];
    
    // Add unique guest request submitters
    guestRequests.forEach(req => {
        if (!residents.find(r => 
            (r.email && req.email && r.email.toLowerCase() === req.email.toLowerCase()) ||
            (r.phone && req.phone && normalizePhone(r.phone) === normalizePhone(req.phone))
        )) {
            residents.push({
                id: 'guest-' + req.trackingNumber,
                fullName: req.fullName,
                email: req.email,
                phone: req.phone,
                address: req.address,
                birthdate: req.birthdate,
                isGuest: true
            });
        }
    });
    
    displayResidents(residents, userRequests, guestRequests);
}

// Display residents
function displayResidents(residents, userRequests, guestRequests) {
    const container = document.getElementById('residents-list');
    if (!container) return;
    
    if (residents.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">👥</div>
                <h3>No residents found</h3>
            </div>
        `;
        return;
    }
    
    container.innerHTML = residents.map(resident => {
        const allRequests = [...userRequests, ...guestRequests];
        const residentRequests = allRequests.filter(req => 
            (resident.email && req.email && resident.email.toLowerCase() === req.email.toLowerCase()) ||
            (resident.phone && req.phone && normalizePhone(resident.phone) === normalizePhone(req.phone))
        );
        
        return `
            <div class="resident-card">
                <div class="resident-header">
                    <div>
                        <div class="resident-name">${resident.fullName}</div>
                        ${resident.isGuest ? '<span style="font-size: 0.75rem; color: var(--warning-color);">Guest User</span>' : ''}
                    </div>
                    <div class="resident-stats">
                        <span>${residentRequests.length} Request(s)</span>
                    </div>
                </div>
                <div class="resident-details">
                    <div class="request-detail">
                        <label>Email</label>
                        <span>${resident.email || 'N/A'}</span>
                    </div>
                    <div class="request-detail">
                        <label>Phone</label>
                        <span>${resident.phone || 'N/A'}</span>
                    </div>
                    <div class="request-detail">
                        <label>Address</label>
                        <span>${resident.address || 'N/A'}</span>
                    </div>
                    <div class="request-detail">
                        <label>Birthdate</label>
                        <span>${resident.birthdate ? formatDate(resident.birthdate) : 'N/A'}</span>
                    </div>
                </div>
                ${residentRequests.length > 0 ? `
                <div class="resident-requests">
                    <h4>Requests</h4>
                    ${residentRequests.map(req => `
                        <div class="request-item-mini">
                            <span>${req.documentType} - ${req.trackingNumber}</span>
                            <span class="status-badge ${req.status.replace(/\s+/g, '-').toLowerCase()}">
                                ${req.status.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                            </span>
                        </div>
                    `).join('')}
                </div>
                ` : ''}
            </div>
        `;
    }).join('');
}

// Search residents
function searchResidents() {
    const searchTerm = document.getElementById('search-residents').value.toLowerCase();
    
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const guestRequests = JSON.parse(localStorage.getItem('guestRequests') || '[]');
    const userRequests = JSON.parse(localStorage.getItem('userRequests') || '[]');
    
    const residents = [...users];
    guestRequests.forEach(req => {
        if (!residents.find(r => 
            (r.email && req.email && r.email.toLowerCase() === req.email.toLowerCase()) ||
            (r.phone && req.phone && normalizePhone(r.phone) === normalizePhone(req.phone))
        )) {
            residents.push({
                id: 'guest-' + req.trackingNumber,
                fullName: req.fullName,
                email: req.email,
                phone: req.phone,
                address: req.address,
                birthdate: req.birthdate,
                isGuest: true
            });
        }
    });
    
    const filtered = residents.filter(r => 
        r.fullName.toLowerCase().includes(searchTerm) ||
        (r.email && r.email.toLowerCase().includes(searchTerm)) ||
        (r.phone && r.phone.includes(searchTerm))
    );
    
    displayResidents(filtered, userRequests, guestRequests);
}

// Refresh dashboard
function refreshDashboard() {
    loadAdminDashboard();
}

// Format file size
function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

// Make functions available globally
window.updateRequestStatus = updateRequestStatus;
window.viewRequestDetails = viewRequestDetails;
window.closeModal = closeModal;
window.saveNotes = saveNotes;
window.generateDocument = generateDocument;
window.filterRequests = filterRequests;
window.refreshRequests = refreshRequests;
window.searchResidents = searchResidents;
window.refreshDashboard = refreshDashboard;
window.adminLogout = adminLogout;
