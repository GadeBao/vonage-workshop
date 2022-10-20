function render() {
    //const state = db.getState()
    //const str = JSON.stringify(state, null, 2)
    document.getElementById('state').innerHTML = str
}

document.getElementById('sendto').onclick = function() {
    render();
}

document.getElementById('verifycheck').onclick = function() {
    render();
}  
