import cusnav from "./cusnav.js"
export default {
  components: {
    'n': cusnav
  },
  template: `
<div class="doctor-dashboard">
  <n></n>
 
      <h1>Doctor Dashboard</h1>
      <p >Manage patient appointments and medical records</p>
    
  

  <div class="container py-4">
    <!-- Message -->
    <div v-if="message" class="alert alert-success alert-dismissible fade show">
      <i class="bi bi-check-circle-fill me-2"></i>{{ message }}
      <button type="button" class="btn-close" @click="message = ''"></button>
    </div>

    <!-- Upcoming Appointments -->
    <div class="mb-5">
      <div class="section-header mb-4">
        <h3 class="fw-bold text-primary">
          <i class="bi bi-calendar-event me-2"></i>Upcoming Appointments
        </h3>
      </div>
      <div v-if="!upcomingAppointments.length" class="alert alert-info">
        <i class="bi bi-info-circle me-2"></i>No upcoming appointments scheduled
      </div>
      <div class="row">
        <div v-for="apt in upcomingAppointments" :key="apt.id" class="col-lg-6 col-xl-4 mb-4">
          <div class="card shadow border-0 h-100">
            <div class="card-header bg-primary text-white">
              <h5 class="mb-0"><i class="bi bi-person-circle me-2"></i>{{ apt.patient_name }}</h5>
            </div>
            <div class="card-body">
              <div class="mb-2"><i class="bi bi-envelope text-primary me-2"></i><strong>Email:</strong> {{ apt.patient_email }}</div>
              <div class="mb-2"><i class="bi bi-telephone text-primary me-2"></i><strong>Phone:</strong> {{ apt.patient_phone || 'N/A' }}</div>
              <div class="mb-2"><i class="bi bi-calendar3 text-primary me-2"></i><strong>Date:</strong> {{ apt.appointment_date }}</div>
              <div class="mb-2"><i class="bi bi-clock text-primary me-2"></i><strong>Time:</strong> {{ apt.appointment_time }}</div>
              <div class="mb-2"><i class="bi bi-info-circle text-primary me-2"></i><strong>Reason:</strong> {{ apt.reason_for_visit || 'N/A' }}</div>
              <div class="mb-3"><i class="bi bi-thermometer text-primary me-2"></i><strong>Symptoms:</strong> {{ apt.symptoms || 'N/A' }}</div>
              <div class="btn-group w-100" role="group">
                <button class="btn btn-success" @click="openTreatmentModal(apt)">
                  <i class="bi bi-check-circle me-1"></i>Complete
                </button>
                <button class="btn btn-info" @click="viewPatientHistory(apt.id)">
                  <i class="bi bi-file-medical me-1"></i>History
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Completed Appointments -->
    <hr class="my-5">
    <div class="section-header mb-4">
      <h3 class="fw-bold text-secondary">
        <i class="bi bi-check2-square me-2"></i>Completed Appointments
      </h3>
    </div>
    <div class="table-responsive">
      <table class="table table-hover table-bordered">
        <thead class="table-success">
          <tr>
            <th>Patient Name</th>
            <th>Date</th>
            <th>Time</th>
            <th>Reason</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="apt in completedAppointments" :key="apt.id">
            <td>{{ apt.patient_name }}</td>
            <td>{{ apt.appointment_date }}</td>
            <td>{{ apt.appointment_time }}</td>
            <td>{{ apt.reason_for_visit || 'N/A' }}</td>
            <td><span class="badge bg-success">{{ apt.status }}</span></td>
            <td>
              <button class="btn btn-sm btn-info" @click="viewPatientHistory(apt.id)">
                <i class="bi bi-eye"></i> View History
              </button>
            </td>
          </tr>
          <tr v-if="!completedAppointments.length">
            <td colspan="6" class="text-center text-muted py-4">
              <i class="bi bi-inbox display-4 d-block mb-2"></i>No completed appointments
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>

  <!-- Complete Treatment Modal -->
  <div v-if="showTreatmentModal" class="modal d-block" style="background: rgba(0,0,0,0.5)">
    <div class="modal-dialog modal-lg">
      <div class="modal-content">
        <div class="modal-header bg-success text-white">
          <h5 class="modal-title">Complete Appointment - {{ selectedAppointment.patient_name }}</h5>
          <button type="button" class="btn-close btn-close-white" @click="showTreatmentModal = false"></button>
        </div>
        <div class="modal-body">
          <div class="row">
            <div class="col-md-6 mb-3">
              <label class="form-label"><strong>Blood Pressure</strong></label>
              <input type="text" class="form-control" v-model="treatmentData.blood_pressure" placeholder="120/80">
            </div>
            <div class="col-md-6 mb-3">
              <label class="form-label"><strong>Temperature (°C)</strong></label>
              <input type="number" step="0.1" class="form-control" v-model="treatmentData.temperature" placeholder="98.6">
            </div>
            <div class="col-md-6 mb-3">
              <label class="form-label"><strong>Pulse Rate (bpm)</strong></label>
              <input type="number" class="form-control" v-model="treatmentData.pulse_rate" placeholder="72">
            </div>
            <div class="col-md-6 mb-3">
              <label class="form-label"><strong>Weight (kg)</strong></label>
              <input type="number" step="0.1" class="form-control" v-model="treatmentData.weight" placeholder="70">
            </div>
            <div class="col-12 mb-3">
              <label class="form-label"><strong>Diagnosis *</strong></label>
              <textarea class="form-control" v-model="treatmentData.diagnosis" rows="3" placeholder="Enter diagnosis details" required></textarea>
            </div>
            <div class="col-12 mb-3">
              <label class="form-label"><strong>Prescription</strong></label>
              <textarea class="form-control" v-model="treatmentData.prescription" rows="3" placeholder="Enter prescribed medications"></textarea>
            </div>
            <div class="col-12 mb-3">
              <label class="form-label"><strong>Tests Recommended</strong></label>
              <textarea class="form-control" v-model="treatmentData.tests_recommended" rows="2" placeholder="Enter recommended tests"></textarea>
            </div>
            <div class="col-12 mb-3">
              <label class="form-label"><strong>Doctor Notes</strong></label>
              <textarea class="form-control" v-model="treatmentData.notes" rows="3" placeholder="Additional notes"></textarea>
            </div>
            <div class="col-md-6 mb-3">
              <div class="form-check">
                <input class="form-check-input" type="checkbox" v-model="treatmentData.follow_up_required" id="followUpCheck">
                <label class="form-check-label" for="followUpCheck">
                  <strong>Follow-up Required</strong>
                </label>
              </div>
            </div>
            <div class="col-md-6 mb-3" v-if="treatmentData.follow_up_required">
              <label class="form-label"><strong>Follow-up Date</strong></label>
              <input type="date" class="form-control" v-model="treatmentData.follow_up_date">
            </div>
            <div class="col-12 mb-3" v-if="treatmentData.follow_up_required">
              <label class="form-label"><strong>Follow-up Notes</strong></label>
              <textarea class="form-control" v-model="treatmentData.follow_up_notes" rows="2"></textarea>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" @click="showTreatmentModal = false">Cancel</button>
          <button type="button" class="btn btn-success" @click="completeAppointment">
            <i class="bi bi-check-circle me-2"></i>Mark as Completed
          </button>
        </div>
      </div>
    </div>
  </div>

  <!-- Patient History Modal -->
  <div v-if="showHistoryModal" class="modal d-block" style="background: rgba(0,0,0,0.5)">
    <div class="modal-dialog modal-xl">
      <div class="modal-content">
        <div class="modal-header bg-info text-white">
          <h5 class="modal-title">Patient Medical History - {{ patientHistory.patient_name }}</h5>
          <button type="button" class="btn-close btn-close-white" @click="showHistoryModal = false"></button>
        </div>
        <div class="modal-body">
          <div class="row mb-4">
            <div class="col-md-6">
              <p><strong>Email:</strong> {{ patientHistory.patient_email }}</p>
              <p><strong>Blood Group:</strong> {{ patientHistory.blood_group || 'N/A' }}</p>
            </div>
            <div class="col-md-6">
              <p><strong>Allergies:</strong> {{ patientHistory.allergies || 'None' }}</p>
              <p><strong>Chronic Conditions:</strong> {{ patientHistory.chronic_conditions || 'None' }}</p>
            </div>
          </div>
          <hr>
          <h6 class="fw-bold mb-3">Previous Visits</h6>
          <div v-if="!patientHistory.history || !patientHistory.history.length" class="alert alert-info">
            No previous medical history found
          </div>
          <div v-for="(record, index) in patientHistory.history" :key="index" class="card mb-3">
            <div class="card-header bg-light">
              <strong>{{ record.appointment_date }}</strong> - Dr. {{ record.doctor_name }} ({{ record.department }})
            </div>
            <div class="card-body">
              <p><strong>Diagnosis:</strong> {{ record.diagnosis }}</p>
              <p><strong>Prescription:</strong> {{ record.prescription || 'N/A' }}</p>
              <p><strong>Tests:</strong> {{ record.tests_recommended || 'N/A' }}</p>
              <p><strong>Notes:</strong> {{ record.notes || 'N/A' }}</p>
              <p v-if="record.follow_up_required">
                <strong>Follow-up:</strong> {{ record.follow_up_date }}
              </p>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" @click="showHistoryModal = false">Close</button>
        </div>
      </div>
    </div>
  </div>
</div>
`,
  data() {
    return {
      upcomingAppointments: [],
      completedAppointments: [],
      message: "",
      showTreatmentModal: false,
      showHistoryModal: false,
      selectedAppointment: {},
      patientHistory: {},
      treatmentData: {
        blood_pressure: "",
        temperature: null,
        pulse_rate: null,
        weight: null,
        diagnosis: "",
        prescription: "",
        tests_recommended: "",
        notes: "",
        follow_up_required: false,
        follow_up_date: "",
        follow_up_notes: ""
      }
    };
  },
  mounted() {
    this.fetchAppointments();
  },
  methods: {
    fetchAppointments() {
      fetch('/api/doctor/appointments', {
        headers: { 
          "Content-Type": "application/json", 
          "Authentication-Token": localStorage.getItem('auth_token') 
        }
      })
      .then(r => r.json())
      .then(data => {
        if (data.upcoming) {
          this.upcomingAppointments = data.upcoming;
          this.completedAppointments = data.completed;
        }
      })
      .catch(err => {
        console.error('Error fetching appointments:', err);
      });
    },
    openTreatmentModal(appointment) {
      this.selectedAppointment = appointment;
      this.treatmentData = {
        blood_pressure: "",
        temperature: null,
        pulse_rate: null,
        weight: null,
        diagnosis: "",
        prescription: "",
        tests_recommended: "",
        notes: "",
        follow_up_required: false,
        follow_up_date: "",
        follow_up_notes: ""
      };
      this.showTreatmentModal = true;
    },
    completeAppointment() {
      if (!this.treatmentData.diagnosis) {
        alert('Please enter diagnosis');
        return;
      }

      fetch('/api/doctor/complete_appointment', {
        method: 'POST',
        headers: { 
          "Content-Type": "application/json", 
          "Authentication-Token": localStorage.getItem('auth_token') 
        },
        body: JSON.stringify({
          appointment_id: this.selectedAppointment.id,
          ...this.treatmentData
        })
      })
      .then(r => r.json())
      .then(data => {
        this.message = data.message;
        this.showTreatmentModal = false;
        this.fetchAppointments();
      })
      .catch(err => {
        console.error('Error completing appointment:', err);
        alert('Error completing appointment');
      });
    },
    viewPatientHistory(appointmentId) {
      // Get patient_id from the appointment
      const appointment = [...this.upcomingAppointments, ...this.completedAppointments]
        .find(apt => apt.id === appointmentId);
      
      if (!appointment) return;

      // Extract patient ID from appointment (you'll need to pass this from backend)
      // For now, we'll use a workaround - fetch from the appointment details
      fetch('/api/doctor/patient_history/' + appointmentId, {
        headers: { 
          "Content-Type": "application/json", 
          "Authentication-Token": localStorage.getItem('auth_token') 
        }
      })
      .then(r => r.json())
      .then(data => {
        this.patientHistory = data;
        this.showHistoryModal = true;
      })
      .catch(err => {
        console.error('Error fetching patient history:', err);
      });
    }
  }
}
