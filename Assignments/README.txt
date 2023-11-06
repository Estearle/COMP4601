Assignment 01
Rachel Wong 101184274
Earle Estrella 100907269


Potential Discussion Points(Add-on):
    Q1: How does it store the data?
    - It is stored in an array when we crawl. After the crawling is done, we connect to the mongo database, map all the obj from the array to the correspoding schema and add them into the database.
    
Parts Completed:
    Crawler:
    Web crawler capable of crawling fruit example site and personal site.
    Crawled data stored in a database.
    PageRank calculated and values stored for each page in database.

    Search:
    A browser-based interface to allow searching via a webpage
    /fruits and /personal are GET requests for search their respective databases
    Query parameters successfully support different combinations for q string, boost and limit.
    Response can be set to either JSON or HTML where JSON data is an array of search results and includes for each search result: 
        name of group members
        page link
        page score
        page title 
        page rank
    HTML response to search produces a list of results based on the number set by limit where each result includes:
        page title
        original link to the page
        computed score
        calculated page rank
        link to details (includes page title, original link to the page, incoming links to this page, outgoing links from this page and word frequency info)

    OpenStack :
        name: rachelwong
        password:password
        -IP:134.117.129.205
        - the server(server.js) should be running
        - instruction to run the server(if it stopped): node server.js

        URLs the TA should use to query your search engine:
        http://134.117.130.17:3000/personal?q=tapestry
        http://134.117.130.17:3000/personal?q=spirit%20island&limit=5
        http://134.117.130.17:3000/personal?q=mars&limit=15


    Distrubuted Search Engine:
    

Video Link: 