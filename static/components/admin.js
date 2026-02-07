import cusnav from "./cusnav.js";

export default {
  components: {
    'n': cusnav
  },
  template: `
<div class="admin-dashboard">
<n></n>
  
  <!-- Dashboard Header -->
  <div class="dashboard-header text-center py-5 mb-4 bg-gradient" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);">
    <div class="container">
      <i class="bi bi-shield-check text-white display-3 mb-3"></i>
      <h1 class="fw-bold text-white mb-2">Admin Dashboard</h1>
      <p class="text-white fs-5">Hospital Management System</p>
    </div>
  </div>

  <div class="container py-4">
    <!-- Message -->
    <div v-if="message" class="alert alert-success alert-dismissible fade show">
      <i class="bi bi-check-circle-fill me-2"></i>{{ message }}
      <button type="button" class="btn-close" @click="removemessage"></button>
    </div>

    <!-- Search Section -->
    <div class="card shadow mb-4">
      <div class="card-header bg-primary text-white">
        <h5 class="mb-0"><i class="bi bi-search me-2"></i>Search Patients / Doctors</h5>
      </div>
      <div class="card-body">
        <div class="row">
          <div class="col-md-8 mb-3">
            <input v-model="searchQuery" class="form-control" placeholder="Search by name, email, or specialization..." @keyup.enter="performSearch">
          </div>
          <div class="col-md-2 mb-3">
            <select v-model="searchType" class="form-select">
              <option value="all">All</option>
              <option value="patient">Patients</option>
              <option value="doctor">Doctors</option>
            </select>
          </div>
          <div class="col-md-2 mb-3">
            <button class="btn btn-primary w-100" @click="performSearch">
              <i class="bi bi-search me-2"></i>Search
            </button>
          </div>
        </div>
        
        <!-- Search Results -->
        <div v-if="searchResults.patients.length || searchResults.doctors.length" class="mt-3">
          <div v-if="searchResults.patients.length">
            <h6 class="fw-bold">Patients Found:</h6>
            <div class="table-responsive">
              <table class="table table-sm table-bordered">
                <thead class="table-light">
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Phone</th>
                    <th>Blood Group</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="p in searchResults.patients" :key="p.id">
                    <td>{{ p.name }}</td>
                    <td>{{ p.email }}</td>
                    <td>{{ p.phone || 'N/A' }}</td>
                    <td>{{ p.blood_group || 'N/A' }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
          <div v-if="searchResults.doctors.length" class="mt-3">
            <h6 class="fw-bold">Doctors Found:</h6>
            <div class="table-responsive">
              <table class="table table-sm table-bordered">
                <thead class="table-light">
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Department</th>
                    <th>Qualification</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="d in searchResults.doctors" :key="d.id">
                    <td>{{ d.name }}</td>
                    <td>{{ d.email }}</td>
                    <td>{{ d.department }}</td>
                    <td>{{ d.qualification }}</td>
                    <td><span :class="d.is_available ? 'badge bg-success' : 'badge bg-secondary'">
                      {{ d.is_available ? 'Available' : 'Not Available' }}
                    </span></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Doctor Management Section -->
    <div class="card shadow mb-4">
      <div class="card-header bg-success text-white d-flex justify-content-between align-items-center">
        <h5 class="mb-0"><i class="bi bi-person-badge me-2"></i>Doctor Management</h5>
        <button class="btn btn-light btn-sm" @click="openDoctorModal()">
          <i class="bi bi-plus-circle me-2"></i>Add New Doctor
        </button>
      </div>
      <div class="card-body">
        <div class="table-responsive">
          <table class="table table-hover table-bordered">
            <thead class="table-success">
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Department</th>
                <th>License #</th>
                <th>Fee</th>
                <th>Available</th>
                <th>Active status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="doc in doctors" :key="doc.id">
                <td>{{ doc.name }}</td>
                <td>{{ doc.email }}</td>
                <td>{{ doc.department }}</td>
                <td>{{ doc.license_number }}</td>
                <td>₹{{ doc.consultation_fee }}</td>
                <td>
                  <span :class="doc.is_available ? 'badge bg-success' : 'badge bg-secondary'">
                    {{ doc.is_available ? 'Yes' : 'No' }}
                  </span>
                </td>
                <td>
                  <span :class="doc.is_active ? 'badge bg-success' : 'badge bg-secondary'">
                    {{ doc.is_active ? 'Yes' : 'No' }}
                  </span>
                </td>
                <td>
                  <button class="btn btn-sm btn-warning me-1" @click="openDoctorModal(doc)">
                    <i class="bi bi-pencil"></i>
                  </button>
                  <button class="btn btn-sm btn-danger" @click="deleteDoctor(doc.id)">
                    <i class="bi bi-trash"></i>
                  </button>
                  <button class="btn btn-sm btn-success" @click="restoreDoctor(doc.id)">
                    <i class="bi bi-trash"></i>
                  </button>
                </td>
              </tr>
              <tr v-if="!doctors.length">
                <td colspan="7" class="text-center text-muted">No doctors found</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Appointments Management Section -->
    <div class="card shadow mb-4">
      <div class="card-header bg-info text-white">
        <h5 class="mb-0"><i class="bi bi-calendar-check me-2"></i>All Appointments</h5>
      </div>
      <div class="card-body">
        <div class="table-responsive">
          <table class="table table-hover table-bordered">
            <thead class="table-info">
              <tr>
                <th>Patient</th>
                <th>Doctor</th>
                <th>Department</th>
                <th>Date</th>
                <th>Time</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="apt in appointments" :key="apt.id">
                <td>{{ apt.patient_name }}</td>
                <td>Dr. {{ apt.doctor_name }}</td>
                <td>{{ apt.department }}</td>
                <td>{{ apt.appointment_date }}</td>
                <td>{{ apt.appointment_time }}</td>
                <td>
                  <span class="badge" :class="getStatusBadge(apt.status)">{{ apt.status }}</span>
                </td>
                <td>
                  <button v-if="apt.status === 'Booked'" class="btn btn-sm btn-danger" @click="cancelAppointment(apt.id)">
                    <i class="bi bi-x-circle me-1"></i>Cancel
                  </button>
                </td>
              </tr>
              <tr v-if="!appointments.length">
                <td colspan="7" class="text-center text-muted">No appointments found</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>

  <!--Patients active/block status-->

  <div class="card-body">
        <div class="table-responsive">
          <table class="table table-hover table-bordered">
            <thead class="table-info">
              <tr>
                <th>Patient</th>
                <th>Status-ACTIVE/INACTIVE</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="apt in pat_info" :key="apt.id">
                <td>{{ apt.name }}</td>
                <td>
                  <span v-if="apt.active === true" class="badge bg-success">ACTIVE</span>
                  <span v-else class="badge bg-danger">INACTIVE</span>
                </td>
                <td>
                  <button v-if="apt.active === true" class="btn btn-sm btn-danger" @click="deactivePatient(apt.id)">
                    <i class="bi bi-x-circle me-1"></i>BLOCK-PATIENT
                  </button>
                  <button v-if="apt.active === false" class="btn btn-sm btn-success" @click="reactivate(apt.id)">
                    <i class="bi bi-check-circle me-1"></i>ACTIVATE-PATIENT
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

  <!-- Doctor Modal -->
  <div v-if="showDoctorModal" class="modal d-block" style="background: rgba(0,0,0,0.5)">
    <div class="modal-dialog modal-lg">
      <div class="modal-content">
        <div class="modal-header bg-success text-white">
          <h5 class="modal-title">{{ isEdit ? 'Edit Doctor' : 'Add New Doctor' }}</h5>
          <button type="button" class="btn-close btn-close-white" @click="showDoctorModal = false"></button>
        </div>
        <div class="modal-body">
          <div class="row">
            <div class="col-md-6 mb-3">
              <label class="form-label">First Name *</label>
              <input type="text" class="form-control" v-model="doctorForm.first_name">
            </div>
            <div class="col-md-6 mb-3">
              <label class="form-label">Last Name *</label>
              <input type="text" class="form-control" v-model="doctorForm.last_name">
            </div>
            <div class="col-md-6 mb-3">
              <label class="form-label">Email *</label>
              <input type="email" class="form-control" v-model="doctorForm.email" :disabled="isEdit">
            </div>
            <div class="col-md-6 mb-3">
              <label class="form-label">Phone</label>
              <input type="text" class="form-control" v-model="doctorForm.phone">
            </div>
            <div class="col-md-6 mb-3">
              <label class="form-label">Department *</label>
              <select class="form-select" v-model="doctorForm.department_id">
                <option value="">Select Department</option>
                <option v-for="dept in departments" :key="dept.id" :value="dept.id">{{ dept.name }}</option>
              </select>
            </div>
            <div class="col-md-6 mb-3">
              <label class="form-label">License Number *</label>
              <input type="text" class="form-control" v-model="doctorForm.license_number">
            </div>
            <div class="col-md-12 mb-3">
              <label class="form-label">Qualification</label>
              <input type="text" class="form-control" v-model="doctorForm.qualification" placeholder="MBBS, MD, etc.">
            </div>
            <div class="col-md-6 mb-3">
              <label class="form-label">Experience (years)</label>
              <input type="number" class="form-control" v-model="doctorForm.experience_years">
            </div>
            <div class="col-md-6 mb-3">
              <label class="form-label">Consultation Fee (₹)</label>
              <input type="number" class="form-control" v-model="doctorForm.consultation_fee">
            </div>
            <div class="col-md-12 mb-3">
              <label class="form-label">Available Days</label>
              <input type="text" class="form-control" v-model="doctorForm.available_days" placeholder="Mon,Tue,Wed,Thu,Fri">
            </div>
            <div class="col-md-6 mb-3">
              <label class="form-label">Available From</label>
              <input type="time" class="form-control" v-model="doctorForm.available_from">
            </div>
            <div class="col-md-6 mb-3">
              <label class="form-label">Available To</label>
              <input type="time" class="form-control" v-model="doctorForm.available_to">
            </div>
            <div class="col-md-6 mb-3">
              <div class="form-check">
                <input class="form-check-input" type="checkbox" v-model="doctorForm.is_available" id="availCheck">
                <label class="form-check-label" for="availCheck">
                  Currently Available
                </label>
              </div>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" @click="showDoctorModal = false">Cancel</button>
          <button type="button" class="btn btn-success" @click="saveDoctor">
            <i class="bi bi-check-circle me-2"></i>{{ isEdit ? 'Update' : 'Create' }} Doctor
          </button>
        </div>
      </div>
    </div>
  </div>

</div>
`,
  data() {
    return {
      doctors: [],
      appointments: [],
      departments: [],
      message: "",
      searchQuery: "",
      searchType: "all",
      searchResults: { patients: [], doctors: [] },
      showDoctorModal: false,
      isEdit: false,
      pat_info: [],
      doctorForm: {
        id: null,
        first_name: "",
        last_name: "",
        email: "",
        phone: "",
        department_id: "",
        license_number: "",
        qualification: "",
        experience_years: 0,
        consultation_fee: 0,
        available_days: "Mon,Tue,Wed,Thu,Fri",
        available_from: "09:00",
        available_to: "17:00",
        is_available: true
      }
    }
  },
  mounted() {
    this.fetchDoctors();
    this.fetchAppointments();
    this.fetchDepartments();
    this.fetchpatients();
  },
  methods: {
    fetchDoctors() {
      fetch("/api/admin/doctors", {
        headers: { "Authentication-Token": localStorage.getItem("auth_token") }
      })
      .then(r => r.json())
      .then(data => {
        this.doctors = data.doctors || [];
      })
      .catch(err => console.error('Error fetching doctors:', err));
    },
    fetchAppointments() {
      fetch("/api/admin/appointments", {
        headers: { "Authentication-Token": localStorage.getItem("auth_token") }
      })
      .then(r => r.json())
      .then(data => {
        this.appointments = data.appointments || [];
      })
      .catch(err => console.error('Error fetching appointments:', err));
    },
    fetchDepartments() {
      fetch("/api/get_departments", {
        headers: { "Content-Type": "application/json" }
      })
      .then(r => r.json())
      .then(data => {
        this.departments = data.departments || [];
      });
    },
    performSearch() {
      if (!this.searchQuery) return;
      
      fetch('/api/admin/search?query=' + this.searchQuery + '&type=' + this.searchType, {
        headers: { "Authentication-Token": localStorage.getItem("auth_token") }
      })
      .then(r => r.json())
      .then(data => {
        this.searchResults = data;
      })
      .catch(err => console.error('Error searching:', err));
    },
    openDoctorModal(doctor = null) {
      this.isEdit = !!doctor;
      if (doctor) {
        this.doctorForm = { ...doctor };
      } else {
        this.doctorForm = {
          id: null,
          first_name: "",
          last_name: "",
          email: "",
          phone: "",
          department_id: "",
          license_number: "",
          qualification: "",
          experience_years: 0,
          consultation_fee: 0,
          available_days: "Mon,Tue,Wed,Thu,Fri",
          available_from: "09:00",
          available_to: "17:00",
          is_available: true
        };
      }
      this.showDoctorModal = true;
    },
    saveDoctor() {
      const url = this.isEdit ? '/api/admin/update_doctor' : '/api/admin/create_doctor';
      fetch(url, {
        method: 'POST',
        headers: {
          "Content-Type": "application/json",
          "Authentication-Token": localStorage.getItem("auth_token")
        },
        body: JSON.stringify(this.doctorForm)
      })
      .then(r => r.json())
      .then(data => {
        this.message = data.message;
        this.showDoctorModal = false;
        this.fetchDoctors();
      })
      .catch(err => {
        console.error('Error saving doctor:', err);
        alert('Error saving doctor');
      });
    },
    deleteDoctor(id) {
      if (!confirm("Are you sure you want to deactivate this doctor?")) return;
      
      fetch('/api/admin/delete_doctor/' + id, {
        method: 'DELETE',
        headers: { "Authentication-Token": localStorage.getItem("auth_token") }
      })
      .then(r => r.json())
      .then(data => {
        this.message = data.message;
        this.fetchDoctors();
      })
      .catch(err => console.error('Error deleting doctor:', err));
    },
    restoreDoctor(id) {
      if (!confirm("Are you sure you want to reactivate this doctor?")) return;
      
      fetch('/api/admin/restore_doctor/' + id, {
        method: 'POST',
        headers: { "Authentication-Token": localStorage.getItem("auth_token") }
      })
      .then(r => r.json())
      .then(data => {
        this.message = data.message;
        this.fetchDoctors();
      })
      .catch(err => console.error('Error restoring doctor:', err));
    },
    cancelAppointment(id) {
      if (!confirm("Are you sure you want to cancel this appointment?")) return;
      
      fetch('/api/admin/update_appointment', {
        method: 'POST',
        headers: {
          "Content-Type": "application/json",
          "Authentication-Token": localStorage.getItem("auth_token")
        },
        body: JSON.stringify({ appointment_id: id, status: 'Cancelled' })
      })
      .then(r => r.json())
      .then(data => {
        this.message = data.message;
        this.fetchAppointments();
      })
      .catch(err => console.error('Error cancelling appointment:', err));
    },
    reactivate(id) {
      if (!confirm("Are you sure you want to activate this patient?")) return;

      fetch('/api/admin/reactivate_patient', {
        method: 'POST',
        headers: { "Content-Type": "application/json",
          "Authentication-Token": localStorage.getItem("auth_token") },
        body:JSON.stringify({ patient_id: id })
      })
      .then(r => r.json())
      .then(data => {
        this.message = data.message;
        this.fetchpatients();
      })
      .catch(err => console.error('Error blocking patient:', err));
    },
    deactivePatient(id) {
      if (!confirm("Are you sure you want to block this patient?")) return;

      fetch('/api/admin/deactive_patient',{
        method: 'POST',
        headers: { "Content-Type": "application/json",
          "Authentication-Token": localStorage.getItem("auth_token") },
        body:JSON.stringify({ patient_id: id })
      })
      .then(r => r.json())
      .then(data => {
        this.message = data.message;
        this.fetchpatients();
      })
      .catch(err => console.error('Error blocking patient:', err));
    },
    getStatusBadge(status) {
      const badges = {
        'Booked': 'bg-primary',
        'Completed': 'bg-success',
        'Cancelled': 'bg-danger',
        'Rescheduled': 'bg-warning'
      };
      return badges[status] || 'bg-secondary';
    },
    removemessage(){
      this.message = "";
    },
    fetchpatients(){
      fetch("/api/admin/patient_status",{
        headers: { "Authentication-Token": localStorage.getItem("auth_token") }
      })
      .then(r => r.json())
      .then(data => {
        this.pat_info = data.patient || [];
      })
      .catch(err => console.error('Error fetching patient status:', err));
    }
  }
}