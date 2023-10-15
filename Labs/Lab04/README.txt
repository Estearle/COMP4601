Lab 03
Rachel Wong 101184274
Earle Estrella 100907269

Lab Reflection Questions 
1. How do you load your data from the database to be indexed?
We first created our index and specified the title and content fields to be indexed.After we connect to the mongo database,we add all the documents from the Page schema to the index.

2. What fields do you perform indexing on?
title(N-##),content

3. How is the search score computed?
The array is sorted by title and content fields in descending order. Documents with higher values in the title and content fields will appear first.

4. How scalable is your implementation? How could you improve it?
It might not be scalable because we have to index the whole collection again every time the server starts. We can index the document only if there are new documents.

Demo video: