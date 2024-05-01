CREATE MIGRATION m1ev565ebykwmynp37jrhbptjtb2tl3veu4g36elouoce57ffb4b3a
    ONTO m1ktv2f7wfvigg6iw24ibbjdwcft6jszq7pssjcdoyt6yyobd7fweq
{
  ALTER TYPE default::Section {
      CREATE PROPERTY checksum: std::str;
      CREATE PROPERTY path: std::str {
          CREATE CONSTRAINT std::exclusive;
      };
  };
};
