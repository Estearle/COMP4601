Lab 04
Rachel Wong 101184274
Earle Estrella 100907269

Lab Reflection Questions 
1. How do you load your data from the database to be indexed?
We first created our index and specified the title and content fields to be indexed.After we connect to the mongo database,we add all the documents from the Page schema to the index.

2. What fields do you perform indexing on?
title(N-##),content

3. How is the search score computed?
The search score is computed by Elasticlunr based on the relevance of the search query to the indexed documents. The relevance is determined by factors such as the frequency of query terms in the document, term proximity, and other relevance algorithms implemented by Elasticlunr.

4. How scalable is your implementation? How could you improve it?
It might not be scalable because we have to index the whole collection again every time the server starts. We can index the document only if there are new documents.
To improve scalability, one could consider:
 Implementing pagination to limit the number of results returned at once.
 Implementing caching mechanisms to reduce database and indexing load.
 Optimizing the indexing process for faster data loading.

Demo video:
https://www.youtube.com/watch?v=Oo7fRzYaF70