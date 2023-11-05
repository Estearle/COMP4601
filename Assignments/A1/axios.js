const axios = require("axios"); 

// Define the base URL for your server 
const serverUrl = "http://134.117.130.17:3000"; 

// Function to add a database to the search engine.
async function addDatabaseToSearchEngine(databaseName) {
    const requestData = {
        request_url: `${serverUrl}/${databaseName}`,
    };

    try {
        const response = await axios.put(`${serverUrl}/searchengines`, requestData, {
            headers: {
                "Content-Type": "application/json", // Set the content type to JSON
            },
        });

        if (response.status === 201) {
            console.log(`Database "${databaseName}" added successfully.`);
        } else {
            console.error(`Failed to add database "${databaseName}".`);
        }
    } catch (error) {
        console.error(`An error occurred while adding database "${databaseName}":`, error);
    }
}

// Add "fruits" and "personal" databases to the search engine.
addDatabaseToSearchEngine("fruits");
addDatabaseToSearchEngine("personal");