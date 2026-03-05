// Request Management Logic

let uploadedFiles = [];
let photo2x2File = null;

// Which fields to show and require per document type
var DOCUMENT_FIELDS = {
    'Barangay Clearance': {
        required: ['fullName', 'birthdate', 'address', 'email', 'phone'],
        optional: ['purpose'],
        fileHint: 'Valid ID (front & back), Proof of Residency',
        purposeLabel: 'Purpose of Request (optional)'
    },
    'Certificate of Indigency': {
        required: ['fullName', 'birthdate', 'address', 'email', 'phone', 'purpose'],
        optional: [],
        fileHint: 'Valid ID (front & back), Proof of Residency, Proof of income/indigency if any',
        purposeLabel: 'Reason for requesting (e.g. scholarship, medical assistance) *'
    },
    'Certificate of Residency': {
        required: ['fullName', 'address', 'email', 'phone'],
        optional: ['birthdate', 'purpose'],
        fileHint: 'Proof of Residency (billing, lease, or barangay certification)',
        purposeLabel: 'Purpose of Request (optional)'
    },
    'Business Permit Clearance': {
        required: ['fullName', 'address', 'email', 'phone'],
        optional: ['birthdate', 'purpose'],
        extra: [
            { id: 'businessName', label: 'Business / Trade Name *', type: 'text', required: true },
            { id: 'businessAddress', label: 'Business Address (if different)', type: 'textarea', required: false }
        ],
        fileHint: 'Valid ID, Business registration or DTI docs if available',
        purposeLabel: 'Purpose of Request (optional)'
    },
    'Community Tax Certificate': {
        required: ['fullName', 'birthdate', 'address', 'email', 'phone'],
        optional: ['purpose'],
        fileHint: 'Valid ID (for verification)',
        purposeLabel: 'Purpose of Request (optional)'
    },
    'Other': {
        required: ['fullName', 'birthdate', 'address', 'email', 'phone', 'purpose'],
        optional: [],
        fileHint: 'Valid ID, any supporting documents',
        purposeLabel: 'Specify document needed and purpose *'
    }
};

function getDocumentConfig(docType) {
    return DOCUMENT_FIELDS[docType] || DOCUMENT_FIELDS['Other'];
}

function updateFormForDocument(docType) {
    var config = getDocumentConfig(docType);
    var allFields = ['documentType', 'fullName', 'birthdate', 'address', 'email', 'phone', 'purpose', 'files'];
    var requiredSet = config.required || [];
    var optionalSet = config.optional || [];
    var showSet = requiredSet.concat(optionalSet);
    showSet.push('documentType');
    showSet.push('files');

    allFields.forEach(function(field) {
        var el = document.querySelector('.form-group[data-field="' + field + '"]');
        if (!el) return;
        if (field === 'documentType' || field === 'files') {
            el.style.display = '';
            return;
        }
        var show = showSet.indexOf(field) >= 0;
        el.style.display = show ? '' : 'none';
        var input = el.querySelector('input, textarea, select');
        var label = el.querySelector('label');
        if (input) {
            input.required = requiredSet.indexOf(field) >= 0;
            if (field === 'purpose' && label) {
                label.textContent = config.purposeLabel || 'Purpose of Request';
                if (input.required) label.innerHTML += ' *';
            }
        }
    });

    // Show/hide 2x2 picture field based on document type
    var photo2x2Group = document.getElementById('photo2x2-group');
    var requires2x2 = doesDocRequire2x2(docType);
    if (photo2x2Group) {
        photo2x2Group.style.display = requires2x2 ? '' : 'none';
        var photo2x2Input = document.getElementById('photo2x2-input');
        if (photo2x2Input) {
            photo2x2Input.required = requires2x2;
        }
        // Clear 2x2 picture if document type doesn't require it
        if (!requires2x2) {
            photo2x2File = null;
            var preview = document.getElementById('photo2x2-preview');
            if (preview) preview.innerHTML = '';
        }
    }

    var fileLabel = document.getElementById('file-upload-label');
    var fileHint = document.getElementById('file-upload-hint');
    if (fileLabel) fileLabel.textContent = config.fileHint ? 'Documents to upload' : 'Required Documents';
    if (fileHint) fileHint.textContent = config.fileHint || 'Valid ID, Proof of Residency, etc.';

    var extraContainer = document.getElementById('extra-fields-container');
    if (!extraContainer) return;
    extraContainer.innerHTML = '';
    extraContainer.style.display = 'none';
    if (config.extra && config.extra.length) {
        extraContainer.style.display = '';
        config.extra.forEach(function(f) {
            var div = document.createElement('div');
            div.className = 'form-group';
            div.style.marginBottom = '1rem';
            var label = document.createElement('label');
            label.setAttribute('for', f.id);
            label.textContent = f.label;
            var input = f.type === 'textarea'
                ? document.createElement('textarea')
                : document.createElement('input');
            input.id = input.name = f.id;
            input.type = f.type === 'textarea' ? null : (f.type || 'text');
            if (f.type === 'textarea') input.rows = 2;
            input.required = f.required || false;
            div.appendChild(label);
            div.appendChild(input);
            extraContainer.appendChild(div);
        });
    }
}

