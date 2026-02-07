import Home from './components/Home.js' 
import Login from './components/Login.js' 
import Register from './components/Register.js' 
import Navbar from './components/Navbar.js' 
import Footer from './components/Footer.js' 
import dashboard from './components/dashboard.js'
import admin from './components/admin.js'
import doctor from './components/doctor.js'
import payment from './components/payment.js'

const routes=[
    {path: '/',component: Home},
    {path:'/dashboard',component:dashboard},
    {path: '/login',component: Login},
    {path:'/register',component: Register},
    {path:'/admin',component:admin},
    {path:'/doctor',component:doctor},
    {path:'/payment',component:payment}
]
const router=new VueRouter({
    routes

})
const app = new Vue({
    el:"#app",
    router,
    template:`
    <div class="container">Welcome To Our Portal from Developer
    <router-view></router-view>
    <foot></foot>
    </div>
    `,
    data:{
        section:"frontend"
    },
    components:{
        "nav-bar":Navbar,
        "foot":Footer
    }
})
