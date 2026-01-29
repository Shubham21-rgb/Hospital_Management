// Demo Component - For testing and demonstration purposes
export default class Demo {
    constructor() {
        this.init();
    }

    init() {
        this.render();
        this.attachEventListeners();
    }

    render() {
        const content = document.getElementById('content');
        if (!content) return;

        content.innerHTML = `
            <div class="demo-page py-5">
                <div class="container">
                    <h2 class="mb-4"><i class="fas fa-flask"></i> Demo & Testing</h2>
                    
                    <div class="row">
                        <div class="col-md-12">
                            <div class="card mb-4">
                                <div class="card-header">
                                    <h5 class="mb-0">Test Credentials</h5>
                                </div>
                                <div class="card-body">
                                    <div class="row">
                                        <div class="col-md-4">
                                            <h6>Admin</h6>
                                            <p class="mb-1"><strong>Email:</strong> admin@hospital.com</p>
                                            <p class="mb-1"><strong>Password:</strong> admin123</p>
                                            <button class="btn btn-sm btn-primary mt-2" onclick="fillLogin('admin')">
                                                Use Admin Credentials
                                            </button>
                                        </div>
                                        <div class="col-md-4">
                                            <h6>Doctor</h6>
                                            <p class="mb-1"><strong>Email:</strong> doctor@hospital.com</p>
                                            <p class="mb-1"><strong>Password:</strong> doctor123</p>
                                            <button class="btn btn-sm btn-success mt-2" onclick="fillLogin('doctor')">
                                                Use Doctor Credentials
                                            </button>
                                        </div>
                                        <div class="col-md-4">
                                            <h6>Patient</h6>
                                            <p class="mb-1"><strong>Email:</strong> patient@hospital.com</p>
                                            <p class="mb-1"><strong>Password:</strong> patient123</p>
                                            <button class="btn btn-sm btn-info mt-2" onclick="fillLogin('patient')">
                                                Use Patient Credentials
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div class="card mb-4">
                                <div class="card-header">
                                    <h5 class="mb-0">API Testing</h5>
                                </div>
                                <div class="card-body">
                                    <div class="mb-3">
                                        <label class="form-label">API Endpoint</label>
                                        <select class="form-select" id="api-endpoint">
                                            <option value="/api/admin/dashboard">Admin Dashboard</option>
                                            <option value="/api/admin/doctors">Get All Doctors</option>
                                            <option value="/api/admin/patients">Get All Patients</option>
                                            <option value="/api/admin/appointments">Get All Appointments</option>
                                            <option value="/api/doctor/dashboard">Doctor Dashboard</option>
                                            <option value="/api/patient/dashboard">Patient Dashboard</option>
                                        </select>
                                    </div>
                                    <button class="btn btn-primary" id="test-api-btn">
                                        <i class="fas fa-play"></i> Test API
                                    </button>
                                    <div id="api-response" class="mt-3"></div>
                                </div>
                            </div>

                            <div class="card mb-4">
                                <div class="card-header">
                                    <h5 class="mb-0">System Information</h5>
                                </div>
                                <div class="card-body">
                                    <p><strong>Current User:</strong> <span id="current-user">Not logged in</span></p>
                                    <p><strong>User Role:</strong> <span id="current-role">N/A</span></p>
                                    <p><strong>Auth Token:</strong> <span id="auth-token">N/A</span></p>
                                    <p><strong>Local Storage:</strong></p>
                                    <pre id="local-storage" class="bg-light p-2"></pre>
                                    <button class="btn btn-danger btn-sm" id="clear-storage-btn">
                                        <i class="fas fa-trash"></i> Clear Local Storage
                                    </button>
                                </div>
                            </div>

                            <div class="card">
                                <div class="card-header">
                                    <h5 class="mb-0">Quick Actions</h5>
                                </div>
                                <div class="card-body">
                                    <div class="d-flex gap-2 flex-wrap">
                                        <button class="btn btn-outline-primary" data-page="home">
                                            <i class="fas fa-home"></i> Home
                                        </button>
                                        <button class="btn btn-outline-success" data-page="login">
                                            <i class="fas fa-sign-in-alt"></i> Login
                                        </button>
                                        <button class="btn btn-outline-info" data-page="register">
                                            <i class="fas fa-user-plus"></i> Register
                                        </button>
                                        <button class="btn btn-outline-warning" data-page="dashboard">
                                            <i class="fas fa-tachometer-alt"></i> Dashboard
                                        </button>
                                        <button class="btn btn-outline-secondary" id="reload-page-btn">
                                            <i class="fas fa-sync"></i> Reload Page
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        this.updateSystemInfo();
    }

    attachEventListeners() {
        // Navigation buttons
        document.querySelectorAll('[data-page]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const page = e.target.closest('[data-page]').getAttribute('data-page');
                window.dispatchEvent(new CustomEvent('navigate', { detail: { page } }));
            });
        });

        // API test button
        const testApiBtn = document.getElementById('test-api-btn');
        if (testApiBtn) {
            testApiBtn.addEventListener('click', () => this.testAPI());
        }

        // Clear storage button
        const clearStorageBtn = document.getElementById('clear-storage-btn');
        if (clearStorageBtn) {
            clearStorageBtn.addEventListener('click', () => {
                localStorage.clear();
                this.updateSystemInfo();
                alert('Local storage cleared!');
            });
        }

        // Reload page button
        const reloadBtn = document.getElementById('reload-page-btn');
        if (reloadBtn) {
            reloadBtn.addEventListener('click', () => location.reload());
        }
    }

    updateSystemInfo() {
        const userName = localStorage.getItem('user_name') || 'Not logged in';
        const userRole = localStorage.getItem('user_role') || 'N/A';
        const authToken = localStorage.getItem('auth_token') || 'N/A';

        document.getElementById('current-user').textContent = userName;
        document.getElementById('current-role').textContent = userRole;
        document.getElementById('auth-token').textContent = authToken.substring(0, 20) + '...';

        // Display local storage content
        const storageData = {};
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            storageData[key] = localStorage.getItem(key);
        }
        document.getElementById('local-storage').textContent = JSON.stringify(storageData, null, 2);
    }

    async testAPI() {
        const endpoint = document.getElementById('api-endpoint').value;
        const responseDiv = document.getElementById('api-response');

        responseDiv.innerHTML = '<div class="spinner-border" role="status"></div> Loading...';

        try {
            const response = await fetch(endpoint, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
                }
            });

            const data = await response.json();

            responseDiv.innerHTML = `
                <div class="alert alert-${response.ok ? 'success' : 'danger'}">
                    <strong>Status:</strong> ${response.status} ${response.statusText}
                </div>
                <pre class="bg-light p-3">${JSON.stringify(data, null, 2)}</pre>
            `;
        } catch (error) {
            responseDiv.innerHTML = `
                <div class="alert alert-danger">
                    <strong>Error:</strong> ${error.message}
                </div>
            `;
        }
    }
}

// Global function for filling login credentials
window.fillLogin = function(role) {
    const credentials = {
        admin: { email: 'admin@hospital.com', password: 'admin123', role: 'admin' },
        doctor: { email: 'doctor@hospital.com', password: 'doctor123', role: 'doctor' },
        patient: { email: 'patient@hospital.com', password: 'patient123', role: 'patient' }
    };

    window.dispatchEvent(new CustomEvent('navigate', { detail: { page: 'login' } }));
    
    setTimeout(() => {
        const emailInput = document.getElementById('email');
        const passwordInput = document.getElementById('password');
        const roleSelect = document.getElementById('role');

        if (emailInput && passwordInput && roleSelect) {
            emailInput.value = credentials[role].email;
            passwordInput.value = credentials[role].password;
            roleSelect.value = credentials[role].role;
        }
    }, 500);
};
