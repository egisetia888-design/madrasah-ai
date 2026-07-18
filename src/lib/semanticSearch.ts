import { pipeline, env } from '@xenova/transformers';

// Disable remote models for privacy and speed, though we need to download it once
env.allowRemoteModels = true;
env.allowLocalModels = false;

let embedder: any = null;

export async function getEmbedder() {
  if (!embedder) {
    // Using a small, efficient model: all-MiniLM-L6-v2
    // It's ~23MB in ONNX format
    embedder = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');
  }
  return embedder;
}

export async function generateEmbedding(text: string): Promise<number[]> {
  const model = await getEmbedder();
  const output = await model(text, { pooling: 'mean', normalize: true });
  return Array.from(output.data);
}

export function cosineSimilarity(a: number[], b: number[]): number {
  let dotProduct = 0;
  let mA = 0;
  let mB = 0;
  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    mA += a[i] * a[i];
    mB += b[i] * b[i];
  }
  mA = Math.sqrt(mA);
  mB = Math.sqrt(mB);
  const similarity = dotProduct / (mA * mB);
  return similarity;
}

export interface SemanticSearchResult {
  id: string;
  similarity: number;
}

export async function searchSemantic(query: string, items: { id: string, embedding?: number[] }[]): Promise<SemanticSearchResult[]> {
  if (!query.trim()) return [];
  
  const queryEmbedding = await generateEmbedding(query);
  
  const results = items
    .filter(item => item.embedding && item.embedding.length > 0)
    .map(item => ({
      id: item.id,
      similarity: cosineSimilarity(queryEmbedding, item.embedding!)
    }))
    .sort((a, b) => b.similarity - a.similarity)
    .filter(res => res.similarity > 0.5); // Threshold for relevance
    
  return results;
}
