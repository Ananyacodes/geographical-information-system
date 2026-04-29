// Global variables
let currentPage = 'dashboard';

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    loadPage('dashboard');
    setupEventListeners();
});

function setupEventListeners() {
    // Navigation
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const page = this.getAttribute('data-page');
            loadPage(page);
            
            // Update active state
            document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
            this.classList.add('active');
        });
    });
    
    // Modal close
    document.querySelector('.close-btn')?.addEventListener('click', closeModal);
    window.addEventListener('click', function(e) {
        const modal = document.getElementById('modal');
        if (e.target === modal) closeModal();
    });
}

function closeModal() {
    document.getElementById('modal').style.display = 'none';
}

async function loadPage(page) {
    currentPage = page;
    const contentArea = document.getElementById('content-area');
    const pageTitle = document.getElementById('page-title');
    
    contentArea.innerHTML = '<div class="loader">Loading...</div>';
    
    switch(page) {
        case 'dashboard':
            pageTitle.innerText = 'Dashboard';
            await loadDashboard();
            break;
        case 'regions':
            pageTitle.innerText = 'Manage Regions';
            await loadRegions();
            break;
        case 'locations':
            pageTitle.innerText = 'Manage Locations';
            await loadLocations();
            break;
        case 'features':
            pageTitle.innerText = 'Geographical Features';
            await loadFeatures();
            break;
        case 'infrastructure':
            pageTitle.innerText = 'Infrastructure';
            await loadInfrastructure();
            break;
        case 'queries':
            pageTitle.innerText = 'Advanced Queries';
            await loadQueries();
            break;
        case 'transactions':
            pageTitle.innerText = 'Transaction Management (ACID)';
            await loadTransactions();
            break;
        case 'views':
            pageTitle.innerText = 'Database Views';
            await loadViews();
            break;
        case 'functions':
            pageTitle.innerText = 'Functions & Triggers';
            await loadFunctions();
            break;
    }
}

// ============= DASHBOARD =============
async function loadDashboard() {
    const response = await fetch('php/dashboard.php');
    const data = await response.json();
    
    const html = `
        <div class="stats-grid">
            <div class="stat-card">
                <div class="stat-icon">🗺️</div>
                <div class="stat-number">${data.totalRegions || 0}</div>
                <div class="stat-label">Total Regions</div>
            </div>
            <div class="stat-card">
                <div class="stat-icon">📍</div>
                <div class="stat-number">${data.totalLocations || 0}</div>
                <div class="stat-label">Total Locations</div>
            </div>
            <div class="stat-card">
                <div class="stat-icon">⛰️</div>
                <div class="stat-number">${data.totalFeatures || 0}</div>
                <div class="stat-label">Geographical Features</div>
            </div>
            <div class="stat-card">
                <div class="stat-icon">🏗️</div>
                <div class="stat-number">${data.totalInfrastructure || 0}</div>
                <div class="stat-label">Infrastructure Units</div>
            </div>
        </div>
        <div class="data-card">
            <div class="card-header">
                <h3>Recent Regions</h3>
            </div>
            <div class="data-table">
                <table>
                    <thead>
                        <tr><th>ID</th><th>Name</th><th>Type</th><th>Area (sq km)</th></tr>
                    </thead>
                    <tbody>
                        ${data.recentRegions?.map(r => `
                            <tr><td>${r.Region_ID}</td><td>${r.Region_Name}</td><td>${r.Region_Type}</td><td>${r.Area}</td></tr>
                        `).join('') || '<tr><td colspan="4">No data</td></tr>'}
                    </tbody>
                </table>
            </div>
        </div>
    `;
    document.getElementById('content-area').innerHTML = html;
}

