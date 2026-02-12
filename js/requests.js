// Request Management Logic

let uploadedFiles = [];

document.addEventListener('DOMContentLoaded', function() {
    const requestForm = document.getElementById('request-form');
    if (requestForm) {
        requestForm.addEventListener('submit', handleRequestSubmit);
        
        // Check for duplicates on document type change
        const documentTypeSelect = document.getElementById('documentType');
        if (documentTypeSelect) {
            documentTypeSelect.addEventListener('change', checkDuplicateOnChange);
        }
        
        // File upload handling
        setupFileUpload();
    }
    
    // Update navigation if logged in
    updateRequestFormNavigation();
});

// Update navigation based on login status
function updateRequestFormNavigation() {
    const isLoggedIn = localStorage.getItem('currentUser') !== null;
    const navLogin = document.getElementById('nav-login');
    const navRegister = document.getElementById('nav-register');
    
    if (isLoggedIn) {
        const user = JSON.parse(localStorage.getItem('currentUser'));
        if (navLogin) {
            navLogin.textContent = user.fullName || 'Dashboard';
            navLogin.href = 'dashboard.html';
        }
        if (navRegister) {
            navRegister.textContent = 'Logout';
            navRegister.href = '#';
            navRegister.onclick = function(e) {
                e.preventDefault();
                logout();
            };
        }
    }
}

// Setup file upload
function setupFileUpload() {
    const uploadArea = document.getElementById('file-upload-area');
    const fileInput = document.getElementById('file-input');
    const fileList = document.getElementById('file-list');
    
    if (!uploadArea || !fileInput) return;
    
    uploadArea.addEventListener('click', () => fileInput.click());
    
    uploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadArea.classList.add('dragover');
    });
    
    uploadArea.addEventListener('dragleave', () => {
        uploadArea.classList.remove('dragover');
    });
    
    uploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadArea.classList.remove('dragover');
        const files = Array.from(e.dataTransfer.files);
        handleFiles(files);
    });
    
    fileInput.addEventListener('change', (e) => {
        const files = Array.from(e.target.files);
        handleFiles(files);
    });
}

// Handle file selection
function handleFiles(files) {
    files.forEach(file => {
        // Simulate file storage (in production, upload to server)
        const fileData = {
            name: file.name,
            size: file.size,
            type: file.type,
            id: Date.now() + Math.random()
        };
        uploadedFiles.push(fileData);
        displayFile(fileData);
    });
}

// Display uploaded file
function displayFile(fileData) {
    const fileList = document.getElementById('file-list');
    if (!fileList) return;
    
    const fileItem = document.createElement('div');
    fileItem.className = 'file-item';
    fileItem.id = `file-${fileData.id}`;
    fileItem.innerHTML = `
        <span>📎 ${fileData.name} (${formatFileSize(fileData.size)})</span>
        <button type="button" onclick="removeFile(${fileData.id})" class="btn btn-danger btn-sm">Remove</button>
    `;
    fileList.appendChild(fileItem);
}

// Remove file
function removeFile(fileId) {
    uploadedFiles = uploadedFiles.filter(f => f.id !== fileId);
    const fileItem = document.getElementById(`file-${fileId}`);
    if (fileItem) {
        fileItem.remove();
    }
}

// Format file size
function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

// Check duplicate on form change
function checkDuplicateOnChange() {
    const documentType = document.getElementById('documentType').value;
    const email = document.getElementById('email').value.trim();
    const phone = document.getElementById('phone').value.trim();
    const fullName = document.getElementById('fullName').value.trim();
    const birthdate = document.getElementById('birthdate').value;
    
    if (!documentType || !email || !phone || !fullName || !birthdate) {
        return;
    }
    
    const duplicates = checkDuplicateRequest(email, phone, fullName, birthdate, documentType);
    displayDuplicateWarning(duplicates);
}

