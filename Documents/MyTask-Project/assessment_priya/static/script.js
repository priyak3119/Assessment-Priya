const kpiKeys = ['process_maturity', 'process_health', 'op_efficiency', 'cost_to_serve'];
const sparkData = {
    process_maturity: [2, 3, 2, 4, 3, 5, 4],
    process_health: [60, 62, 64, 68, 69, 72, 76],
    op_efficiency: [55, 58, 60, 63, 65, 67, 68],
    cost_to_serve: [950, 940, 930, 925, 922, 920, 920],
};

function createSparkline(containerId, values) {
    const container = document.getElementById(containerId);
    if (!container) return;
    container.innerHTML = '';
    const max = Math.max(...values);
    values.forEach((value) => {
        const bar = document.createElement('div');
        bar.style.height = `${Math.round((value / max) * 100)}%`;
        container.appendChild(bar);
    });
}

function setTrendText(elementId, trendText) {
    const element = document.getElementById(elementId);
    if (!element) return;
    const isNegative = trendText.trim().startsWith('-');
    const symbol = isNegative ? '▼' : '▲';
    element.innerHTML = `<span>${symbol}</span><span>${trendText}</span>`;
    element.classList.toggle('positive', !isNegative);
    element.classList.toggle('negative', isNegative);
}

function formatDateLabel() {
    const label = document.getElementById('header-date');
    if (!label) return;
    const date = new Date();
    const options = { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' };
    label.textContent = date.toLocaleDateString('en-US', options);
}

function renderKpiTiles(data) {
    const mapping = {
        process_maturity: { valueId: 'maturity-value', trendId: 'maturity-trend', sparkId: 'maturity-spark', unitId: null },
        process_health: { valueId: 'health-value', trendId: 'health-trend', sparkId: 'health-spark', unitId: null },
        op_efficiency: { valueId: 'efficiency-value', trendId: 'efficiency-trend', sparkId: 'efficiency-spark', unitId: null },
        cost_to_serve: { valueId: 'cost-value', trendId: 'cost-trend', sparkId: 'cost-spark', unitId: null },
    };

    kpiKeys.forEach((key) => {
        const config = mapping[key];
        const item = data[key];
        if (!item) return;
        const valueEl = document.getElementById(config.valueId);
        const trendEl = document.getElementById(config.trendId);
        if (valueEl) valueEl.textContent = item.value;
        if (trendEl) setTrendText(config.trendId, item.trend);
        createSparkline(config.sparkId, sparkData[key]);
    });
}

function renderRoadmap(roadmap) {
    const container = document.getElementById('roadmap-list');
    container.innerHTML = '';
    roadmap.forEach((item) => {
        const row = document.createElement('div');
        row.className = 'roadmap-item';
        const statusClass = item.status === 'ON TRACK' ? 'status-ontrack' : item.status === 'IN BUILD' ? 'status-inbuild' : 'status-planned';
        row.innerHTML = `
            <div class="roadmap-row">
                <div>
                    <div class="roadmap-name">${item.name}</div>
                    <div class="progress-bar"><div class="progress-fill" style="width:${item.progress}%"></div></div>
                </div>
                <div class="roadmap-status ${statusClass}">${item.status}</div>
            </div>
            <div class="progress-label"><span>${item.progress}% Complete</span><span>${item.status}</span></div>
        `;
        container.appendChild(row);
    });
}

function renderCharts(dashboard) {
    const weeks = dashboard.weekly_health.weeks;
    const healthCtx = document.getElementById('healthLineChart').getContext('2d');
    const actionsCtx = document.getElementById('actionsBarChart').getContext('2d');
    const initiativeCtx = document.getElementById('initiativeChart').getContext('2d');

    const healthChart = new Chart(healthCtx, {
        type: 'line',
        data: {
            labels: weeks,
            datasets: [
                {
                    label: 'This month',
                    data: dashboard.weekly_health.this_month,
                    borderColor: '#2563eb',
                    backgroundColor: 'rgba(37, 99, 235, 0.08)',
                    borderWidth: 3,
                    tension: 0.3,
                    pointRadius: 4,
                    pointBackgroundColor: '#2563eb',
                },
                {
                    label: 'Last month',
                    data: dashboard.weekly_health.last_month,
                    borderColor: '#94a3b8',
                    borderDash: [8, 5],
                    backgroundColor: 'transparent',
                    borderWidth: 2,
                    tension: 0.3,
                    pointRadius: 0,
                },
            ],
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    min: 50,
                    max: 90,
                    ticks: { color: '#64748b' },
                    grid: { color: '#e2e8f0' },
                },
                x: {
                    ticks: { color: '#64748b' },
                    grid: { display: false },
                },
            },
            plugins: { legend: { display: false } },
        },
    });

    const actionsChart = new Chart(actionsCtx, {
        type: 'bar',
        data: {
            labels: weeks,
            datasets: [{
                label: 'Actions',
                data: dashboard.improvement_actions.weekly_counts,
                backgroundColor: '#60a5fa',
                borderRadius: 8,
                maxBarThickness: 25,
            }],
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: { color: '#64748b' },
                    grid: { color: '#e2e8f0' },
                },
                x: {
                    ticks: { color: '#64748b' },
                    grid: { display: false },
                },
            },
            plugins: { legend: { display: false } },
        },
    });

    const initiativeDatasets = Object.keys(dashboard.initiatives.data).map((func, index) => {
        const colors = ['#2563eb', '#14b8a6', '#ef4444'];
        return {
            label: func,
            data: dashboard.initiatives.data[func],
            borderColor: colors[index],
            backgroundColor: 'transparent',
            tension: 0.3,
            pointRadius: 4,
            pointBackgroundColor: colors[index],
            borderWidth: 3,
        };
    });

    new Chart(initiativeCtx, {
        type: 'line',
        data: { labels: weeks, datasets: initiativeDatasets },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: { color: '#64748b' },
                    grid: { color: '#e2e8f0' },
                },
                x: {
                    ticks: { color: '#64748b' },
                    grid: { display: false },
                },
            },
            plugins: { legend: { position: 'bottom' } },
        },
    });

    document.getElementById('actions-prev').textContent = dashboard.improvement_actions.previous_period;
    document.getElementById('actions-total').textContent = dashboard.improvement_actions.total;
    document.getElementById('completed-count').textContent = dashboard.improvement_actions.completed;
    document.getElementById('inprogress-count').textContent = dashboard.improvement_actions.in_progress;
    document.getElementById('overdue-count').textContent = dashboard.improvement_actions.overdue;
    document.getElementById('roi-value').textContent = `${dashboard.roi.value}${dashboard.roi.unit}`;
    document.getElementById('roi-trend').textContent = dashboard.roi.trend;
    document.getElementById('health-current').textContent = dashboard.weekly_health.this_month.slice(-1)[0];
    renderRoadmap(dashboard.roadmap);
}

async function loadData() {
    formatDateLabel();

    try {
        const kpiRes = await fetch('/api/kpi');
        const kpiData = await kpiRes.json();
        renderKpiTiles(kpiData);
    } catch (error) {
        console.error('Failed to load KPI data', error);
    }

    try {
        const dashboardRes = await fetch('/api/dashboard');
        const dashboardData = await dashboardRes.json();
        renderCharts(dashboardData);
    } catch (error) {
        console.error('Failed to load dashboard data', error);
    }
}

window.addEventListener('DOMContentLoaded', loadData);
