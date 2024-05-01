CREATE MIGRATION m1udagkfeiy6ysmncaxby7obuxzbhssaxyshygt7mnkohbqfq6gfoq
    ONTO m12kqjhp2h5v4l63dcuplo2qglf25xlsuuzbn5zlsp5qwydx4w2f7a
{
  DROP TYPE default::BlogPost;
  CREATE SCALAR TYPE default::OpenAIEmbedding EXTENDING ext::pgvector::vector<1536>;
  CREATE TYPE default::Section {
      CREATE REQUIRED PROPERTY embedding: default::OpenAIEmbedding;
      CREATE INDEX ext::pgvector::ivfflat_cosine(lists := 1) ON (.embedding);
      CREATE REQUIRED PROPERTY content: std::str;
      CREATE REQUIRED PROPERTY tokens: std::int16;
  };
  DROP EXTENSION ai;
};
