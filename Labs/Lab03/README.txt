Lab 03
Rachel Wong 101184274
Earle Estrella 100907269

Lab Reflection Questions 

1. How have you represented the graph of pages in your database?
Collection : Page
Collection Schema of a Page (document):
  	link: String,
  	outgoing:[String],
  	incoming:[String],
  	content: [String]
    }]
Each page in the database contains its own link, an array of outgoing links, an array of incoming links and content.
The page's own link is a way to keep track of which page it is, which represents a node in a graph.
The array of outgoing links represents outgoing edges from this node to other nodes that this page links to.
The array of incoming links represents incoming edges from other nodes that links to this page.

2. How do you keep track of the incoming/outgoing links during the crawl?
Outgoing links:
When we start crawling the webpage, we will create an array and add all the outgoiong links into the array, we then add the outgoing links array into webpage object.

Incoming Links(links from other websites that point to a specific page):
When we start crawling, we will add the webpage that we are currently crawling to the incoming array of the webpage it links to.

3. Describe the selection policy of your web crawler.
We are doing a breadth first search since we are crawling all the outgoing links of the crawler.
We avoid crawling the same page from initializing a visited array. It stores all link we already visited.

4. Does your crawler store all network information while running and then save it to the
database, or does it update the database after each page is visited? Describe any
advantages/disadvantages of each approach?
The crawler store all network information while running and then save it to the database.
Advantages:
- It is faster than interacting with a database constantly
- It is easier to extract and manipulates with the data

Disadvantage:
- We have to wait for the entire crawl to be completed to be able to query the data in the database.
- We might run out of RAM if there are too many data
- There is a chance of memory loss if there are too much crawling.

Update the database after each page is visited:
Advantages:
-Data is updated continuously.

Disadvantages:
-It might take longer time to finish the program

Demo video: https://www.youtube.com/watch?v=c8S1aG7xR4k