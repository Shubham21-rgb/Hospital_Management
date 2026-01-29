import Navbar from "./Navbar.js"
export default{
    components:{
        'n':Navbar,
    },
    template:`
    <div class="container-fluid bg-light min-vh-100 d-flex justify-content-center align-items-center">
  <div class="card shadow-lg border-0 rounded-4" style="width: 500px;">
    
    <!-- Header -->
    <div class="card-header bg-success text-white text-center rounded-top-4 py-3">
      <h3 class="mb-0 fw-bold">Hospital Patient Registration</h3>
    </div>

    <!-- Body -->
    <div class="card-body p-4">
      <p class="text-center text-muted small mb-4">
        This is the base registration page. You can add more details once you enter your User Dashboard.
      </p>

      <!-- Registration Form -->
      <div class="mb-3">
        <label for="email" class="form-label fw-semibold">Email Address</label>
        <input 
          type="email" 
          id="email" 
          class="form-control" 
          placeholder="Enter your email"
          v-model="formData.email"
        >
      </div>

      <div class="mb-3">
        <label for="username" class="form-label fw-semibold">Create Username</label>
        <input 
          type="text" 
          id="username" 
          class="form-control" 
          placeholder="Username must be unique"
          v-model="formData.username"
        >
      </div>

      <div class="mb-3">
        <label for="password" class="form-label fw-semibold">Create Password</label>
        <input 
          type="password" 
          id="password" 
          class="form-control" 
          placeholder="Enter your password"
          v-model="formData.password"
        >
      </div>

      <div class="row">
        <div class="col-md-6 mb-3">
          <label for="first_name" class="form-label fw-semibold">First Name</label>
          <input 
            type="text" 
            id="first_name" 
            class="form-control" 
            placeholder="Enter first name"
            v-model="formData.first_name"
          >
        </div>

        <div class="col-md-6 mb-3">
          <label for="last_name" class="form-label fw-semibold">Last Name</label>
          <input 
            type="text" 
            id="last_name" 
            class="form-control" 
            placeholder="Enter last name"
            v-model="formData.last_name"
          >
        </div>
      </div>

      <div class="mb-3">
        <label for="phone" class="form-label fw-semibold">Phone Number</label>
        <input 
          type="tel" 
          id="phone" 
          class="form-control" 
          placeholder="Enter phone number"
          v-model="formData.phone"
        >
      </div>

      <div class="mb-3">
        <label for="address" class="form-label fw-semibold">Address</label>
        <input 
          type="text" 
          id="address" 
          class="form-control" 
          placeholder="Enter your address"
          v-model="formData.address"
        >
      </div>

      <div class="row">
        <div class="col-md-6 mb-3">
          <label for="date_of_birth" class="form-label fw-semibold">Date of Birth</label>
          <input 
            type="date" 
            id="date_of_birth" 
            class="form-control" 
            v-model="formData.date_of_birth"
          >
        </div>

        <div class="col-md-6 mb-3">
          <label for="gender" class="form-label fw-semibold">Gender</label>
          <select 
            id="gender" 
            class="form-control" 
            v-model="formData.gender"
          >
            <option value="">Select Gender</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other">Other</option>
          </select>
        </div>
      </div>

      <div class="mb-3">
        <label for="blood_group" class="form-label fw-semibold">Blood Group</label>
        <select 
          id="blood_group" 
          class="form-control" 
          v-model="formData.blood_group"
        >
          <option value="">Select Blood Group</option>
          <option value="A+">A+</option>
          <option value="A-">A-</option>
          <option value="B+">B+</option>
          <option value="B-">B-</option>
          <option value="AB+">AB+</option>
          <option value="AB-">AB-</option>
          <option value="O+">O+</option>
          <option value="O-">O-</option>
        </select>
      </div>

      <div class="mb-3">
        <label class="form-label fw-semibold">Emergency Contact Information</label>
      </div>

      <div class="mb-3">
        <label for="emergency_contact_name" class="form-label fw-semibold">Emergency Contact Name</label>
        <input 
          type="text" 
          id="emergency_contact_name" 
          class="form-control" 
          placeholder="Enter emergency contact name"
          v-model="formData.emergency_contact_name"
        >
      </div>

      <div class="row">
        <div class="col-md-6 mb-3">
          <label for="emergency_contact" class="form-label fw-semibold">Emergency Contact Phone</label>
          <input 
            type="tel" 
            id="emergency_contact" 
            class="form-control" 
            placeholder="Enter emergency contact"
            v-model="formData.emergency_contact"
          >
        </div>

        <div class="col-md-6 mb-3">
          <label for="emergency_contact_relation" class="form-label fw-semibold">Relation</label>
          <input 
            type="text" 
            id="emergency_contact_relation" 
            class="form-control" 
            placeholder="E.g., Spouse, Parent"
            v-model="formData.emergency_contact_relation"
          >
        </div>
      </div>

      <div class="mb-3">
        <label for="allergies" class="form-label fw-semibold">Allergies</label>
        <textarea 
          id="allergies" 
          class="form-control" 
          rows="2"
          placeholder="List any known allergies"
          v-model="formData.allergies"
        ></textarea>
      </div>

      <div class="mb-3">
        <label for="chronic_conditions" class="form-label fw-semibold">Chronic Conditions</label>
        <textarea 
          id="chronic_conditions" 
          class="form-control" 
          rows="2"
          placeholder="List any chronic conditions"
          v-model="formData.chronic_conditions"
        ></textarea>
      </div>

      <!-- Message Display -->
      <div v-if="message" class="alert alert-info py-2 text-center mt-3">
        {{ message }}
      </div>

      <!-- Register Button -->
      <div class="d-grid mt-4">
        <button class="btn btn-success btn-lg" @click="RegisUser">
          <i class="bi bi-person-plus-fill me-2"></i> Register
        </button>
      </div>

      <!-- Divider -->
      <hr class="my-4">

      <!-- Already Registered -->
      <div class="text-center">
        <p class="mb-1 text-muted">Already have an account?</p>
        <router-link to="/login" class="btn btn-outline-success btn-sm px-4">
          Login Here
        </router-link>
      </div>
    </div>
  </div>
</div>
`,
    data: function(){
        return{
            formData:{
                email:"",
                username:"",
                password:"",
                first_name:"",
                last_name:"",
                phone:"",
                address:"",
                date_of_birth:"",
                gender:"",
                blood_group:"",
                emergency_contact:"",
                emergency_contact_name:"",
                emergency_contact_relation:"",
                allergies:"",
                chronic_conditions:""
            },
            message:""
        }
    },
    methods:{
        RegisUser: function(){
            fetch('/api/patient_register',{
                method: 'POST',
                headers: {
                    "Content-Type":'application/json'
                },
                body:JSON.stringify(this.formData)

            })
            .then(response => response.json())
            .then(data=>alert(data.message),
                this.$router.push('/login'))
                  
        }
    }
}  

