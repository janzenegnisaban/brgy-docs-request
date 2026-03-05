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

    // Support legacy users with only fullName
    document.getElementById('lastName').value = profile.lastName || '';
    document.getElementById('firstName').value = profile.firstName || (profile.fullName || '');
    document.getElementById('middleName').value = profile.middleName || '';
    document.getElementById('suffix').value = profile.suffix || '';
    document.getElementById('email').value = profile.email || '';
    document.getElementById('phone').value = profile.phone || '';
    document.getElementById('birthplace').value = profile.birthplace || '';
    document.getElementById('birthdate').value = profile.birthdate || '';
    document.getElementById('sex').value = profile.sex || '';
    document.getElementById('civilStatus').value = profile.civilStatus || '';
    document.getElementById('citizenship').value = profile.citizenship || 'Filipino';
    document.getElementById('profession').value = profile.profession || '';
    document.getElementById('highestEducationAttainment').value = profile.highestEducationAttainment || '';
    document.getElementById('address').value = profile.address || '';

    document.getElementById('profile-form').addEventListener('submit', function(e) {
        e.preventDefault();
        const alertContainer = document.getElementById('alert-container');
        const lastName = document.getElementById('lastName').value.trim();
        const firstName = document.getElementById('firstName').value.trim();
        const middleName = document.getElementById('middleName').value.trim();
        const suffix = document.getElementById('suffix').value.trim();
        const phone = document.getElementById('phone').value.trim();
        const birthplace = document.getElementById('birthplace').value.trim();
        const birthdate = document.getElementById('birthdate').value;
        const sex = document.getElementById('sex').value;
        const civilStatus = document.getElementById('civilStatus').value;
        const citizenship = document.getElementById('citizenship').value.trim();
        const profession = document.getElementById('profession').value.trim();
        const highestEducationAttainment = document.getElementById('highestEducationAttainment').value;
        const address = document.getElementById('address').value.trim();
        const currentPassword = document.getElementById('currentPassword').value;
        const newPassword = document.getElementById('newPassword').value;
        const confirmPassword = document.getElementById('confirmPassword').value;

        if (!lastName || !firstName) {
            showAlert('Last name and first name are required', 'error', alertContainer);
            return;
        }
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

        const fullName = [firstName, middleName, lastName, suffix].filter(Boolean).join(' ');
        profile.lastName = lastName;
        profile.firstName = firstName;
        profile.middleName = middleName;
        profile.suffix = suffix;
        profile.fullName = fullName;
        profile.phone = normalizePhone(phone);
        profile.birthplace = birthplace || null;
        profile.birthdate = birthdate;
        profile.sex = sex || null;
        profile.civilStatus = civilStatus || null;
        profile.citizenship = citizenship || 'Filipino';
        profile.profession = profession || null;
        profile.highestEducationAttainment = highestEducationAttainment || null;
        profile.address = address;
        profile.updatedAt = new Date().toISOString();

        const usersList = JSON.parse(localStorage.getItem('users') || '[]');
        const idx = usersList.findIndex(u => u.id === user.id);
        if (idx >= 0) usersList[idx] = profile;
        localStorage.setItem('users', JSON.stringify(usersList));

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
