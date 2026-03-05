// Authentication Logic

document.addEventListener('DOMContentLoaded', function() {
    // Login form
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }
    
    // Registration form
    const registerForm = document.getElementById('register-form');
    if (registerForm) {
        registerForm.addEventListener('submit', handleRegister);
        
        // Check for guest requests on email/phone change
        const emailInput = document.getElementById('email');
        const phoneInput = document.getElementById('phone');
        
        if (emailInput) {
            emailInput.addEventListener('blur', checkForGuestRequests);
        }
        if (phoneInput) {
            phoneInput.addEventListener('blur', checkForGuestRequests);
        }
        
        // Check for claim parameter
        const claimTracking = getQueryParam('claim');
        if (claimTracking) {
            checkForGuestRequests();
        }
    }
});

// Handle login
function handleLogin(e) {
    e.preventDefault();
    const alertContainer = document.getElementById('alert-container');
    
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    
    if (!isValidEmail(email)) {
        showAlert('Please enter a valid email address', 'error', alertContainer);
        return;
    }
    
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    
    if (!user) {
        showAlert('Invalid email or password', 'error', alertContainer);
        return;
    }
    
    // Simple password check (in production, use proper hashing)
    if (user.password !== password) {
        showAlert('Invalid email or password', 'error', alertContainer);
        return;
    }
    
    // Set current user (use buildFullName so name is correct for both legacy and new users)
    localStorage.setItem('currentUser', JSON.stringify({
        id: user.id,
        email: user.email,
        fullName: buildFullName(user),
        phone: user.phone
    }));
    
    showAlert('Login successful! Redirecting...', 'success', alertContainer);
    setTimeout(() => {
        redirect('dashboard.html');
    }, 1000);
}

// Handle registration
function handleRegister(e) {
    e.preventDefault();
    const alertContainer = document.getElementById('alert-container');
    
    const lastName = document.getElementById('lastName').value.trim();
    const firstName = document.getElementById('firstName').value.trim();
    const middleName = document.getElementById('middleName').value.trim();
    const suffix = document.getElementById('suffix').value.trim();
    const email = document.getElementById('email').value.trim();
    const phone = document.getElementById('phone').value.trim();
    const birthplace = document.getElementById('birthplace').value.trim();
    const birthdate = document.getElementById('birthdate').value;
    const sex = document.getElementById('sex').value;
    const civilStatus = document.getElementById('civilStatus').value;
    const citizenship = document.getElementById('citizenship').value.trim();
    const profession = document.getElementById('profession').value.trim();
    const highestEducationAttainment = document.getElementById('highestEducationAttainment').value;
    const address = document.getElementById('address').value.trim();
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    
    // Validation
    if (!lastName || !firstName) {
        showAlert('Last name and first name are required', 'error', alertContainer);
        return;
    }
    if (!isValidEmail(email)) {
        showAlert('Please enter a valid email address', 'error', alertContainer);
        return;
    }
    if (!isValidPhone(phone)) {
        showAlert('Please enter a valid phone number (09XXXXXXXXX or +639XXXXXXXXX)', 'error', alertContainer);
        return;
    }
    if (password.length < 6) {
        showAlert('Password must be at least 6 characters', 'error', alertContainer);
        return;
    }
    if (password !== confirmPassword) {
        showAlert('Passwords do not match', 'error', alertContainer);
        return;
    }
    
    // Check if user already exists
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    if (users.find(u => u.email.toLowerCase() === email.toLowerCase())) {
        showAlert('An account with this email already exists', 'error', alertContainer);
        return;
    }
    
    // Build fullName for backward compatibility (request form, display)
    const fullName = [firstName, middleName, lastName, suffix].filter(Boolean).join(' ');
    
    // Create new user
    const newUser = {
        id: Date.now().toString(),
        lastName,
        firstName,
        middleName,
        suffix,
        fullName,
        email: email.toLowerCase(),
        phone: normalizePhone(phone),
        birthplace: birthplace || null,
        birthdate,
        sex: sex || null,
        civilStatus: civilStatus || null,
        citizenship: citizenship || 'Filipino',
        profession: profession || null,
        highestEducationAttainment: highestEducationAttainment || null,
        address,
        password, // In production, hash this
        createdAt: new Date().toISOString()
    };
    
    users.push(newUser);
    localStorage.setItem('users', JSON.stringify(users));
    
    // Check for guest requests to claim
    const guestRequests = JSON.parse(localStorage.getItem('guestRequests') || '[]');
    const matchingRequests = guestRequests.filter(req => 
        (req.email && req.email.toLowerCase() === email.toLowerCase()) ||
        (req.phone && normalizePhone(req.phone) === normalizePhone(phone))
    );
    
    if (matchingRequests.length > 0) {
        // Show claim prompt
        showClaimPrompt(matchingRequests, newUser.id);
    } else {
        // Login and redirect
        localStorage.setItem('currentUser', JSON.stringify({
            id: newUser.id,
            email: newUser.email,
            fullName: newUser.fullName,
            phone: newUser.phone
        }));
        
        showAlert('Registration successful! Redirecting...', 'success', alertContainer);
        setTimeout(() => {
            redirect('dashboard.html');
        }, 1000);
    }
}

