window.addEventListener('load', () => {
    document.getElementById("search").onclick = searchName;
    document.getElementById("all").onclick = searchAll;
    document.getElementById("inStock").onclick = searchInStock;
})

//Search by name
function searchName() {
    let name = document.getElementById("name").value;
    let inStock = document.getElementById("checkInStock").checked;
    removeAllChild(document.getElementById("result"));
    //If the user doesn't type anything, alert them 
    if(name.length<1){
        alert("Please input the name of the product you are searching for");
        return;
    }
    let xhttp = new XMLHttpRequest()
    xhttp.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            let responseItem = JSON.parse(this.responseText)
            console.log(this.responseText);
            for (let i in this.responseText) {
                var a = document.createElement('a');
                a.setAttribute('href', `/products/${responseItem[i].id}`);
                a.textContent = responseItem[i].name
                document.getElementById("result").appendChild(a);
                document.getElementById("result").appendChild(document.createElement("br"));
            }
        }
    }
    //Send a POST request to the server with the information
    //in the JSON object.
    xhttp.open("POST", '/search')
    xhttp.setRequestHeader("Content-Type", "application/json");
    xhttp.send(JSON.stringify({ "name": name,"type":"name","checked":inStock }));
}

//Search All Products
function searchAll() {
    removeAllChild(document.getElementById("result"));
    let xhttp = new XMLHttpRequest()
    xhttp.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            let responseItem = JSON.parse(this.responseText)
            console.log(this.responseText);
            for (let i in this.responseText) {
                var a = document.createElement('a');
                a.setAttribute('href', `/products/${responseItem[i].id}`);
                a.textContent = responseItem[i].name
                document.getElementById("result").appendChild(a);
                document.getElementById("result").appendChild(document.createElement("br"));
            }
        }
    }
    //Send a POST request to the server with the information
    //in the JSON object.
    xhttp.open("POST", `/search`)
    xhttp.setRequestHeader("Content-Type", "application/json");
    xhttp.send(JSON.stringify({ "name": "" ,"type":"all","checked":false}));
}

//Search in stock products
function searchInStock() {
    removeAllChild(document.getElementById("result"));
    let xhttp = new XMLHttpRequest()
    xhttp.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            let responseItem = JSON.parse(this.responseText)
            console.log(this.responseText);
            for (let i in this.responseText) {
                var a = document.createElement('a');
                a.setAttribute('href', `/products/${responseItem[i].id}`);
                a.textContent = responseItem[i].name
                document.getElementById("result").appendChild(a);
                document.getElementById("result").appendChild(document.createElement("br"));
            }
        }
    }
    //Send a POST request to the server with the information
    //in the JSON object.
    xhttp.open("POST", "/search")
    xhttp.setRequestHeader("Content-Type", "application/json");
    xhttp.send(JSON.stringify({ "name": "" ,"type":"inStock","checked":false}));
 }

//clear the previous search result 
function removeAllChild(p) {
    while (p.firstChild) {
        p.removeChild(p.firstChild);
    }
}