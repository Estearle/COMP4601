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

3. Describe the selection policy of your web crawler.

4. Does your crawler store all network information while running and then save it to the
database, or does it update the database after each page is visited? Describe any
advantages/disadvantages of each approach?

Demo video: 