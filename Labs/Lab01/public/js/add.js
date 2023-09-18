window.addEventListener('load', () => {

    document.getElementById("add").addEventListener("click", addProduct);

});

function addProduct() {
    let name = document.getElementById("name").value;
    let price = Number(document.getElementById("price").value);
    let x = Number(document.getElementById("x").value);
    let y = Number(document.getElementById("y").value);
    let z = Number(document.getElementById("z").value);
    let stock = document.getElementById("stock").value;

    if(name.length === 0 || price.length === 0 || x.length === 0 || y.length === 0|| z.length === 0 || stock.length === 0){
        alert("Missing info.");
        return;
    }
    if(price == false || x == false || y == false|| z == false){
        alert("You can only type numberes.");
        return;
    }

    let newProduct = { "name": name, "price": price, "dimensions": { "x": x, "y": y, "z": z }, "stock": stock };
    fetch(`http://localhost:3000/add`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(newProduct)
    })
        .then((response) => {
            if (!response.ok) {
                throw new Error(`HTTP error: ${response.status}`);
            }
            return response.text();
        })
        .then(() => {
            alert("Product is added successfully");
            location.href = `http://localhost:3000/products`;
        })
        // Catch any errors that might happen, and display a message.
        .catch((error) => console.log(error));

}