function hideAlert(){
    const el=document.querySelector(".alert")
    if(el)el.remove()
}

export function alert(message,type){
    const template=`<div class="alert alert--${type}">${message}</div>`
    document.querySelector("body").insertAdjacentHTML('afterbegin',template)
    window.setTimeout(hideAlert,8000)
}