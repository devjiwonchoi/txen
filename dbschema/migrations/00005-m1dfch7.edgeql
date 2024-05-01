CREATE MIGRATION m1dfch7ui4uisygxjw6gvanw2tp7vu55j6xchasj5vn2gqxzcw6pua
    ONTO m1ev565ebykwmynp37jrhbptjtb2tl3veu4g36elouoce57ffb4b3a
{
  ALTER TYPE default::Section {
      DROP INDEX ext::ai::index(embedding_model := 'text-embedding-3-small') ON (.content);
  };
  CREATE SCALAR TYPE default::OpenAIEmbedding EXTENDING ext::pgvector::vector<1536>;
  ALTER TYPE default::Section {
      CREATE PROPERTY embedding: default::OpenAIEmbedding;
  };
  ALTER TYPE default::Section {
      CREATE INDEX ext::pgvector::ivfflat_cosine(lists := 1) ON (.embedding);
      CREATE PROPERTY tokens: std::int16;
  };
  DROP EXTENSION ai;
};
