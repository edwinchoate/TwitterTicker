// Parse Twitter Data
/*
	1. Get Tweet ID, tweet date, tweet contents, tweet sentiment from csv. Also list of key 'phrases' from sentiment analysis

	2. We need to turn this data into a bunch of keywords that we can display as bubbles.
   	   Each keyword needs a number of times said (bubble size) and associated sentiment FOR THE SELECTED TIME RANGE.
       We already have a list of 'phrases', which we can use as keywords,
       but these don't have dates associated with them...

       ... we might have to do this live. Here's my 2 in the morning idea:

	First we need a straight up list of keywords and mapped to their info. We can make a hashtable, with the keys being
	the 'phrases' the sentiment analysis found. This way, we have a list of keywords already and don't have to 
	figure out which words are important. 

	We then need each key to map to a list of indices of tweets that contain that keyword. We need to do this 
	so that we can -live- figure out the sentiment / size of a keyword bubble, depending on the time range selected. 

	To get this list, we'd have to scan through all the tweets. If we find one with a certain keyword in it, add that
	index to the keyword's index list. If I say 'I want to see the sentiment and size of the #Nepal keyword between july 2
	and august 14', we can figure that out live. 



	The big problem is that this is hella slow to precompute. :/

*/