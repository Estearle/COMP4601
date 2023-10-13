window.addEventListener('load', () => {
    document.getElementById("submit").onclick = search;
})

function search(){
    let text = document.getElementById("search").value;
    console.log(text);
    let xhttp = new XMLHttpRequest()
    xhttp.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            let responseItem = JSON.parse(this.responseText)
            console.log(this.responseText);
           
    }
    //Send a POST request to the server with the information
    //in the JSON object.
    xhttp.open("POST", '/search')
    xhttp.setRequestHeader("Content-Type", "application/json");
    xhttp.send(JSON.stringify({"text":text}));
}
}