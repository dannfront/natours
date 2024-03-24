
function a(x,y){
    return function () {
        return x+y
    }
}

const b=a(5,5)
console.log(b);