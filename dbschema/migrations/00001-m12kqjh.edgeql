CREATE MIGRATION m12kqjhp2h5v4l63dcuplo2qglf25xlsuuzbn5zlsp5qwydx4w2f7a
    ONTO initial
{
  CREATE EXTENSION pgvector VERSION '0.5';
  CREATE EXTENSION ai VERSION '1.0';
  CREATE TYPE default::BlogPost {
      CREATE PROPERTY content: std::str;
      CREATE DEFERRED INDEX ext::ai::index(embedding_model := 'text-embedding-3-small') ON (.content);
  };
};
