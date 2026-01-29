import Navbar from './Navbar.js';

export default {
  components: {
    'n': Navbar
  },
  template: `
<div class="container py-4">
  <n></n>

  <div class="d-flex justify-content-between align-items-center mb-4">
    <h2 class="fw-bold text-primary">Admin Dashboard</h2>
    <button class="btn btn-success" @click="openCreateModal">
      <i class="bi bi-plus-circle me-2"></i> Create Parking Lot
    </button>
  </div>

  <!-- Message -->
  <div v-if="message" class="alert alert-info">{{ message }}</div>

  <!-- Parking Lots List -->
  <div class="row">
    <div v-for="lot in parkingLots" :key="lot.id" class="col-md-6 mb-4">
      <div class="card shadow-sm rounded-4">
        <div class="card-header bg-primary text-white d-flex justify-content-between align-items-center">
          <h5 class="mb-0">{{ lot.prime_location_name }}</h5>
          <div>
            <button class="btn btn-sm btn-light me-2" @click="openEditModal(lot)">
              <i class="bi bi-pencil"></i>
            </button>
            <button class="btn btn-sm btn-danger" @click="deleteLot(lot.id)">
              <i class="bi bi-trash"></i>
            </button>
          </div>
        </div>
        <div class="card-body">
          <p><strong>Address:</strong> {{ lot.address }}, {{ lot.city }} - {{ lot.pin_code }}</p>
          <p><strong>Price/hour:</strong> ₹{{ lot.price_per_hour }}</p>
          <p><strong>Spots:</strong> {{ lot.number_of_spots }}</p>
          <p><strong>Status:</strong> {{ lot.is_active ? 'Active' : 'Inactive' }}</p>

          <hr>
          <h6>Parking Spots</h6>
          <div class="d-flex flex-wrap">
            <span v-for="spot in lot.parking_spots" 
                  :key="spot.id"
                  class="badge m-1"
                  :class="spot.status === 'A' ? 'bg-success' : 'bg-danger'">
              {{ spot.spot_number }} ({{ spot.status === 'A' ? 'Available' : 'Occupied' }})
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Create/Edit Modal -->
  <div class="modal fade" id="lotModal" tabindex="-1">
    <div class="modal-dialog">
      <div class="modal-content rounded-4">
        <div class="modal-header bg-primary text-white">
          <h5 class="modal-title">{{ isEdit ? 'Edit Parking Lot' : 'Create Parking Lot' }}</h5>
          <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
        </div>
        <div class="modal-body">
          <div class="mb-3">
            <label class="form-label">Prime Location Name</label>
            <input v-model="formData.prime_location_name" class="form-control">
          </div>
          <div class="mb-3">
            <label class="form-label">Address</label>
            <input v-model="formData.address" class="form-control">
          </div>
          <div class="mb-3">
            <label class="form-label">City</label>
            <input v-model="formData.city" class="form-control">
          </div>
          <div class="mb-3">
            <label class="form-label">State</label>
            <input v-model="formData.state" class="form-control">
          </div>
          <div class="mb-3">
            <label class="form-label">Pin Code</label>
            <input v-model="formData.pin_code" class="form-control">
          </div>
          <div class="mb-3">
            <label class="form-label">Price/Hour</label>
            <input v-model="formData.price_per_hour" type="number" class="form-control">
          </div>
          <div class="mb-3">
            <label class="form-label">Number of Spots</label>
            <input v-model="formData.number_of_spots" type="number" class="form-control">
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
          <button class="btn btn-primary" @click="saveLot">
            {{ isEdit ? 'Update' : 'Create' }}
          </button>
        </div>
      </div>
    </div>
  </div>

</div>
`,
  data() {
    return {
      parkingLots: [],
      message: "",
      isEdit: false,
      formData: {
        id: null,
        prime_location_name: "",
        price_per_hour: "",
        address: "",
        pin_code: "",
        city: "",
        state: "",
        number_of_spots: ""
      }
    }
  },
  mounted() {
    this.fetchLots();
  },
  methods: {
    fetchLots() {
      fetch("/api/admin/parking-lots", {
        headers: {
          "Authentication-Token": localStorage.getItem("auth_token")
        }
      })
      .then(r => r.json())
      .then(data => {
        this.parkingLots = data.lots || [];
      });
    },
    openCreateModal() {
      this.isEdit = false;
      this.formData = { id: null, prime_location_name: "", price_per_hour: "", address: "", pin_code: "", city: "", state: "", number_of_spots: "" };
      new bootstrap.Modal(document.getElementById('lotModal')).show();
    },
    openEditModal(lot) {
      this.isEdit = true;
      this.formData = { ...lot };
      new bootstrap.Modal(document.getElementById('lotModal')).show();
    },
    saveLot() {
      const url = this.isEdit ? '/api/admin/update-lot' : '/api/admin/create-lot';
      fetch(url, {
        method: 'POST',
        headers: {
          "Content-Type": "application/json",
          "Authentication-Token": localStorage.getItem("auth_token")
        },
        body: JSON.stringify(this.formData)
      })
      .then(r => r.json())
      .then(data => {
        this.message = data.message;
        this.fetchLots();
        bootstrap.Modal.getInstance(document.getElementById('lotModal')).hide();
      });
    },
    deleteLot(id) {
      if (!confirm("Are you sure you want to delete this parking lot?")) return;
      fetch('/api/admin/delete-lot/' + id, {
        method: 'DELETE',
        headers: {
          "Authentication-Token": localStorage.getItem("auth_token")
        }
      })
      .then(r => r.json())
      .then(data => {
        this.message = data.message;
        this.fetchLots();
      });
    }
  }
}


/*
fetch---> backend se koi data front end ko feed kar ke liye use karte ha 
*/