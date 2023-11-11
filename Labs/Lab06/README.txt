Lab 06
Rachel Wong 101184274
Earle Estrella 100907269

1. The similarity calculation involves a summation for ‘all products that both users have provided ratings for’. How have you handled finding this set of products?

    1. Find the average from each row. Skip when it is -1 and keep counting how many times you have added.
    2. When you compare the same item from both users, if either one is -1, then skip. Otherwise, we update ouor denominator and numerator
    3. divdie the numerator by the denomoinator to get sim(a,b)

2. How have you tried to minimize the runtime complexity of your implementation? Are there any other values you think could be pre-computed or that you could avoid recomputing many times? How?
    Minimizing runtime complexity implemented:
    1. Stored positions of the missing values (-1) from the matrix. 
    This way, no multiple nested for loop is used to search for the position of the missing values and then reinserting the new predicted ratings. 
    This is done because the new predicted ratings should not be added when calculating the similarity scores since it would influence the values.
    
    Other values that could be pre-computed and how it is done.
    1. The average of each user. This can be calculated as the program is reading in the data.
    2. The similarity scores between 2 user can be stored such that user 0 and user 1 is calculated first, then when it reaches user 1 to compare to user 0, it should consider that
       the first comparison between the two users has been done and is stored.

Link: