window.addEventListener('load', () => {

    document.getElementById("submit").addEventListener("click", addReview);

});

function addReview() {
    let rating = Number(document.getElementById("rating").value);
    let comment = document.getElementById("comment").value;
    let prodID = document.getElementById("prodID").getAttribute("name");

    if (rating < 1 || rating > 10) {
        alert("Rating should be between 1 and 10.");
    }

    let newReview = {"rating": rating, "comment": comment};
    fetch("http://localhost:3000/products/" + prodID + "/reviews/", {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(newReview)
    })
        .then((response) => {
            if (!response.ok) {
                throw new Error(`HTTP error: ${response.status}`);
            }
            return response.text();
        })
        .then(() => {
            alert("Review is added successfully");
            location.href = "http://localhost:3000/products/" + prodID + "/reviews/";
        })
        // Catch any errors that might happen, and display a message.
        .catch((error) => console.log(error));
}