// Check for guest requests
function checkForGuestRequests() {
    const email = document.getElementById('email')?.value.trim();
    const phone = document.getElementById('phone')?.value.trim();
    
    if (!email && !phone) return;
    
    const guestRequests = JSON.parse(localStorage.getItem('guestRequests') || '[]');
    const matchingRequests = guestRequests.filter(req => 
        (email && req.email && req.email.toLowerCase() === email.toLowerCase()) ||
        (phone && req.phone && normalizePhone(req.phone) === normalizePhone(phone))
    );
    
    if (matchingRequests.length > 0) {
        showGuestRequestsFound(matchingRequests);
    }
}

// Show guest requests found
function showGuestRequestsFound(requests) {
    const container = document.getElementById('claim-requests-container');
    if (!container) return;
    
    const pendingRequests = requests.filter(r => r.status !== 'completed' && r.status !== 'rejected');
    
    if (pendingRequests.length === 0) return;
    
    container.innerHTML = `
        <div class="alert alert-info">
            <h4>Found ${pendingRequests.length} pending request(s) under your email/phone:</h4>
            <ul style="margin: 0.5rem 0; padding-left: 1.5rem;">
                ${pendingRequests.map(req => `
                    <li>${req.documentType} (Submitted: ${formatDate(req.submittedAt)}) - Status: ${req.status}</li>
                `).join('')}
            </ul>
            <p style="margin-top: 0.5rem;">After registration, you can claim these requests to manage them in your account.</p>
        </div>
    `;
}

// Show claim prompt after registration
function showClaimPrompt(requests, userId) {
    const container = document.getElementById('claim-requests-container');
    if (!container) return;
    
    const pendingRequests = requests.filter(r => r.status !== 'completed' && r.status !== 'rejected');
    
    if (pendingRequests.length === 0) {
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        const newUser = users.find(u => u.id === userId);
        const fullName = newUser ? buildFullName(newUser) : [document.getElementById('firstName').value.trim(), document.getElementById('middleName').value.trim(), document.getElementById('lastName').value.trim(), document.getElementById('suffix').value.trim()].filter(Boolean).join(' ');
        localStorage.setItem('currentUser', JSON.stringify({
            id: userId,
            email: document.getElementById('email').value.trim(),
            fullName: fullName,
            phone: normalizePhone(document.getElementById('phone').value.trim())
        }));
        redirect('dashboard.html');
        return;
    }
    
    container.innerHTML = `
        <div class="alert alert-info">
            <h4>Welcome! We found ${pendingRequests.length} pending request(s) under your email/phone:</h4>
            <ul style="margin: 0.5rem 0; padding-left: 1.5rem;">
                ${pendingRequests.map(req => `
                    <li><strong>${req.documentType}</strong> (Submitted: ${formatDate(req.submittedAt)}) - Status: ${req.status}</li>
                `).join('')}
            </ul>
            <div style="margin-top: 1rem;">
                <button onclick="claimGuestRequests('${userId}')" class="btn btn-primary">Claim These Requests</button>
                <button onclick="skipClaim('${userId}')" class="btn btn-secondary">Skip</button>
            </div>
        </div>
    `;
}

// Claim guest requests
function claimGuestRequests(userId) {
    const email = document.getElementById('email').value.trim();
    const phone = normalizePhone(document.getElementById('phone').value.trim());
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const newUser = users.find(u => u.id === userId);
    const fullName = newUser ? buildFullName(newUser) : [document.getElementById('firstName').value.trim(), document.getElementById('middleName').value.trim(), document.getElementById('lastName').value.trim(), document.getElementById('suffix').value.trim()].filter(Boolean).join(' ');
    
    const guestRequests = JSON.parse(localStorage.getItem('guestRequests') || '[]');
    const userRequests = JSON.parse(localStorage.getItem('userRequests') || '[]');
    
    // Find matching guest requests
    const matchingRequests = guestRequests.filter(req => 
        (req.email && req.email.toLowerCase() === email.toLowerCase()) ||
        (req.phone && normalizePhone(req.phone) === phone)
    );
    
    // Convert to user requests
    matchingRequests.forEach(guestReq => {
        const userReq = {
            ...guestReq,
            userId: userId,
            claimedAt: new Date().toISOString()
        };
        userRequests.push(userReq);
        
        // Remove from guest requests
        const index = guestRequests.findIndex(r => r.trackingNumber === guestReq.trackingNumber);
        if (index > -1) {
            guestRequests.splice(index, 1);
        }
    });
    
    localStorage.setItem('guestRequests', JSON.stringify(guestRequests));
    localStorage.setItem('userRequests', JSON.stringify(userRequests));
    
    // Set current user
    localStorage.setItem('currentUser', JSON.stringify({
        id: userId,
        email: email,
        fullName: fullName,
        phone: phone
    }));
    
    showAlert('Requests claimed successfully!', 'success', document.getElementById('alert-container'));
    setTimeout(() => {
        redirect('dashboard.html');
    }, 1000);
}

// Skip claiming
function skipClaim(userId) {
    const email = document.getElementById('email').value.trim();
    const phone = normalizePhone(document.getElementById('phone').value.trim());
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const newUser = users.find(u => u.id === userId);
    const fullName = newUser ? buildFullName(newUser) : [document.getElementById('firstName').value.trim(), document.getElementById('middleName').value.trim(), document.getElementById('lastName').value.trim(), document.getElementById('suffix').value.trim()].filter(Boolean).join(' ');
    
    localStorage.setItem('currentUser', JSON.stringify({
        id: userId,
        email: email,
        fullName: fullName,
        phone: phone
    }));
    
    redirect('dashboard.html');
}

// Make functions available globally
window.claimGuestRequests = claimGuestRequests;
window.skipClaim = skipClaim;
