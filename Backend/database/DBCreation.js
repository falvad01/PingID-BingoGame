const sequelize = require("./DBConnection");

async function createDB() {
  // Define associations

 
  // Sync database structure
  sequelize
    .sync({ alter: true })
    .then(() => {
      console.log("Tables created or updated if changes exist");
    })
    .catch((err) => {
      console.error("Error synchronizing the tables: ", err);
    });
}

module.exports = { createDB };
