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

async function indexText(text, parentDoc) {
  const embedding = await getEmbedding(text)
  await esClient.index({
    index: indexName,
    body: {
      vector: embedding,
      parentDoc: parentDoc
    }
  })
}

// Example usage
indexText('Python feels like a toy language', 'parentDocumentPython')