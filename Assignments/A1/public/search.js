document.addEventListener('DOMContentLoaded', () => {
    document.getElementById("submit").onclick = search;
});

function search() {

    const query = document.getElementById("query").value;
    const boost = document.getElementById("boost").checked;
    const limit = document.getElementById("limit").value;
    const database = document.getElementById("database").value;

    const searchURL = `/${database}?q=${encodeURIComponent(query)}&boost=${boost}&limit=${limit}`;
    console.log(searchURL);
    
    // Redirect to the search URL
    window.location.href = searchURL;
}