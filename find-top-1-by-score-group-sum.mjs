import { Client } from '@elastic/elasticsearch'

const openaiApiKey = 'your_openai_api_key'
const esClient = new Client({ node: 'http://localhost:9200' })
const indexName = 'my_dense_vector_index'

async function getEmbedding(text) {
    const response = await fetch('https://api.openai.com/v1/embeddings', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.OPENAI_KEY}`
        },
        body: JSON.stringify({
            input: text,
            model: 'text-embedding-3-large',
            dimensions: 1536
        })
    })
    const data = await response.json()
    return data.data[0].embedding
}

async function searchWithVector(text, includeHits = false) {
    const queryVector = await getEmbedding(text)
    const response = await esClient.search({
        index: indexName,
        body: {
            query: {
                script_score: {
                    query: {
                        match_all: {}
                    },
                    script: {
                        source: "cosineSimilarity(params.query_vector, 'vector')",
                        params: {
                            query_vector: queryVector
                        }
                    }
                }
            },
            size: includeHits ? 100 : 0, // Control whether to include individual hits
            min_score: 0.001,
            _source: {
                excludes: ["vector"] // Exclude the 'vector' field globally
            },
            aggs: {
                by_parent: {
                    terms: {
                        field: "parentDoc",
                        size: 1, // Only return the top scoring aggregation
                        order: {
                            "score_sum": "desc" // Order by the sum of scores
                        }
                    },
                    aggs: {
                        score_sum: {
                            sum: {
                                script: {
                                    source: "_score"
                                }
                            }
                        }
                    }
                }
            }
        }
    })

    console.log(JSON.stringify(response, null, '  '))
    console.log(response?.aggregations?.by_parent?.buckets?.[0])
}

// Example usage
searchWithVector('node')