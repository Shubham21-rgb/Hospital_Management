import cusnav from "./cusnav.js"
export default {
  components: {
    'n': cusnav
  },
  template: `
<div class="patient-dashboard">
  <n></n>
  <div v-if="profile.active === true" class="container py-5">
  <!-- Dashboard Header -->
  <div class="dashboard-header text-center py-5 mb-4">
    <div class="container">
      <i class="bi bi-hospital text-primary display-3 mb-3"></i>
      <h1 class="fw-bold text-primary mb-2">Patient Dashboard</h1>
      <p class="text-muted fs-5">Manage your health appointments and consultations</p>
    </div>
  </div>
  <button class="btn btn-outline-primary" @click="csvd">
        <i class="bi bi-pencil me-2"></i>Download Report
      </button>

  <!-- User Profile Section -->
  <div class="user-details bg-light py-3 mb-4">
    <div class="container d-flex align-items-center justify-content-between">
      <div class="d-flex align-items-center">
        <i class="bi bi-person-circle text-secondary display-4 me-3"></i>
        <div>
          <h4 class="mb-0 fw-semibold">Welcome {{ profile.first_name }} {{ profile.last_name }} !</h4>
          <p class="text-muted mb-0">{{ profile.email }}</p>
          <p>{{profile.username}} </p>
          <p>{{profile.gender}}</p>
        </div>
      </div>
      <button class="btn btn-outline-primary" @click="showProfileModal = true">
        <i class="bi bi-pencil me-2"></i>Update Profile
      </button>
    </div>
  </div>

  <div class="container py-4">
    <!-- Message -->
    <div v-if="message" class="alert alert-success alert-dismissible fade show">
      <i class="bi bi-check-circle-fill me-2"></i>{{ message }}
      <button type="button" class="btn-close" @click="message = ''"></button>
    </div>

    <!-- Search Doctors Section -->
    <div class="mb-5">
      <div class="section-header mb-4">
        <h3 class="fw-bold text-primary">
          <i class="bi bi-search me-2"></i>Search Doctors
        </h3>
      </div>
      <div class="row mb-4">
        <div class="col-md-6 mb-3">
        <input v-model="search.Query" placeholder="Search by Name">
        <select v-model="search.dept" class="form-select">
            <option value="">All Departments</option>
            <option v-for="d in departments" :key="d.id" :value="d.id">{{ d.name }}</option>
          </select>
        <button @click="search_manual">Search</button>
          <select v-model="searchDept" class="form-select" @change="searchDoctors">
            <option value="">All Departments</option>
            <option v-for="d in departments" :key="d.id" :value="d.id">{{ d.name }}</option>
          </select>
        </div>
        <div class="col-md-6 mb-3">
          <select v-model="searchAvailability" class="form-select" @change="searchDoctors">
            <option value="">All Doctors</option>
            <option value="available">Available Only</option>
          </select>
        </div>
      </div>
      
      <div class="row">
        <div v-for="doc in doctors" :key="doc.id" class="col-lg-6 col-xl-4 mb-4">
          <div class="card shadow border-0 h-100">
            <div class="card-header bg-primary text-white">
              <h5 class="mb-0"><i class="bi bi-person-badge me-2"></i>{{ doc.name }}</h5>
            </div>
            <div class="card-body">
              <div class="mb-2"><i class="bi bi-hospital text-primary me-2"></i><strong>Department:</strong> {{ doc.department }}</div>
              <div class="mb-2"><i class="bi bi-award text-primary me-2"></i><strong>Qualification:</strong> {{ doc.qualification }}</div>
              <div class="mb-2"><i class="bi bi-clock text-primary me-2"></i><strong>Experience:</strong> {{ doc.experience_years }} years</div>
              <div class="mb-2"><i class="bi bi-currency-rupee text-primary me-2"></i><strong>Fee:</strong> ₹{{ doc.consultation_fee }}</div>
              <div class="mb-3">
                <span v-if="doc.is_available" class="badge bg-success">Available</span>
                <span v-else class="badge bg-secondary">Not Available</span>
              </div>
              <button v-if="doc.is_available" class="btn btn-success w-100" @click="openBookingModal(doc)">
                <i class="bi bi-calendar-plus me-2"></i>Book Appointment
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Upcoming Appointments -->
    <div v-if="upcomingAppointments.length" class="mb-5">
      <div class="section-header mb-4">
        <h3 class="fw-bold text-success">
          <i class="bi bi-calendar-check me-2"></i>Upcoming Appointments
        </h3>
      </div>
      <div class="row">
        <div v-for="apt in upcomingAppointments" :key="apt.id" class="col-lg-6 col-xl-4 mb-4">
          <div class="card shadow border-0 h-100">
            <div class="card-header bg-success text-white">
              <h5 class="mb-0"><i class="bi bi-person-badge me-2"></i>Dr. {{ apt.doctor_name }}</h5>
            </div>
            <div class="card-body">
              <div class="mb-2"><i class="bi bi-hospital text-primary me-2"></i><strong>Department:</strong> {{ apt.department }}</div>
              <div class="mb-2"><i class="bi bi-calendar3 text-primary me-2"></i><strong>Date:</strong> {{ apt.appointment_date }}</div>
              <div class="mb-2"><i class="bi bi-clock text-primary me-2"></i><strong>Time:</strong> {{ apt.appointment_time }}</div>
              <div class="mb-2"><i class="bi bi-info-circle text-primary me-2"></i><strong>Status:</strong> <span class="badge bg-success">{{ apt.status }}</span></div>
              <div class="btn-group w-100 mt-3" role="group">
                <button class="btn btn-warning" @click="openRescheduleModal(apt)">
                  <i class="bi bi-arrow-repeat me-1"></i>Reschedule
                </button>
                <button class="btn btn-danger" @click="cancelAppointment(apt.id)">
                  <i class="bi bi-x-circle me-1"></i>Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Appointment History -->
    <hr class="my-5">
    <div class="section-header mb-4">
      <h3 class="fw-bold text-secondary">
        <i class="bi bi-clock-history me-2"></i>Appointment History
      </h3>
    </div>
    <div class="table-responsive">
      <table class="table table-hover table-bordered">
        <thead class="table-primary">
          <tr>
            <th>Doctor</th>
            <th>Department</th>
            <th>Date</th>
            <th>Time</th>
            <th>Status</th>
            <th>Diagnosis</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="apt in appointmentHistory" :key="apt.id">
            <td>Dr. {{ apt.doctor_name }}</td>
            <td>{{ apt.department }}</td>
            <td>{{ apt.appointment_date }}</td>
            <td>{{ apt.appointment_time }}</td>
            <td><span class="badge bg-secondary">{{ apt.status }}</span></td>
            <td>{{ apt.diagnosis || '-' }}</td>
          </tr>
          <tr v-if="!appointmentHistory.length">
            <td colspan="6" class="text-center text-muted py-4">
              <i class="bi bi-inbox display-4 d-block mb-2"></i>No appointment history
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>

  <!-- Book Appointment Modal -->
  <div v-if="showBookingModal" class="modal d-block" style="background: rgba(0,0,0,0.5)">
    <div class="modal-dialog">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">Book Appointment with Dr. {{ selectedDoctor.name }}</h5>
          <button type="button" class="btn-close" @click="showBookingModal = false"></button>
        </div>
        <div class="modal-body">
          <div class="mb-3">
            <label class="form-label">Appointment Date</label>
            <input type="date" class="form-control" v-model="bookingData.date">
          </div>
          <div class="mb-3">
            <label class="form-label">Appointment Time</label>
            <input type="time" class="form-control" v-model="bookingData.time">
          </div>
          <div class="mb-3">
            <label class="form-label">Reason for Visit</label>
            <textarea class="form-control" v-model="bookingData.reason" rows="3"></textarea>
          </div>
          <div class="mb-3">
            <label class="form-label">Symptoms</label>
            <textarea class="form-control" v-model="bookingData.symptoms" rows="3"></textarea>
          </div>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" @click="showBookingModal = false">Close</button>
          <button type="button" class="btn btn-success" @click="bookAppointment">Book Appointment</button>
        </div>
      </div>
    </div>
  </div>

  <!-- Reschedule Modal -->
  <div v-if="showRescheduleModal" class="modal d-block" style="background: rgba(0,0,0,0.5)">
    <div class="modal-dialog">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">Reschedule Appointment</h5>
          <button type="button" class="btn-close" @click="showRescheduleModal = false"></button>
        </div>
        <div class="modal-body">
          <div class="mb-3">
            <label class="form-label">New Date</label>
            <input type="date" class="form-control" v-model="rescheduleData.date">
          </div>
          <div class="mb-3">
            <label class="form-label">New Time</label>
            <input type="time" class="form-control" v-model="rescheduleData.time">
          </div>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" @click="showRescheduleModal = false">Close</button>
          <button type="button" class="btn btn-warning" @click="rescheduleAppointment">Reschedule</button>
        </div>
      </div>
    </div>
  </div>

  <!-- Update Profile Modal -->
  <div v-if="showProfileModal" class="modal d-block" style="background: rgba(0,0,0,0.5)">
    <div class="modal-dialog modal-lg">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">Update Profile</h5>
          <button type="button" class="btn-close" @click="showProfileModal = false"></button>
        </div>
        <div class="modal-body">
          <div class="row">
            <div class="col-md-6 mb-3">
              <label class="form-label">First Name</label>
              <input type="text" class="form-control" v-model="profile.first_name">
            </div>
            <div class="col-md-6 mb-3">
              <label class="form-label">Last Name</label>
              <input type="text" class="form-control" v-model="profile.last_name">
            </div>
            <div class="col-md-6 mb-3">
              <label class="form-label">Phone</label>
              <input type="text" class="form-control" v-model="profile.phone">
            </div>
            <div class="col-md-6 mb-3">
              <label class="form-label">Blood Group</label>
              <input type="text" class="form-control" v-model="profile.blood_group">
            </div>
            <div class="col-12 mb-3">
              <label class="form-label">Address</label>
              <textarea class="form-control" v-model="profile.address" rows="2"></textarea>
            </div>
            <div class="col-md-6 mb-3">
              <label class="form-label">Allergies</label>
              <textarea class="form-control" v-model="profile.allergies" rows="2"></textarea>
            </div>
            <div class="col-md-6 mb-3">
              <label class="form-label">Chronic Conditions</label>
              <textarea class="form-control" v-model="profile.chronic_conditions" rows="2"></textarea>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" @click="showProfileModal = false">Close</button>
          <button type="button" class="btn btn-primary" @click="updateProfile">Update Profile</button>
        </div>
      </div>
    </div>
  </div>
  </div>
  <div v-else class="container py-5 text-center">
    <i class="bi bi-x-circle-fill text-danger display-1 mb-4"></i>
    <h2 class="fw-bold text-danger mb-3">Account Inactive</h2>
    <p class="text-muted fs-5">Your account is currently inactive. Please contact support for assistance.</p>
  </div>
</div>
`,
  data() {
    return {
      profile: {},
      departments: [],
      doctors: [],
      upcomingAppointments: [],
      appointmentHistory: [],
      message: "",
      searchDept: "",
      searchAvailability: "",
      search:{
        Query:"",
        dept:""
      },
      showBookingModal: false,
      showRescheduleModal: false,
      showProfileModal: false,
      selectedDoctor: {},
      selectedAppointment: {},
      bookingData: { date: "", time: "", reason: "", symptoms: "" },
      rescheduleData: { date: "", time: "" }
    };
  },
  mounted() {
    this.fetchProfile();
    this.fetchDepartments();
    this.searchDoctors();
    this.fetchAppointments();
  },
  methods: {
    fetchProfile() {
      fetch('/api/patient/profile', {
        headers: { "Content-Type": "application/json", "Authentication-Token": localStorage.getItem('auth_token') }
      })
      .then(r => r.json())
      .then(data => {
        if (data.id) {
          this.profile = data;
          console.log(this.profile);
        }
      });
    },
    search_manual(){
      fetch('/api/patient/manual_search',{
        method:'POST',
        headers: { "Content-Type": "application/json", "Authentication-Token": localStorage.getItem('auth_token') },
        body: JSON.stringify(this.search)
      })
      .then(r => r.json())
      .then(data => {
        this.doctors = data.doctors || [];
        console.log(this.doctors);
      })

    },
    updateProfile() {
      fetch('/api/patient/update_profile', {
        method: 'POST',
        headers: { "Content-Type": "application/json", "Authentication-Token": localStorage.getItem('auth_token') },
        body: JSON.stringify(this.profile)
      })
      .then(r => r.json())
      .then(data => {
        this.message = data.message;
        this.showProfileModal = false;
        this.fetchProfile();
      });
    },
    fetchDepartments() {
      fetch('/api/get_departments', {
        headers: { "Content-Type": "application/json" }
      })
      .then(r => r.json())
      .then(data => {
        this.departments = data.departments || [];
      });
    },
    searchDoctors() {
      let url = '/api/patient/search_doctors?';
      if (this.searchDept) url += 'department_id=' + this.searchDept + '&';
      if (this.searchAvailability) url += 'availability=' + this.searchAvailability;
      
      fetch(url, {
        headers: { "Content-Type": "application/json", "Authentication-Token": localStorage.getItem('auth_token') }
      })
      .then(r => r.json())
      .then(data => {
        this.doctors = data.doctors || [];
      });
    },
    openBookingModal(doctor) {
      this.selectedDoctor = doctor;
      this.bookingData = { date: "", time: "", reason: "", symptoms: "" };
      this.showBookingModal = true;
    },
    bookAppointment() {
      fetch('/api/patient/book_appointment', {
        method: 'POST',
        headers: { "Content-Type": "application/json", "Authentication-Token": localStorage.getItem('auth_token') },
        body: JSON.stringify({
          doctor_id: this.selectedDoctor.id,
          appointment_date: this.bookingData.date,
          appointment_time: this.bookingData.time,
          reason_for_visit: this.bookingData.reason,
          symptoms: this.bookingData.symptoms
        })
      })
      .then(r => r.json())
      .then(data => {
        this.message = data.message;
        this.showBookingModal = false;
        this.fetchAppointments();
      });
    },
    fetchAppointments() {
      fetch('/api/patient/appointments', {
        headers: { "Content-Type": "application/json", "Authentication-Token": localStorage.getItem('auth_token') }
      })
      .then(r => r.json())
      .then(data => {
        this.upcomingAppointments = data.upcoming || [];
        this.appointmentHistory = data.history || [];
      });
    },
    openRescheduleModal(appointment) {
      this.selectedAppointment = appointment;
      this.rescheduleData = { date: "", time: "" };
      this.showRescheduleModal = true;
    },
    rescheduleAppointment() {
      fetch('/api/patient/reschedule_appointment', {
        method: 'POST',
        headers: { "Content-Type": "application/json", "Authentication-Token": localStorage.getItem('auth_token') },
        body: JSON.stringify({
          appointment_id: this.selectedAppointment.id,
          new_date: this.rescheduleData.date,
          new_time: this.rescheduleData.time
        })
      })
      .then(r => r.json())
      .then(data => {
        this.message = data.message;
        this.showRescheduleModal = false;
        this.fetchAppointments();
      });
    },
    cancelAppointment(appointmentId) {
      if (!confirm('Are you sure you want to cancel this appointment?')) return;
      
      fetch('/api/patient/cancel_appointment', {
        method: 'POST',
        headers: { "Content-Type": "application/json", "Authentication-Token": localStorage.getItem('auth_token') },
        body: JSON.stringify({ appointment_id: appointmentId })
      })
      .then(r => r.json())
      .then(data => {
        this.message = data.message;
        this.fetchAppointments();
      });
    },
    csvd(){
            fetch('/api/patient/download_report',{
                method: 'POST',
                headers: { "Content-Type": "application/json", "Authentication-Token": localStorage.getItem('auth_token') },
            })
            .then(response => response.json())
            .then(data=>{
                window.location.href = `/api/csv_result/${data.task_id}`
            })
        }
  }
}