document.addEventListener('DOMContentLoaded', function() {
    // Prefill form for logged-in users
    var currentUser = getCurrentUser();
    if (currentUser) {
        var users = JSON.parse(localStorage.getItem('users') || '[]');
        var profile = users.find(function(u) { return u.id === currentUser.id; });
        if (profile) {
            var fullNameEl = document.getElementById('fullName');
            var addressEl = document.getElementById('address');
            var birthdateEl = document.getElementById('birthdate');
            var emailEl = document.getElementById('email');
            var phoneEl = document.getElementById('phone');
            if (fullNameEl) fullNameEl.value = buildFullName(profile);
            if (addressEl) addressEl.value = profile.address || '';
            if (birthdateEl) birthdateEl.value = profile.birthdate || '';
            if (emailEl) emailEl.value = profile.email || '';
            if (phoneEl) phoneEl.value = profile.phone || '';
        }
    }

    var docParam = getQueryParam('doc');
    if (docParam) {
        var select = document.getElementById('documentType');
        if (select) {
            select.value = docParam;
            var subtitle = document.getElementById('form-subtitle');
            if (subtitle) subtitle.textContent = 'Requesting: ' + docParam;
        }
        updateFormForDocument(docParam);
    }

    var documentTypeSelect = document.getElementById('documentType');
    if (documentTypeSelect) {
        documentTypeSelect.addEventListener('change', function() {
            var docType = documentTypeSelect.value;
            var subtitle = document.getElementById('form-subtitle');
            if (subtitle) subtitle.textContent = docType ? 'Requesting: ' + docType : '';
            updateFormForDocument(docType || 'Other');
            checkDuplicateOnChange();
        });
    }

    var requestForm = document.getElementById('request-form');
    if (requestForm) {
        requestForm.addEventListener('submit', handleRequestSubmit);
        checkDuplicateOnChange();
    }
    setupFileUpload();
    setupPhoto2x2Upload();
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

// Setup 2x2 photo upload
function setupPhoto2x2Upload() {
    const uploadArea = document.getElementById('photo2x2-upload-area');
    const photoInput = document.getElementById('photo2x2-input');
    const preview = document.getElementById('photo2x2-preview');
    
    if (!uploadArea || !photoInput) return;
    
    uploadArea.addEventListener('click', () => photoInput.click());
    
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
        if (files.length > 0) {
            handlePhoto2x2(files[0]);
        }
    });
    
    photoInput.addEventListener('change', (e) => {
        if (e.target.files.length > 0) {
            handlePhoto2x2(e.target.files[0]);
        }
    });
}

