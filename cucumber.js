module.exports = {
    default: {
      require: ["test/resources/features/**/*.ts"],
      requireModule: ["ts-node/register"],
      paths: ["test/resources/features/**/*.feature"]
    },
  };