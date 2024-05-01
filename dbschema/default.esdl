using extension pgvector;

module default {
  scalar type OpenAIEmbedding extending
    ext::pgvector::vector<1536>;

  type Section {
    path: str {
      constraint exclusive;
    }
    checksum: str;
    content: str;
    tokens: int16;
    embedding: OpenAIEmbedding;

    index ext::pgvector::ivfflat_cosine(lists := 1)
      on (.embedding);
  }
}