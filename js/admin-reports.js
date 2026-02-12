document.addEventListener('DOMContentLoaded', function() {
    if (!localStorage.getItem('adminUser')) {
        window.location.href = 'admin-login.html';
        return;
    }
    loadReports();
});

function loadReports() {
    const guestRequests = JSON.parse(localStorage.getItem('guestRequests') || '[]');
    const userRequests = JSON.parse(localStorage.getItem('userRequests') || '[]');
    const all = [...guestRequests, ...userRequests];

    document.getElementById('r-total').textContent = all.length;
    const completed = all.filter(r => r.status === 'completed');
    document.getElementById('r-completed').textContent = completed.length;

    let totalDays = 0;
    let countWithDate = 0;
    completed.forEach(r => {
        if (r.updatedAt) {
            const submitted = new Date(r.submittedAt);
            const updated = new Date(r.updatedAt);
            totalDays += Math.round((updated - submitted) / (1000 * 60 * 60 * 24));
            countWithDate++;
        }
    });
    const avgDays = countWithDate ? (totalDays / countWithDate).toFixed(1) : '-';
    document.getElementById('r-avg-days').textContent = avgDays;

    const byType = {};
    all.forEach(r => {
        byType[r.documentType] = (byType[r.documentType] || 0) + 1;
    });
    const tbody1 = document.querySelector('#report-by-type tbody');
    tbody1.innerHTML = '';
    Object.entries(byType).forEach(([type, count]) => {
        const pct = all.length ? ((count / all.length) * 100).toFixed(1) : 0;
        tbody1.innerHTML += `<tr><td>${type}</td><td>${count}</td><td>${pct}%</td></tr>`;
    });

    const byStatus = {};
    all.forEach(r => {
        const s = r.status.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
        byStatus[s] = (byStatus[s] || 0) + 1;
    });
    const tbody2 = document.querySelector('#report-by-status tbody');
    tbody2.innerHTML = '';
    Object.entries(byStatus).forEach(([status, count]) => {
        tbody2.innerHTML += `<tr><td>${status}</td><td>${count}</td></tr>`;
    });

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const recent = all.filter(r => new Date(r.submittedAt) >= thirtyDaysAgo).length;
    document.getElementById('recent-activity').textContent = `${recent} requests in the last 30 days`;
}

window.loadReports = loadReports;
