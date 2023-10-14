window.addEventListener('load', () => {
    document.getElementById("submit").onclick = search;
})

function search(){
    let text = document.getElementById("search").value;
    console.log(text);

    fetch('/search', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ "text": text })
    })
    .then(response => response.text())
    .then(htmlContent => {
        document.open();
        document.write(htmlContent);
        document.close();
        history.pushState({}, '', '/results');
    })
    .catch(error => {
        console.error("Error in search:", error);
    });
}