// ============= REGIONS =============
async function loadRegions() {
    const response = await fetch('php/regions.php?action=get');
    const regions = await response.json();
    
    const html = `
        <div style="margin-bottom: 20px;">
            <button class="btn btn-primary" onclick="showAddRegionForm()">+ Add New Region</button>
        </div>
        <div class="data-card">
            <div class="data-table">
                <table>
                    <thead>
                        <tr>
                            <th>Region ID</th><th>Region Name</th><th>Region Type</th><th>Area</th><th>Description</th><th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${regions.map(r => `
                            <tr>
                                <td>${r.Region_ID}</td>
                                <td>${r.Region_Name}</td>
                                <td>${r.Region_Type}</td>
                                <td>${r.Area}</td>
                                <td>${r.Description || '-'}</td>
                                <td>
                                    <button class="btn btn-danger btn-sm" onclick="deleteRegion(${r.Region_ID})">Delete</button>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        </div>
    `;
    document.getElementById('content-area').innerHTML = html;
}

function showAddRegionForm() {
    const modal = document.getElementById('modal');
    const modalBody = document.getElementById('modal-body');
    document.getElementById('modal-title').innerText = 'Add New Region';
    
    modalBody.innerHTML = `
        <form id="regionForm">
            <div class="form-group">
                <label>Region ID</label>
                <input type="number" name="Region_ID" required>
            </div>
            <div class="form-group">
                <label>Region Name</label>
                <input type="text" name="Region_Name" required>
            </div>
            <div class="form-group">
                <label>Region Type</label>
                <select name="Region_Type">
                    <option value="Urban">Urban</option>
                    <option value="Rural">Rural</option>
                    <option value="Agricultural">Agricultural</option>
                    <option value="Tourism">Tourism</option>
                    <option value="Forest">Forest</option>
                </select>
            </div>
            <div class="form-group">
                <label>Area (sq km)</label>
                <input type="number" step="0.01" name="Area" required>
            </div>
            <div class="form-group">
                <label>Description</label>
                <textarea name="Description" rows="3"></textarea>
            </div>
            <button type="submit" class="btn btn-primary">Save Region</button>
        </form>
    `;
    
    modal.style.display = 'block';
    
    document.getElementById('regionForm').addEventListener('submit', async function(e) {
        e.preventDefault();
        const formData = new FormData(this);
        const response = await fetch('php/regions.php?action=add', {
            method: 'POST',
            body: formData
        });
        const result = await response.json();
        if (result.success) {
            alert('Region added successfully!');
            closeModal();
            loadRegions();
        } else {
            alert('Error: ' + result.message);
        }
    });
}

async function deleteRegion(id) {
    if (confirm('Delete this region? This will also delete associated locations.')) {
        const response = await fetch(`php/regions.php?action=delete&id=${id}`);
        const result = await response.json();
        if (result.success) {
            alert('Region deleted');
            loadRegions();
        } else {
            alert('Error: ' + result.message);
        }
    }
}

// ============= LOCATIONS =============
async function loadLocations() {
    const response = await fetch('php/locations.php?action=get');
    const locations = await response.json();
    
    const html = `
        <div style="margin-bottom: 20px;">
            <button class="btn btn-primary" onclick="showAddLocationForm()">+ Add New Location</button>
        </div>
        <div class="data-card">
            <div class="data-table">
                <table>
                    <thead>
                        <tr>
                            <th>Location ID</th><th>Latitude</th><th>Longitude</th><th>Elevation</th><th>Region ID</th><th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${locations.map(l => `
                            <tr>
                                <td>${l.Location_ID}</td>
                                <td>${l.Latitude}</td>
                                <td>${l.Longitude}</td>
                                <td>${l.Elevation}</td>
                                <td>${l.Region_ID}</td>
                                <td>
                                    <button class="btn btn-danger btn-sm" onclick="deleteLocation(${l.Location_ID})">Delete</button>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        </div>
    `;
    document.getElementById('content-area').innerHTML = html;
}

function showAddLocationForm() {
    // First get regions for dropdown
    fetch('php/regions.php?action=get')
        .then(response => response.json())
        .then(regions => {
            const modal = document.getElementById('modal');
            const modalBody = document.getElementById('modal-body');
            document.getElementById('modal-title').innerText = 'Add New Location';
            
            modalBody.innerHTML = `
                <form id="locationForm">
                    <div class="form-group">
                        <label>Location ID</label>
                        <input type="number" name="Location_ID" required>
                    </div>
                    <div class="form-group">
                        <label>Latitude</label>
                        <input type="number" step="any" name="Latitude" required>
                    </div>
                    <div class="form-group">
                        <label>Longitude</label>
                        <input type="number" step="any" name="Longitude" required>
                    </div>
                    <div class="form-group">
                        <label>Elevation (meters)</label>
                        <input type="number" step="any" name="Elevation" required>
                    </div>
                    <div class="form-group">
                        <label>Region</label>
                        <select name="Region_ID" required>
                            <option value="">Select Region</option>
                            ${regions.map(r => `<option value="${r.Region_ID}">${r.Region_Name}</option>`).join('')}
                        </select>
                    </div>
                    <button type="submit" class="btn btn-primary">Save Location</button>
                </form>
            `;
            
            modal.style.display = 'block';
            
            document.getElementById('locationForm').addEventListener('submit', async function(e) {
                e.preventDefault();
                const formData = new FormData(this);
                const response = await fetch('php/locations.php?action=add', {
                    method: 'POST',
                    body: formData
                });
                const result = await response.json();
                if (result.success) {
                    alert('Location added!');
                    closeModal();
                    loadLocations();
                } else {
                    alert('Error: ' + result.message);
                }
            });
        });
}

async function deleteLocation(id) {
    if (confirm('Delete this location?')) {
        const response = await fetch(`php/locations.php?action=delete&id=${id}`);
        const result = await response.json();
        if (result.success) {
            alert('Location deleted');
            loadLocations();
        } else {
            alert('Error: ' + result.message);
        }
    }
}

// ============= FEATURES =============
async function loadFeatures() {
    const response = await fetch('php/features.php?action=get');
    const features = await response.json();
    
    const html = `
        <div style="margin-bottom: 20px;">
            <button class="btn btn-primary" onclick="showAddFeatureForm()">+ Add New Feature</button>
        </div>
        <div class="data-card">
            <div class="data-table">
                <table>
                    <thead>
                        <tr>
                            <th>Feature ID</th><th>Feature Name</th><th>Feature Type</th><th>Region ID</th><th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${features.map(f => `
                            <tr>
                                <td>${f.Feature_ID}</td>
                                <td>${f.Feature_Name}</td>
                                <td>${f.Feature_Type}</td>
                                <td>${f.Region_ID}</td>
                                <td>
                                    <button class="btn btn-danger btn-sm" onclick="deleteFeature(${f.Feature_ID})">Delete</button>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        </div>
    `;
    document.getElementById('content-area').innerHTML = html;
}

function showAddFeatureForm() {
    fetch('php/regions.php?action=get')
        .then(response => response.json())
        .then(regions => {
            const modal = document.getElementById('modal');
            const modalBody = document.getElementById('modal-body');
            document.getElementById('modal-title').innerText = 'Add New Geographical Feature';
            
            modalBody.innerHTML = `
                <form id="featureForm">
                    <div class="form-group">
                        <label>Feature ID</label>
                        <input type="number" name="Feature_ID" required>
                    </div>
                    <div class="form-group">
                        <label>Feature Name</label>
                        <input type="text" name="Feature_Name" required>
                    </div>
                    <div class="form-group">
                        <label>Feature Type</label>
                        <select name="Feature_Type">
                            <option value="River">River</option>
                            <option value="Lake">Lake</option>
                            <option value="Mountain">Mountain</option>
                            <option value="Forest">Forest</option>
                            <option value="Desert">Desert</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Region</label>
                        <select name="Region_ID" required>
                            <option value="">Select Region</option>
                            ${regions.map(r => `<option value="${r.Region_ID}">${r.Region_Name}</option>`).join('')}
                        </select>
                    </div>
                    <button type="submit" class="btn btn-primary">Save Feature</button>
                </form>
            `;
            
            modal.style.display = 'block';
            
            document.getElementById('featureForm').addEventListener('submit', async function(e) {
                e.preventDefault();
                const formData = new FormData(this);
                const response = await fetch('php/features.php?action=add', {
                    method: 'POST',
                    body: formData
                });
                const result = await response.json();
                if (result.success) {
                    alert('Feature added!');
                    closeModal();
                    loadFeatures();
                } else {
                    alert('Error: ' + result.message);
                }
            });
        });
}

async function deleteFeature(id) {
    if (confirm('Delete this feature?')) {
        const response = await fetch(`php/features.php?action=delete&id=${id}`);
        const result = await response.json();
        if (result.success) {
            alert('Feature deleted');
            loadFeatures();
        } else {
            alert('Error: ' + result.message);
        }
    }
}

// ============= INFRASTRUCTURE =============
async function loadInfrastructure() {
    const response = await fetch('php/infrastructure.php?action=get');
    const infra = await response.json();
    
    const html = `
        <div style="margin-bottom: 20px;">
            <button class="btn btn-primary" onclick="showAddInfraForm()">+ Add New Infrastructure</button>
        </div>
        <div class="data-card">
            <div class="data-table">
                <table>
                    <thead>
                        <tr>
                            <th>Infra ID</th><th>Infra Name</th><th>Infra Type</th><th>Capacity</th><th>Location ID</th><th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${infra.map(i => `
                            <tr>
                                <td>${i.Infrastructure_ID}</td>
                                <td>${i.Infrastructure_Name}</td>
                                <td>${i.Infrastructure_Type}</td>
                                <td>${i.Capacity}</td>
                                <td>${i.Location_ID}</td>
                                <td>
                                    <button class="btn btn-danger btn-sm" onclick="deleteInfra(${i.Infrastructure_ID})">Delete</button>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        </div>
    `;
    document.getElementById('content-area').innerHTML = html;
}

function showAddInfraForm() {
    fetch('php/locations.php?action=get')
        .then(response => response.json())
        .then(locations => {
            const modal = document.getElementById('modal');
            const modalBody = document.getElementById('modal-body');
            document.getElementById('modal-title').innerText = 'Add New Infrastructure';
            
            modalBody.innerHTML = `
                <form id="infraForm">
                    <div class="form-group">
                        <label>Infrastructure ID</label>
                        <input type="number" name="Infrastructure_ID" required>
                    </div>
                    <div class="form-group">
                        <label>Infrastructure Name</label>
                        <input type="text" name="Infrastructure_Name" required>
                    </div>
                    <div class="form-group">
                        <label>Infrastructure Type</label>
                        <select name="Infrastructure_Type">
                            <option value="Utility">Utility</option>
                            <option value="Transport">Transport</option>
                            <option value="Communication">Communication</option>
                            <option value="Water Supply">Water Supply</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Capacity</label>
                        <input type="number" name="Capacity" required>
                    </div>
                    <div class="form-group">
                        <label>Location</label>
                        <select name="Location_ID" required>
                            <option value="">Select Location</option>
                            ${locations.map(l => `<option value="${l.Location_ID}">Location ${l.Location_ID} (${l.Latitude}, ${l.Longitude})</option>`).join('')}
                        </select>
                    </div>
                    <button type="submit" class="btn btn-primary">Save Infrastructure</button>
                </form>
            `;
            
            modal.style.display = 'block';
            
            document.getElementById('infraForm').addEventListener('submit', async function(e) {
                e.preventDefault();
                const formData = new FormData(this);
                const response = await fetch('php/infrastructure.php?action=add', {
                    method: 'POST',
                    body: formData
                });
                const result = await response.json();
                if (result.success) {
                    alert('Infrastructure added!');
                    closeModal();
                    loadInfrastructure();
                } else {
                    alert('Error: ' + result.message);
                }
            });
        });
}

async function deleteInfra(id) {
    if (confirm('Delete this infrastructure?')) {
        const response = await fetch(`php/infrastructure.php?action=delete&id=${id}`);
        const result = await response.json();
        if (result.success) {
            alert('Infrastructure deleted');
            loadInfrastructure();
        } else {
            alert('Error: ' + result.message);
        }
    }
}

// ============= ADVANCED QUERIES =============
async function loadQueries() {
    const queries = [
        { value: 'region_stats', label: '📊 Region Statistics (Locations, Elevation, Infrastructure)' },
        { value: 'infrastructure_coverage', label: '🏗️ Infrastructure Coverage Report' },
        { value: 'elevation_analysis', label: '⛰️ Elevation Analysis by Region' },
        { value: 'unpopulated_regions', label: '📍 Regions without Locations' },
        { value: 'unserviced_features', label: '🏔️ Features without Infrastructure' },
        { value: 'combined_features', label: '🔄 Combined Features & Infrastructure (UNION)' },
        { value: 'avg_elevation_function', label: '📐 Average Elevation Function (Get_Region_Avg_Elevation)' },
        { value: 'total_capacity_function', label: '⚡ Total Infrastructure Capacity Function' }
    ];
    
    const html = `
        <div class="query-builder">
            <h3>🔍 Select a Query to Execute</h3>
            <select id="querySelect" class="query-select" onchange="executeQuery()">
                <option value="">-- Select Query --</option>
                ${queries.map(q => `<option value="${q.value}">${q.label}</option>`).join('')}
            </select>
        </div>
        <div id="queryResult" class="data-card" style="display:none;">
            <div class="card-header">
                <h3>Query Results</h3>
            </div>
            <div id="queryResultBody" class="data-table"></div>
        </div>
    `;
    document.getElementById('content-area').innerHTML = html;
}

async function executeQuery() {
    const queryType = document.getElementById('querySelect').value;
    if (!queryType) return;
    
    const response = await fetch(`php/queries.php?type=${queryType}`);
    const data = await response.json();
    
    const resultDiv = document.getElementById('queryResult');
    const resultBody = document.getElementById('queryResultBody');
    
    if (!data.length) {
        resultBody.innerHTML = '<p style="padding:20px;">No results found</p>';
        resultDiv.style.display = 'block';
        return;
    }
    
    const columns = Object.keys(data[0]);
    resultBody.innerHTML = `
        <table>
            <thead>
                <tr>${columns.map(col => `<th>${col}</th>`).join('')}</tr>
            </thead>
            <tbody>
                ${data.map(row => `
                    <tr>${columns.map(col => `<td>${row[col] !== null ? row[col] : '-'}</td>`).join('')}</tr>
                `).join('')}
            </tbody>
        </table>
    `;
    resultDiv.style.display = 'block';
}

// ============= TRANSACTIONS (ACID) =============
async function loadTransactions() {
    const html = `
        <div class="query-builder">
            <h3>🧭 Region Area Transfer (Atomicity Demo)</h3>
            <div class="form-group">
                <label>From Region ID</label>
                <input type="number" id="fromFeature" class="query-select">
            </div>
            <div class="form-group">
                <label>To Region ID</label>
                <input type="number" id="toFeature" class="query-select">
            </div>
            <div class="form-group">
                <label>Area to Transfer</label>
                <input type="number" id="transferAmount" class="query-select">
            </div>
            <button class="btn btn-primary" onclick="transferPopulation()">Execute Transfer (Atomic)</button>
        </div>
        
        <div class="query-builder">
            <h3>🏗️ Add Location with Infrastructure (Atomic Transaction)</h3>
            <button class="btn btn-primary" onclick="addLocationWithInfra()">Add Sample Location + Infrastructure</button>
        </div>
        
        <div class="query-builder">
            <h3>⚡ Test Check Constraints (Consistency)</h3>
            <button class="btn btn-warning" onclick="testCheckConstraint()">Test Negative Area (Should Fail)</button>
        </div>
        
        <div id="transactionResult" style="margin-top:20px;"></div>
    `;
    document.getElementById('content-area').innerHTML = html;
}

async function transferPopulation() {
    const fromFeature = document.getElementById('fromFeature').value;
    const toFeature = document.getElementById('toFeature').value;
    const amount = document.getElementById('transferAmount').value;
    
    if (!fromFeature || !toFeature || !amount) {
        alert('Please fill all fields');
        return;
    }
    
    const response = await fetch('php/transactions.php?action=transfer_population', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ from_feature: fromFeature, to_feature: toFeature, amount: amount })
    });
    
    const result = await response.json();
    const resultDiv = document.getElementById('transactionResult');
    
    if (result.success) {
        resultDiv.innerHTML = `<div class="alert alert-success">✅ ${result.message}</div>`;
    } else {
        resultDiv.innerHTML = `<div class="alert alert-error">❌ ${result.message}</div>`;
    }
}

async function addLocationWithInfra() {
    const response = await fetch('php/transactions.php?action=add_location_infra', {
        method: 'POST'
    });
    const result = await response.json();
    const resultDiv = document.getElementById('transactionResult');
    
    if (result.success) {
        resultDiv.innerHTML = `<div class="alert alert-success">✅ ${result.message}</div>`;
        loadLocations();
        loadInfrastructure();
    } else {
        resultDiv.innerHTML = `<div class="alert alert-error">❌ ${result.message}</div>`;
    }
}

async function testCheckConstraint() {
    const response = await fetch('php/transactions.php?action=test_check_constraint', {
        method: 'POST'
    });
    const result = await response.json();
    const resultDiv = document.getElementById('transactionResult');
    
    resultDiv.innerHTML = `<div class="alert alert-info">${result.message}</div>`;
}

// ============= VIEWS =============
async function loadViews() {
    const views = [
        { name: 'Region_Statistics_View', desc: 'Region statistics with location count and average elevation' },
        { name: 'Infrastructure_Dashboard', desc: 'Infrastructure distribution across regions' },
        { name: 'Geographical_Feature_Details', desc: 'Features with associated infrastructure' },
        { name: 'Location_Analytics_View', desc: 'Elevation patterns and region distribution' }
    ];
    
    const html = `
        <div class="query-builder">
            <h3>📋 Database Views</h3>
            <select id="viewSelect" class="query-select" onchange="loadViewData()">
                <option value="">-- Select a View --</option>
                ${views.map(v => `<option value="${v.name}">${v.name} - ${v.desc}</option>`).join('')}
            </select>
        </div>
        <div id="viewResult" class="data-card" style="display:none;">
            <div class="card-header">
                <h3 id="viewTitle">View Results</h3>
            </div>
            <div id="viewResultBody" class="data-table"></div>
        </div>
    `;
    document.getElementById('content-area').innerHTML = html;
}

async function loadViewData() {
    const viewName = document.getElementById('viewSelect').value;
    if (!viewName) return;
    
    const response = await fetch(`php/views.php?view=${viewName}`);
    const data = await response.json();
    
    const resultDiv = document.getElementById('viewResult');
    const resultBody = document.getElementById('viewResultBody');
    document.getElementById('viewTitle').innerText = viewName;
    
    if (!data.length) {
        resultBody.innerHTML = '<p style="padding:20px;">No data in view</p>';
        resultDiv.style.display = 'block';
        return;
    }
    
    const columns = Object.keys(data[0]);
    resultBody.innerHTML = `
        <table>
            <thead>
                <tr>${columns.map(col => `<th>${col}</th>`).join('')}</tr>
            </thead>
            <tbody>
                ${data.map(row => `
                    <tr>${columns.map(col => `<td>${row[col] !== null ? row[col] : '-'}</td>`).join('')}</tr>
                `).join('')}
            </tbody>
        </table>
    `;
    resultDiv.style.display = 'block';
}

// ============= FUNCTIONS & TRIGGERS =============
async function loadFunctions() {
    const html = `
        <div class="query-builder">
            <h3>📐 Get Region Average Elevation</h3>
            <div class="form-group">
                <label>Region ID</label>
                <input type="number" id="avgElevRegionId" class="query-select">
            </div>
            <button class="btn btn-primary" onclick="getRegionAvgElevation()">Calculate</button>
        </div>
        
        <div class="query-builder">
            <h3>⚡ Get Region Total Infrastructure Capacity</h3>
            <div class="form-group">
                <label>Region ID</label>
                <input type="number" id="capacityRegionId" class="query-select">
            </div>
            <button class="btn btn-primary" onclick="getRegionTotalCapacity()">Calculate</button>
        </div>
        
        <div id="functionResult" style="margin-top:20px;"></div>
    `;
    document.getElementById('content-area').innerHTML = html;
}

async function getRegionAvgElevation() {
    const regionId = document.getElementById('avgElevRegionId').value;
    if (!regionId) {
        alert('Enter Region ID');
        return;
    }
    
    const response = await fetch(`php/functions.php?action=avg_elevation&region_id=${regionId}`);
    const result = await response.json();
    const resultDiv = document.getElementById('functionResult');
    
    resultDiv.innerHTML = `<div class="alert alert-success">📐 Average Elevation for Region ${regionId}: ${result.value} meters</div>`;
}

async function getRegionTotalCapacity() {
    const regionId = document.getElementById('capacityRegionId').value;
    if (!regionId) {
        alert('Enter Region ID');
        return;
    }
    
    const response = await fetch(`php/functions.php?action=total_capacity&region_id=${regionId}`);
    const result = await response.json();
    const resultDiv = document.getElementById('functionResult');
    
    resultDiv.innerHTML = `<div class="alert alert-success">⚡ Total Infrastructure Capacity for Region ${regionId}: ${result.value}</div>`;
}