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
    .then(response => response.json())
    .then(data => {
        const resultsHeading = document.getElementById("resultsHeading");
        const resultsList = document.getElementById("resultsList");

        // Clear any previous results
        resultsHeading.innerHTML = "";
        resultsList.innerHTML = "";

        if (data.results && data.results.length) {
            resultsHeading.textContent = `Search Results for "${data.query}"`;

            data.results.forEach(result => {
                const li = document.createElement("li");
                const a = document.createElement("a");
                a.href = result.pageData.link;
                a.textContent = result.pageData.title;
                li.appendChild(a);
                
                const span = document.createElement("span");
                span.textContent = ` Score: ${result.score}`;
                li.appendChild(span);

                resultsList.appendChild(li);
            });
        } else {
            resultsHeading.textContent = `No results found for "${data.query}"`;
        }
    })
    .catch(error => {
        console.error("Error in search:", error);
    });
}