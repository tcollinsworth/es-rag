# Elasticsearch RAG example

Tested with ES 8.12 local. Just download ES 8.12, go to the bin directory and execute elastisearch.

The curl scripts contain script to create test index and query docs.

Run the create index script first.

Edit the .env-template script and source it in the terminal where the node scripts will be executed.

index-doc.mjs will call OpenAI text-embedding-3-large and get 1536 dimension embedding and 
index it into the test ES index.

Create a few documents with the index-doc.mjs script

The find-top-1-by-score-group-sum.mjs will take some text, 
get a vector from OpenAI text-embedding-3-large and 
search the ES index to score the top 100 most similar results using the ANN HNSW algo in ES,
and the query will group sum by parentDoc and return only the top parentDoc aggregation.