// Display duplicate warning
function displayDuplicateWarning(duplicates) {
    const warningContainer = document.getElementById('duplicate-warning');
    if (!warningContainer) return;
    
    if (!duplicates || duplicates.length === 0) {
        warningContainer.innerHTML = '';
        return;
    }
    
    const duplicate = duplicates[0];
    const daysAgo = daysSince(duplicate.submittedAt);
    const statusLabel = duplicate.status.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    
    warningContainer.innerHTML = `
        <div class="duplicate-warning">
            <h4>⚠️ Duplicate Request Detected</h4>
            <p>You already have a pending <strong>${duplicate.documentType}</strong> request submitted ${daysAgo} day(s) ago.</p>
            <p><strong>Status:</strong> ${statusLabel}</p>
            <p><strong>Tracking Number:</strong> ${duplicate.trackingNumber}</p>
            <div style="margin-top: 1rem;">
                <a href="tracking.html?tracking=${duplicate.trackingNumber}" class="btn btn-primary btn-sm">View Existing Request</a>
                <button type="button" onclick="proceedAnyway()" class="btn btn-warning btn-sm">Submit Anyway</button>
            </div>
        </div>
    `;
}

// Proceed with duplicate submission
function proceedAnyway() {
    document.getElementById('duplicate-warning').innerHTML = '';
    document.getElementById('request-form').dispatchEvent(new Event('submit'));
}

// Handle request submission
function handleRequestSubmit(e) {
    e.preventDefault();
    const alertContainer = document.getElementById('alert-container');
    
    const documentType = document.getElementById('documentType').value;
    const fullName = document.getElementById('fullName').value.trim();
    const birthdate = document.getElementById('birthdate').value;
    const address = document.getElementById('address').value.trim();
    const email = document.getElementById('email').value.trim();
    const phone = document.getElementById('phone').value.trim();
    const purpose = document.getElementById('purpose').value.trim();
    
    // Validation
    if (!isValidEmail(email)) {
        showAlert('Please enter a valid email address', 'error', alertContainer);
        return;
    }
    
    if (!isValidPhone(phone)) {
        showAlert('Please enter a valid phone number (09XXXXXXXXX or +639XXXXXXXXX)', 'error', alertContainer);
        return;
    }
    
    // Rate limiting check
    const rateLimit = checkRateLimit(email);
    if (!rateLimit.allowed) {
        showAlert(rateLimit.reason, 'error', alertContainer);
        return;
    }
    
    // Check for duplicates
    const duplicates = checkDuplicateRequest(email, phone, fullName, birthdate, documentType);
    if (duplicates && duplicates.length > 0 && !confirm('You already have a pending request for this document. Do you want to submit anyway?')) {
        return;
    }
    
    // Check if user is logged in
    const currentUser = getCurrentUser();
    
    // Generate tracking number
    const trackingNumber = generateTrackingNumber();
    
    // Create request object
    const request = {
        trackingNumber,
        documentType,
        fullName,
        birthdate,
        address,
        email: email.toLowerCase(),
        phone: normalizePhone(phone),
        purpose: purpose || null,
        status: 'pending',
        submittedAt: new Date().toISOString(),
        files: uploadedFiles.map(f => ({ name: f.name, size: f.size })),
        userId: currentUser ? currentUser.id : null
    };
    
    // Save request
    if (currentUser) {
        // Save as user request
        const userRequests = JSON.parse(localStorage.getItem('userRequests') || '[]');
        userRequests.push(request);
        localStorage.setItem('userRequests', JSON.stringify(userRequests));
    } else {
        // Save as guest request
        const guestRequests = JSON.parse(localStorage.getItem('guestRequests') || '[]');
        guestRequests.push(request);
        localStorage.setItem('guestRequests', JSON.stringify(guestRequests));
    }
    
    // Show success message
    showAlert(`Request submitted successfully! Your tracking number is: ${trackingNumber}`, 'success', alertContainer);
    
    // Clear form
    document.getElementById('request-form').reset();
    uploadedFiles = [];
    document.getElementById('file-list').innerHTML = '';
    
    // Redirect to tracking page
    setTimeout(() => {
        redirect(`tracking.html?tracking=${trackingNumber}`);
    }, 2000);
}

// Make functions available globally
window.removeFile = removeFile;
window.proceedAnyway = proceedAnyway;
