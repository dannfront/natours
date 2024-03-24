// import axios from "axios";
import { alert } from "./alerts.js";

export async function updateMe(data){
    try {
        const res=await axios({
            method:"PATCH",
            url:"http://127.0.0.1:3000/api/v1/users/UpdateMe",
            data
        })
        alert("successful update","success")
        
    } catch (error) {
        alert("error al enviar los datos","error")
    }
}
export async function updatePassword(passwordCurrent,password,passwordConfirm){
    try {
        const res=await axios({
            method:"PATCH",
            url:"http://127.0.0.1:3000/api/v1/users/UpdatePassword",
            data:{
                passwordCurrent,
                password,
                passwordConfirm
            }
        })
        console.log(res.data);
        alert("successful update password","success")
        
    } catch (error) {
        alert("error al enviar los datos","error")
    }
}