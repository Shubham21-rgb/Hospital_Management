import Navbar from "./Navbar.js"
export default{
    components:{
        'n':Navbar,
    },
    template:`
    <div class="home-container">
  <!-- Header Section -->
  <div class="home-header">
    <h1>Hospital Management System</h1>
    <p>
        Your one-stop solution for managing hospital appointments, patient records, and more.
    </p>
  </div>

  <!-- Image Section -->
  <div class="home-card">
    <img src="static/pic1.png" alt="Hospital Illustration">

    <div class="home-card-body">
      <h5 class="home-card-title">
        WE CARE
        <span>WE REVIVE LIFE WITH Hospital Management</span>
      </h5>
      <p class="home-card-text">
        Manage your hospital appointments, patient records, and more with ease.
      </p>

      <!-- Buttons -->
      <div class="home-button-group">
        <router-link class="home-btn home-btn-primary" to="/login">Login</router-link>
        <router-link class="home-btn home-btn-outline" to="/register">Register as User</router-link>
      </div>
    </div>
  </div>

  <!-- Footer -->
  <footer class="home-footer">
    © 2026 Hospital Management System. All rights reserved. - ShubhamTA
  </footer>
</div>
`
}