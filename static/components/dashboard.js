import cusnav from "./cusnav.js"
export default {
  components: {
    'n': cusnav
  },
  template: `
<div class="patient-dashboard">
  <n></n>
  <!-- Dashboard Header -->
  <div class="dashboard-header text-center py-5 mb-4">
    <div class="container">
      <i class="bi bi-hospital text-primary display-3 mb-3"></i>
      <h1 class="fw-bold text-primary mb-2">Patient Dashboard</h1>
      <p class="text-muted fs-5">Manage your health appointments and consultations</p>
    </div>
  </div>
  <!-- User Details -->
  <div class="user-details bg-light py-3 mb-4">
    <div class="container d-flex align-items-center" v-for="us in us">
      <i class="bi bi-person-circle text-secondary display-4 me-3"></i>
      <div>
        <h4 class="mb-0 fw-semibold">Welcome {{ us.username }} !</h4>
      </div>
    </div>
  </div>

  <div class="container py-4">
    <!-- Message -->
    <div v-if="message" class="alert alert-success alert-dismissible fade show">
      <i class="bi bi-check-circle-fill me-2"></i>{{ message }}
    </div>

    <!-- ACTIVE APPOINTMENTS -->
    <div v-if="activeReservations.length" class="mb-5">
      <div class="section-header mb-4">
        <h3 class="fw-bold text-success">
          <i class="bi bi-calendar-check me-2"></i>Upcoming Appointments
        </h3>
      </div>
      <div class="row">
        <div v-for="res in activeReservations" :key="res.id" class="col-lg-6 col-xl-4 mb-4">
          <div class="card appointment-card shadow border-0 h-100">
            <div class="card-header bg-gradient-success text-white">
              <h5 class="mb-0">
                <i class="bi bi-person-badge me-2"></i>{{ res.lot_name }}
              </h5>
            </div>
            <div class="card-body">
              <div class="appointment-detail mb-2">
                <i class="bi bi-hospital text-primary me-2"></i>
                <strong>Department:</strong> {{ res.spot_number }}
              </div>
              <div class="appointment-detail mb-2">
                <i class="bi bi-calendar3 text-primary me-2"></i>
                <strong>Date & Time:</strong> {{ res.parking_timestamp }}
              </div>
              <div class="appointment-detail mb-2">
                <i class="bi bi-check-circle text-success me-2"></i>
                <strong>Status:</strong> <span class="badge bg-success">{{ res.booking_status }}</span>
              </div>
              <div class="appointment-detail mb-3">
                <i class="bi bi-credit-card text-primary me-2"></i>
                <strong>Payment:</strong> <span class="badge bg-info">{{ res.payment_status }}</span>
              </div>

              <button class="btn btn-danger w-100 mt-3" @click="releaseSpot(res.id)">
                <i class="bi bi-x-circle me-2"></i> Cancel Appointment
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- AVAILABLE DOCTORS/DEPARTMENTS -->
    <div class="section-header mb-4">
      <h3 class="fw-bold text-primary">
        <i class="bi bi-heart-pulse me-2"></i>Book Consultation
      </h3>
    </div>
    <div class="row">
      <div v-for="lot in dept" :key="lot.id" class="col-lg-6 col-xl-4 mb-4">
        <div class="card doctor-card shadow border-0 h-100">
          <div class="card-header bg-gradient-primary text-white">
            
          </div>
          <div class="card-body">
          <div class="doctor-detail mb-2">
              <i class="bi bi-geo-alt-fill text-danger me-2"></i>
              <h3> {{ lot.name }} </h3>
            </div>
            <div class="doctor-detail mb-2">
              <i class="bi bi-geo-alt-fill text-danger me-2"></i>
              <strong>Details:</strong> {{ lot.description }}
            </div>
            <div class="doctor-detail mb-2">
              <div v-if="lot.active == '1'">
              <i class="bi bi-geo-alt-fill text-danger me-2"></i>
              <strong>Status:</strong> Available
              </div>
              <div v-else>
              <i class="bi bi-geo-alt-fill text-danger me-2"></i>
              <strong>Status:</strong> Not Available
              </div>
            </div>
            <div>
              <div v-if="lot.active == '1'">
              <div v-for="us in us">
              <button class="btn btn-success w-100 mt-3" @click="bookapp(lot.id,us.id,us.username,us.email)">
                <i class="bi bi-bookmark-check me-2"></i> Book Appointment
              </button>
              </div>
              </div>
              <div v-else>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- APPOINTMENT HISTORY -->
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
            <th><i class="bi bi-person-badge me-2"></i>Doctor/Department</th>
            <th><i class="bi bi-hospital me-2"></i>Specialty</th>
            <th><i class="bi bi-calendar-event me-2"></i>Appointment Date</th>
            <th><i class="bi bi-calendar-check me-2"></i>Completion Date</th>
            <th><i class="bi bi-info-circle me-2"></i>Status</th>
            <th><i class="bi bi-credit-card me-2"></i>Payment</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="r in history" :key="r.id">
            <td class="fw-semibold">{{ r.lot_name }}</td>
            <td>{{ r.spot_number }}</td>
            <td>{{ r.parking_timestamp }}</td>
            <td>{{ r.leaving_timestamp || '-' }}</td>
            <td><span class="badge bg-secondary">{{ r.booking_status }}</span></td>
            <td><span class="badge bg-info">{{ r.payment_status }}</span></td>
          </tr>
          <tr v-if="!history.length">
            <td colspan="6" class="text-center text-muted py-4">
              <i class="bi bi-inbox display-4 d-block mb-2"></i>
              No appointment history yet
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</div>


`,
  data() {
    return {
      dept: [],
      activeReservations: [],
      history: [],
      message: "",
      us:[]
    };
  },
  mounted() {
    this.fetchDept();
    this.fetchuser();
  },
  methods: {
    fetchDept() {
      fetch('/api/get_departments', {
        headers: { "Content-Type":'application/json' }
      })
      .then(r => r.json())
      .then(data => {
        this.dept = data.departments || [];
      });
    },
    bookapp(deptId, userId, username, email) {
      fetch('/api/book_appointment', {
        method: 'POST',
        headers: { "Content-Type":'application/json',"auth_token": localStorage.getItem('auth_token') },
        body: JSON.stringify({ department_id: deptId, user_id: userId, username: username, email: email })
      })
      .then(r => r.json())
      .then(data => {
        if (data.success) {
          this.message = "Appointment booked successfully!";
          this.fetchDept();
          this.fetchActiveReservations();
          this.fetchHistory();
        }
      });
    },
    fetchuser(){
      fetch('/api/get_patient',{
        headers: { "Content-Type":'application/json'}
      })
      .then(r => r.json())
      .then(data => {
        this.us = data.user || [];
      });
    }
}
}