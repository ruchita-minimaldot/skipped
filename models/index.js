const fs = require("fs");
const path = require("path");
const Sequelize = require("sequelize");
const constants = require("../utils/constants");

const sequelize = new Sequelize("skipped", "skippeddbadmin", "sk123QWE", {
  host: 'skippeddb.cnesuhqixgmp.us-west-1.rds.amazonaws.com',
  dialect: "mysql",
  logging: false,
  benchmark: true,
  pool: {
    max: 50,
  },
});
let db = {};

fs.readdirSync(__dirname)
  .filter(function (file) {
    return file.indexOf(".") !== 0 && file !== "index.js";
  })
  .forEach(function (file) {
    const model = require(path.join(__dirname, file))(
      sequelize,
      Sequelize.DataTypes
    );
    db[model.name] = model;
  });

Object.keys(db).forEach(function (modelName) {
  if ("associate" in db[modelName]) {
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;

db.JobApplication.belongsTo(db.Job, { foreignKey: "jobId", as: "job" });
db.JobProfileScore.belongsTo(db.Job, { foreignKey: "jobId", as: "job" });
db.JobProfileScore.belongsTo(db.Profile, { foreignKey: "profileId", as: "profile" });
