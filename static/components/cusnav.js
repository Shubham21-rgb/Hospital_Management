export default{
    template:`
    <div class="row border">
    <div class="col-9 border fs-1">
       Hospital Management System
    </div>
    <div class="col-3 border d-flex align-items-center justify-content-between">
        <div v-for="t in sot" class="d-inline">
            <router-link class="btn btn-primary">Profile</router-link>
        </div>
        <button class="btn btn-primary" @click="logoutUser">Logout</button>
    </div>
</div>`,
    data:function(){
        return{
            ser:null,
            sot:null
        }

    },
    methods:{
        logoutUser(){
            localStorage.removeItem('auth_token');
            localStorage.removeItem('selected_lot');
            localStorage.removeItem('user_name');
            this.$router.push('/login');
        }
    }

}