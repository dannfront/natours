// import axios from 'axios'
// import axios from 'axios'
import { alert } from './alerts.js'

export async function login(email, password) {
    try {
        const res = await axios({
            method: "POST",
            url: '/api/v1/users/login',
            data: {
                email,
                password
            },
            withCredentials: true 
        })
        // redireccionamos a la pagina principal 
        if(res.data.status==="success"){
            alert("logueado","success")
            window.location.href="/"
        }
    } catch (error) {
        alert(error.response.data.message,"error")
    }
}

export async function loggout(){
    try {
        const res=await axios({
            method:"GET",
            url: '/api/v1/users/logout',
        })
        if(res.data.status==="succes") location.reload(true)
    } catch (error) {
        alert("error when closing session","error")
    }
}


