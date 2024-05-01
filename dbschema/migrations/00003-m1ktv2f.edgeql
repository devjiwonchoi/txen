CREATE MIGRATION m1ktv2f7wfvigg6iw24ibbjdwcft6jszq7pssjcdoyt6yyobd7fweq
    ONTO m1udagkfeiy6ysmncaxby7obuxzbhssaxyshygt7mnkohbqfq6gfoq
{
  CREATE EXTENSION ai VERSION '1.0';
  ALTER TYPE default::Section {
      ALTER PROPERTY content {
          RESET OPTIONALITY;
      };
  };
  ALTER TYPE default::Section {
      CREATE DEFERRED INDEX ext::ai::index(embedding_model := 'text-embedding-3-small') ON (.content);
  };
  ALTER TYPE default::Section {
      DROP INDEX ext::pgvector::ivfflat_cosine(lists := 1) ON (.embedding);
      DROP PROPERTY embedding;
      DROP PROPERTY tokens;
  };
  DROP SCALAR TYPE default::OpenAIEmbedding;
};
