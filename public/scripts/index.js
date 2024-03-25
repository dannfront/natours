import { login,loggout} from './getLogin.js'
import { renderMap } from './script.js'
import { updateMe,updatePassword} from './updateMe.js'
import pago from './stripe.js'

const map = document.querySelector("#map")
const form = document.querySelector(".form--login")
const logButton=document.querySelector(".nav__el--logout")
const formUserData=document.querySelector(".form--update")
const formUserPassword=document.querySelector(".form-user-password")
const buyBtn=document.querySelector("#buyBtn")

if (map) {
    const locations = JSON.parse(map.dataset.location)
    renderMap(locations)
}

console.log(form);
console.log(formUserData);
if (form) {
    document.querySelector(".form").addEventListener("submit", (e) => {
        e.preventDefault()
        const email = document.querySelector("#email").value
        const password = document.querySelector("#password").value
        console.log(email,password);
        login(email, password)
    })
}

if(logButton){
    logButton.addEventListener('click',loggout)
}

if(formUserData){
    document.querySelector(".form--update").addEventListener('submit',(e)=>{
        e.preventDefault()
        const form=new FormData()
        form.append('name',document.querySelector("#name").value)
        form.append('email',document.querySelector("#email").value)
        form.append('photo',document.querySelector("#photo").files[0])
        updateMe(form)
    })
}

if(formUserPassword){
    formUserPassword.addEventListener('submit',(e)=>{
        e.preventDefault()
        const passwordCurrent=document.querySelector("#password-current")
        const password=document.querySelector("#password")
        const passwordConfirm=document.querySelector("#password-confirm")
        updatePassword(passwordCurrent.value,password.value,passwordConfirm.value)
        passwordCurrent.value=""
        password.value=""
        passwordConfirm.value=""
        
    })
}

if(buyBtn){
    buyBtn.addEventListener('click',()=>{
        buyBtn.textContent="procesing..."
        pago(buyBtn.dataset.tourId)
    })
}