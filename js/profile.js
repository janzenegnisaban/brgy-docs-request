// Profile page logic
document.addEventListener('DOMContentLoaded', function() {
    const user = getCurrentUser();
    if (!user) {
        redirect('login.html');
        return;
    }

    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const profile = users.find(u => u.id === user.id);
    if (!profile) {
        showAlert('Profile not found', 'error', document.getElementById('alert-container'));
        return;
    }

    document.getElementById('fullName').value = profile.fullName || '';
    document.getElementById('birthdate').value = profile.birthdate || '';
    document.getElementById('address').value = profile.address || '';
    document.getElementById('email').value = profile.email || '';
    document.getElementById('phone').value = profile.phone || '';

    document.getElementById('profile-form').addEventListener('submit', function(e) {
        e.preventDefault();
        const alertContainer = document.getElementById('alert-container');
        const fullName = document.getElementById('fullName').value.trim();
        const birthdate = document.getElementById('birthdate').value;
        const address = document.getElementById('address').value.trim();
        const phone = document.getElementById('phone').value.trim();
        const currentPassword = document.getElementById('currentPassword').value;
        const newPassword = document.getElementById('newPassword').value;
        const confirmPassword = document.getElementById('confirmPassword').value;

        if (!isValidPhone(phone)) {
            showAlert('Please enter a valid phone number (09XXXXXXXXX or +639XXXXXXXXX)', 'error', alertContainer);
            return;
        }

        if (newPassword) {
            if (newPassword.length < 6) {
                showAlert('New password must be at least 6 characters', 'error', alertContainer);
                return;
            }
            if (profile.password !== currentPassword) {
                showAlert('Current password is incorrect', 'error', alertContainer);
                return;
            }
            if (newPassword !== confirmPassword) {
                showAlert('New passwords do not match', 'error', alertContainer);
                return;
            }
            profile.password = newPassword;
        }

        profile.fullName = fullName;
        profile.birthdate = birthdate;
        profile.address = address;
        profile.phone = normalizePhone(phone);
        profile.updatedAt = new Date().toISOString();

        const users = JSON.parse(localStorage.getItem('users') || '[]');
        const idx = users.findIndex(u => u.id === user.id);
        if (idx >= 0) users[idx] = profile;
        localStorage.setItem('users', JSON.stringify(users));

        localStorage.setItem('currentUser', JSON.stringify({
            id: user.id,
            email: user.email,
            fullName: profile.fullName,
            phone: profile.phone
        }));

        showAlert('Profile updated successfully', 'success', alertContainer);
        document.getElementById('currentPassword').value = '';
        document.getElementById('newPassword').value = '';
        document.getElementById('confirmPassword').value = '';
    });
});
