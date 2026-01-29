import Navbar from "./Navbar.js"
export default{
    components:{
        'n':Navbar

    },
    template:`
<div class="container-fluid bg-light min-vh-100 d-flex justify-content-center align-items-center">
  <div class="card shadow-lg border-0 rounded-4" style="width: 450px;">
    <!-- Header -->
    <div class="card-header bg-primary text-white text-center rounded-top-4 py-3">
      <h3 class="mb-0 fw-bold">Login-Desk</h3>
    </div>

    <!-- Body -->
    <div class="card-body p-4">
      <h5 class="text-center mb-4 text-secondary">Welcome Back!</h5>

      <!-- Login Form -->
      <div class="mb-3">
        <label for="email" class="form-label fw-semibold">Email Address</label>
        <input
          type="text"
          id="email"
          class="form-control"
          placeholder="Enter your email"
          v-model="formData.email"
        >
      </div>

      <div class="mb-3">
        <label for="pass" class="form-label fw-semibold">Password</label>
        <input
          type="password"
          id="pass"
          class="form-control"
          placeholder="Enter your password"
          v-model="formData.password"
        >
      </div>

      <!-- Message -->
      <div v-if="message" class="alert alert-info py-2 text-center mt-3">
        {{ message }}
      </div>

      <!-- Login Button -->
      <div class="d-grid mt-4">
        <button class="btn btn-primary btn-lg" @click="loginUser">
          <i class="bi bi-box-arrow-in-right me-2"></i> Login
        </button>
      </div>

      <!-- Divider -->
      <hr class="my-4">

      <!-- Register Section -->
      <div class="text-center">
        <p class="mb-1 text-muted">Don't have an account?</p>
        <router-link to="/register" class="btn btn-outline-primary btn-sm px-4">
          Register as Patient
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
                password:""
            },
            message:""
        }
    },
    methods:{
        loginUser: function(){
            fetch('/api/login',{
                method: 'POST',
                headers: {
                    "Content-Type":'application/json'
                },
                body:JSON.stringify(this.formData)

            })
            .then(response => response.json())
            .then(data => {if (Object.keys(data).includes('auth-token')){
                localStorage.setItem("auth_token",data["auth-token"])
                if(data.roles.includes('admin')){
                    this.$router.push('/admin')
                }else if(data.roles.includes('patient')){
                    this.$router.push('/dashboard')
                }
                else{
                    this.$router.push('/doc_dashboard')
                }
            }
                
              
            else{
                this.message=data.message
            }
                
                   
                })

            },
            
    }
        }


