Assignment 01
Rachel Wong 101184274
Earle Estrella 100907269

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

    OpenStack:


    Distrubuted Search Engine:
    

Video Link: 