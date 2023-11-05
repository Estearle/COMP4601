// window.addEventListener('load', () => {
//     document.getElementById("submit").onclick = search;
// })

// async function search(){

//     // Get the search query from the form.
//     const query = document.getElementById("search").value;
//     const boost = document.getElementById("boost").checked;
//     const limit = document.getElementById("limit").value;

//     const selectedDatabase = document.getElementById("database-select").value;

//     try {
//         // Send a GET request to your server with the search query and selected database.
//         const response = await axios.get(`/${selectedDatabase}?q=${query}&boost=${boost}&limit=${limit}`);
        
//         // Display the search results.
//         displaySearchResults(response.data);
//     } catch (error) {
//         console.error(error);
//     }
// }

// function displaySearchResults(databaseName, results) {
//     // Handle displaying the search results for the specified database.
//     // You can manipulate the DOM to render the results as needed.
//     // For example, you can create a list of search results and append them to a results div.
//     const resultsDiv = document.getElementById("results");

//     // Create a header for the database.
//     const databaseHeader = document.createElement("h2");
//     databaseHeader.innerText = `${databaseName} Results`;

//     // Create a container for the database's results.
//     const databaseResultsContainer = document.createElement("div");
//     databaseResultsContainer.classList.add("database-results");

//     // Iterate through the search results and create HTML elements to display them.
//     results.forEach((result) => {
//         const resultItem = document.createElement("div");

//         resultItem.innerHTML = `
//             <h3>${result.title}</h3>
//             <p>URL: <a href="${result.url}" target="_blank">${result.url}</a></p>
//             <p>Search Score: ${result.score}</p>
//             <p>PageRank: ${result.pr}</p>
//             <p>Details: <a href="/detail/${result.title}" target="_blank">/detail/${result.title}</a></p>
//         `;

//         // Append the resultItem to the databaseResultsContainer.
//         databaseResultsContainer.appendChild(resultItem);
//     });

//     // Append the header and results container to the resultsDiv.
//     resultsDiv.appendChild(databaseHeader);
//     resultsDiv.appendChild(databaseResultsContainer);
// }

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