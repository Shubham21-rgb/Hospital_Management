// Navbar Component
export default class Navbar {
    constructor() {
        this.init();
    }

    init() {
        this.render();
        this.attachEventListeners();
    }

    render() {
        const navbar = document.getElementById('navbar-container');
        if (!navbar) return;

        const isAuthenticated = localStorage.getItem('auth_token');
        const userRole = localStorage.getItem('user_role');

        navbar.innerHTML = `
            <nav class="navbar navbar-expand-lg navbar-dark bg-primary">
                <div class="container-fluid">
                    <a class="navbar-brand" href="/">
                        <i class="fas fa-hospital"></i> Hospital Management
                    </a>
                    <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
                        <span class="navbar-toggler-icon"></span>
                    </button>
                    <div class="collapse navbar-collapse" id="navbarNav">
                        <ul class="navbar-nav ms-auto">
                            ${!isAuthenticated ? `
                                <li class="nav-item">
                                    <a class="nav-link" href="#" data-page="home">Home</a>
                                </li>
                                <li class="nav-item">
                                    <a class="nav-link" href="#" data-page="login">Login</a>
                                </li>
                                <li class="nav-item">
                                    <a class="nav-link" href="#" data-page="register">Register</a>
                                </li>
                            ` : `
                                <li class="nav-item">
                                    <a class="nav-link" href="#" data-page="dashboard">Dashboard</a>
                                </li>
                                <li class="nav-item">
                                    <span class="nav-link">Role: ${userRole || 'User'}</span>
                                </li>
                                <li class="nav-item">
                                    <a class="nav-link" href="#" id="logout-btn">Logout</a>
                                </li>
                            `}
                        </ul>
                    </div>
                </div>
            </nav>
        `;
    }

    attachEventListeners() {
        const logoutBtn = document.getElementById('logout-btn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.logout();
            });
        }
    }

    logout() {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user_role');
        localStorage.removeItem('user_id');
        window.location.href = '/';
    }

    update() {
        this.render();
        this.attachEventListeners();
    }
}
