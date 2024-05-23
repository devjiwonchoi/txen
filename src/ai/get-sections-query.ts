import edgeql from '../../dbschema/edgeql-js'

export const getSectionsQuery = edgeql.params(
  {
    target: edgeql.OpenAIEmbedding,
    matchThreshold: edgeql.float64,
    matchCount: edgeql.int16,
    minContentLength: edgeql.int16,
  },
  (params) => {
    return edgeql.select(edgeql.Section, (section) => {
      const dist = edgeql.ext.pgvector.cosine_distance(
        section.embedding,
        params.target
      )
      return {
        content: true,
        tokens: true,
        dist,
        filter: edgeql.op(
          edgeql.op(edgeql.len(section.content), '>', params.minContentLength),
          'and',
          edgeql.op(dist, '<', params.matchThreshold)
        ),
        order_by: {
          expression: dist,
          empty: edgeql.EMPTY_LAST,
        },
        limit: params.matchCount,
      }
    })
  }
)