// Handle 2x2 photo upload
function handlePhoto2x2(file) {
    if (!file.type || file.type.indexOf('image/') !== 0) {
        showAlert('Please upload an image file for the 2x2 picture', 'error');
        return;
    }
    
    photo2x2File = {
        name: file.name,
        size: file.size,
        type: file.type,
        id: Date.now() + Math.random()
    };
    
    // Create preview
    const reader = new FileReader();
    reader.onload = function(e) {
        const preview = document.getElementById('photo2x2-preview');
        if (preview) {
            preview.innerHTML = `
                <div style="display: flex; align-items: center; gap: 1rem; padding: 1rem; background: var(--bg-light); border-radius: 0.5rem; border: 2px solid var(--primary-color);">
                    <img src="${e.target.result}" alt="2x2 Preview" style="width: 100px; height: 100px; object-fit: cover; border-radius: 0.25rem; border: 2px solid var(--border-color);">
                    <div style="flex: 1;">
                        <div style="font-weight: 600; color: var(--text-dark); margin-bottom: 0.25rem;">${file.name}</div>
                        <div style="font-size: 0.875rem; color: var(--text-light);">${formatFileSize(file.size)}</div>
                        <button type="button" onclick="removePhoto2x2()" class="btn btn-danger btn-sm" style="margin-top: 0.5rem;">Remove</button>
                    </div>
                </div>
            `;
        }
    };
    reader.readAsDataURL(file);
    
    // Store file data for submission
    resizeImageFileToDataUrl(file, { maxWidth: 600, maxHeight: 600, quality: 0.9 }).then(function(dataUrl) {
        photo2x2File.dataUrl = dataUrl;
    }).catch(function(err) {
        console.error('Error processing image:', err);
    });
}

// Remove 2x2 photo
function removePhoto2x2() {
    photo2x2File = null;
    const preview = document.getElementById('photo2x2-preview');
    if (preview) preview.innerHTML = '';
    const photoInput = document.getElementById('photo2x2-input');
    if (photoInput) photoInput.value = '';
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
    
    // Validate 2x2 picture for documents that require it
    if (doesDocRequire2x2(documentType)) {
        if (!photo2x2File || !photo2x2File.dataUrl) {
            showAlert('A 2x2 picture is required for Barangay Clearance before proceeding. Please upload your 2x2 picture.', 'error', alertContainer);
            return;
        }
    }
    
    // Check if user is logged in
    const currentUser = getCurrentUser();
    
    // Generate tracking number
    const trackingNumber = generateTrackingNumber();
    
    var config = getDocumentConfig(documentType);
    var extraData = {};
    if (config.extra && config.extra.length) {
        config.extra.forEach(function(f) {
            var el = document.getElementById(f.id);
            if (el && el.value) extraData[f.id] = el.value.trim();
        });
    }

    var request = {
        trackingNumber: trackingNumber,
        documentType: documentType,
        fullName: fullName,
        birthdate: birthdate || null,
        address: address,
        email: email.toLowerCase(),
        phone: normalizePhone(phone),
        purpose: purpose || null,
        status: 'pending',
        submittedAt: new Date().toISOString(),
        files: uploadedFiles.map(function(f) { return { name: f.name, size: f.size }; }),
        userId: currentUser ? currentUser.id : null
    };
    if (Object.keys(extraData).length) request.extra = extraData;
    
    // Add 2x2 picture if required and uploaded
    if (doesDocRequire2x2(documentType) && photo2x2File && photo2x2File.dataUrl) {
        request.photo2x2 = {
            name: photo2x2File.name,
            size: photo2x2File.size,
            type: photo2x2File.type,
            dataUrl: photo2x2File.dataUrl
        };
    }
    
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
    photo2x2File = null;
    document.getElementById('file-list').innerHTML = '';
    const photo2x2Preview = document.getElementById('photo2x2-preview');
    if (photo2x2Preview) photo2x2Preview.innerHTML = '';
    
    // Redirect to tracking page
    setTimeout(() => {
        redirect(`tracking.html?tracking=${trackingNumber}`);
    }, 2000);
}

// Make functions available globally
window.removeFile = removeFile;
window.proceedAnyway = proceedAnyway;
window.removePhoto2x2 = removePhoto2x2;
